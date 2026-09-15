import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// List Departments
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const departments = db.prepare(`
    SELECT d.*, COUNT(e.id) as employee_count
    FROM departments d
    LEFT JOIN employees e ON d.name = e.department
    GROUP BY d.id
    ORDER BY d.name ASC
  `).all();
  res.json(departments);
});

// Create Department
router.post('/', authenticate, requirePermission('Employees', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  const { name, head_name, description, status } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Department name is required' });
  }

  const existing = db.prepare('SELECT id FROM departments WHERE name = ?').get(name);
  if (existing) {
    return res.status(400).json({ error: 'Department name already exists' });
  }

  const id = `DEP-${Date.now().toString().slice(-3)}`;
  db.prepare(`
    INSERT INTO departments (id, name, head_name, description, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, head_name || null, description || null, status || 'Active');

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Departments',
    id,
    null,
    `Added department ${name}`
  );

  res.status(201).json({ message: 'Department created successfully', id });
});

// Update Department
router.put('/:id', authenticate, requirePermission('Employees', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM departments WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Department not found' });
  }

  const { name, head_name, description, status } = req.body;

  db.prepare(`
    UPDATE departments SET name = ?, head_name = ?, description = ?, status = ? WHERE id = ?
  `).run(name || old.name, head_name !== undefined ? head_name : old.head_name, description !== undefined ? description : old.description, status || old.status, id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE',
    'Departments',
    id,
    old.name,
    name || old.name
  );

  res.json({ message: 'Department updated successfully' });
});

// Delete Department
router.delete('/:id', authenticate, requirePermission('Employees', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT name FROM departments WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Department not found' });
  }

  // Check if employees assigned
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees WHERE department = ?').get(old.name) as any;
  if (empCount.count > 0) {
    return res.status(400).json({ error: `Cannot delete department '${old.name}' because ${empCount.count} employees are currently assigned to it.` });
  }

  db.prepare('DELETE FROM departments WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Departments',
    id,
    old.name,
    'Deleted department'
  );

  res.json({ message: 'Department deleted successfully' });
});

export default router;
