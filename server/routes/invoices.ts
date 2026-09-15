import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// List Invoices
router.get('/', authenticate, requirePermission('Invoices', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { payment_status, search } = req.query;

  let query = `SELECT * FROM invoices WHERE 1=1`;
  const params: any[] = [];

  if (payment_status) {
    query += ` AND payment_status = ?`;
    params.push(payment_status);
  }
  if (search) {
    query += ` AND (invoice_number LIKE ? OR customer_name LIKE ? OR gst_number LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY invoice_date DESC, created_at DESC`;

  const invoices = db.prepare(query).all(...params) as any[];

  // Attach items count and items
  const fullInvoices = invoices.map(inv => {
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
    return { ...inv, items };
  });

  res.json(fullInvoices);
});

// Single Invoice with line items & company header
router.get('/:id', authenticate, requirePermission('Invoices', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as any;
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);
  const company = db.prepare('SELECT * FROM company_settings WHERE id = 1').get();

  res.json({ invoice, items, company });
});

// Create Invoice with Items and Auto GST
router.post('/', authenticate, requirePermission('Invoices', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const {
    invoice_number, invoice_date, due_date, customer_name, customer_email,
    customer_address, gst_number, gst_rate, discount, payment_status, notes, items, is_interstate,
    contract_type, billing_frequency
  } = req.body;

  if (!customer_name || !invoice_date || !items || !items.length) {
    return res.status(400).json({ error: 'Customer name, date, and line items are required' });
  }

  // Calculate item amounts & total taxable
  let taxableAmount = 0;
  const lineItems = items.map((item: any, idx: number) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    const amount = Number((qty * rate).toFixed(2));
    taxableAmount += amount;
    return {
      id: `ITEM-${Date.now()}-${idx}`,
      description: item.description,
      quantity: qty,
      rate,
      amount
    };
  });

  const disc = Number(discount) || 0;
  const netTaxable = Math.max(0, taxableAmount - disc);
  const rateGst = Number(gst_rate || 18);
  const totalTax = Number(((netTaxable * rateGst) / 100).toFixed(2));

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (is_interstate) {
    igst = totalTax;
  } else {
    cgst = Number((totalTax / 2).toFixed(2));
    sgst = Number((totalTax / 2).toFixed(2));
  }

  const grandTotal = Number((netTaxable + totalTax).toFixed(2));
  const id = `INV-${Date.now().toString().slice(-4)}`;
  const invNumber = invoice_number || `FX-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, invoice_date, due_date, customer_name, customer_email,
        customer_address, gst_number, taxable_amount, gst_rate, cgst, sgst, igst,
        discount, grand_total, payment_status, notes, contract_type, billing_frequency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, invNumber, invoice_date, due_date || invoice_date, customer_name, customer_email || null,
      customer_address || null, gst_number || null, netTaxable, rateGst, cgst, sgst, igst,
      disc, grandTotal, payment_status || 'Sent', notes || null,
      contract_type || 'SaaS Subscription', billing_frequency || 'Annual'
    );

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    lineItems.forEach((li: any) => {
      insertItem.run(li.id, id, li.description, li.quantity, li.rate, li.amount);
    });
  });

  tx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Invoices',
    id,
    null,
    `Created invoice ${invNumber} for ${customer_name} (₹${grandTotal.toLocaleString('en-IN')})`
  );

  res.status(201).json({ message: 'Invoice created successfully', id, invoice_number: invNumber });
});

// Update Invoice Status (e.g. Paid, Partially Paid, Overdue)
router.patch('/:id/status', authenticate, requirePermission('Invoices', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { payment_status, account_id } = req.body;

  const old = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE invoices SET payment_status = ? WHERE id = ?').run(payment_status, id);

    // If marked as Paid, record incoming credit to company account!
    if (payment_status === 'Paid' && old.payment_status !== 'Paid') {
      const accId = account_id || 'ACC-001';
      const acc = db.prepare('SELECT current_balance FROM company_accounts WHERE id = ?').get(accId) as any;
      if (acc) {
        const newBal = acc.current_balance + old.grand_total;
        db.prepare('UPDATE company_accounts SET current_balance = ? WHERE id = ?').run(newBal, accId);

        const txnId = `TXN-${id}`;
        db.prepare(`
          INSERT INTO account_transactions (id, account_id, type, amount, reference_type, reference_id, description, balance_after, transaction_date)
          VALUES (?, ?, 'Credit', ?, 'Invoice', ?, ?, ?, ?)
        `).run(txnId, accId, old.grand_total, id, `Client payment received for Invoice ${old.invoice_number}`, newBal, new Date().toISOString().split('T')[0]);
      }
    }
  });

  tx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'STATUS_UPDATE',
    'Invoices',
    id,
    old.payment_status,
    payment_status
  );

  res.json({ message: `Invoice status updated to ${payment_status}` });
});

// Delete Invoice
router.delete('/:id', authenticate, requirePermission('Invoices', 'delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM invoices WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Invoices',
    id,
    null,
    'Invoice deleted'
  );

  res.json({ message: 'Invoice deleted' });
});

export default router;
