import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// List Designations
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const designations = db.prepare(`
    SELECT d.*, COUNT(e.id) as employee_count
    FROM designations d
    LEFT JOIN employees e ON d.title = e.designation
    GROUP BY d.id
    ORDER BY d.title ASC
  `).all();
  res.json(designations);
});

// Create Designation
router.post('/', authenticate, requirePermission('Employees', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  const { title, department_name, description, status } = req.body;
  if (!title || !department_name) {
    return res.status(400).json({ error: 'Title and department are required' });
  }

  const id = `DES-${Date.now().toString().slice(-3)}`;
  db.prepare(`
    INSERT INTO designations (id, title, department_name, description, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title, department_name, description || null, status || 'Active');

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Designations',
    id,
    null,
    `Added designation ${title} (${department_name})`
  );

  res.status(201).json({ message: 'Designation created successfully', id });
});

// Update Designation
router.put('/:id', authenticate, requirePermission('Employees', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM designations WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Designation not found' });
  }

  const { title, department_name, description, status } = req.body;

  db.prepare(`
    UPDATE designations SET title = ?, department_name = ?, description = ?, status = ? WHERE id = ?
  `).run(title || old.title, department_name || old.department_name, description !== undefined ? description : old.description, status || old.status, id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE',
    'Designations',
    id,
    old.title,
    title || old.title
  );

  res.json({ message: 'Designation updated successfully' });
});

// Delete Designation
router.delete('/:id', authenticate, requirePermission('Employees', 'manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT title FROM designations WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Designation not found' });
  }

  db.prepare('DELETE FROM designations WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Designations',
    id,
    old.title,
    'Deleted designation'
  );

  res.json({ message: 'Designation deleted successfully' });
});

export default router;
