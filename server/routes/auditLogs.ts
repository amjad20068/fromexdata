import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission } from '../auth.js';

const router = Router();

// List Audit Logs
router.get('/', authenticate, requirePermission('Audit Logs', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { module, action, search, limit } = req.query;

  let query = `SELECT * FROM audit_logs WHERE 1=1`;
  const params: any[] = [];

  if (module) {
    query += ` AND module = ?`;
    params.push(module);
  }
  if (action) {
    query += ` AND action = ?`;
    params.push(action);
  }
  if (search) {
    query += ` AND (user_name LIKE ? OR record_id LIKE ? OR old_value LIKE ? OR new_value LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const maxRows = Number(limit) || 100;
  query += ` ORDER BY created_at DESC LIMIT ${maxRows}`;

  const logs = db.prepare(query).all(...params);
  res.json(logs);
});

export default router;
