import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// Get Company Master Settings
router.get('/company', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const settings = db.prepare('SELECT * FROM company_settings WHERE id = 1').get();
  res.json(settings);
});

// Update Company Master Settings (Super Admin only!)
router.put('/company', authenticate, requirePermission('Settings', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'SUPER ADMIN') {
    return res.status(403).json({ error: 'Company master settings can only be edited by Super Admin' });
  }

  const { company_name, logo_url, website, email, phone, address, gst_number, pan, cin, state, state_code, country } = req.body;
  const old = db.prepare('SELECT * FROM company_settings WHERE id = 1').get() as any;

  db.prepare(`
    UPDATE company_settings SET
      company_name = ?, logo_url = ?, website = ?, email = ?, phone = ?, address = ?,
      gst_number = ?, pan = ?, cin = ?, state = ?, state_code = ?, country = ?
    WHERE id = 1
  `).run(
    company_name || old.company_name,
    logo_url || old.logo_url,
    website || old.website,
    email || old.email,
    phone || old.phone,
    address || old.address,
    gst_number || old.gst_number,
    pan || old.pan,
    cin || old.cin,
    state || old.state,
    state_code || old.state_code,
    country || old.country
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE_COMPANY_SETTINGS',
    'Settings',
    'company_settings',
    JSON.stringify(old),
    JSON.stringify(req.body)
  );

  res.json({ message: 'Company settings updated successfully' });
});

// Get Role Permissions Matrix
router.get('/permissions', authenticate, requirePermission('Settings', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const permissions = db.prepare('SELECT * FROM roles_permissions ORDER BY role ASC, module ASC').all();
  res.json(permissions);
});

// Update Role Permission
router.put('/permissions/:id', authenticate, requirePermission('Settings', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'SUPER ADMIN') {
    return res.status(403).json({ error: 'Only Super Admin can modify system role permissions' });
  }

  const { id } = req.params;
  const { can_view, can_create, can_edit, can_delete, can_approve, can_export, can_import, can_manage } = req.body;

  db.prepare(`
    UPDATE roles_permissions SET
      can_view = ?, can_create = ?, can_edit = ?, can_delete = ?,
      can_approve = ?, can_export = ?, can_import = ?, can_manage = ?
    WHERE id = ?
  `).run(
    can_view ? 1 : 0,
    can_create ? 1 : 0,
    can_edit ? 1 : 0,
    can_delete ? 1 : 0,
    can_approve ? 1 : 0,
    can_export ? 1 : 0,
    can_import ? 1 : 0,
    can_manage ? 1 : 0,
    id
  );

  res.json({ message: 'Permission updated successfully' });
});

export default router;
