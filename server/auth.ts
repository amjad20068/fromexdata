import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'fromex_healthtech_super_secure_jwt_secret_2026';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  employee_id: string | null;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Also check cookie if available
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = payload;
  next();
}

export function checkPermission(role: string, module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'import' | 'manage'): boolean {
  if (role === 'SUPER ADMIN') return true;

  const colMap = {
    view: 'can_view',
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
    approve: 'can_approve',
    export: 'can_export',
    import: 'can_import',
    manage: 'can_manage'
  };

  const col = colMap[action];
  if (!col) return false;

  const perm = db.prepare(`SELECT ${col} as allowed FROM roles_permissions WHERE role = ? AND module = ?`).get(role, module) as { allowed?: number };
  return perm ? Boolean(perm.allowed) : false;
}

export function requirePermission(module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'import' | 'manage') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Role-based authorization
    if (req.user.role === 'SUPER ADMIN') {
      return next();
    }

    const allowed = checkPermission(req.user.role, module, action);
    if (!allowed) {
      return res.status(403).json({ error: `Permission Denied: You do not have '${action}' permission for '${module}'` });
    }

    next();
  };
}

export function recordAuditLog(
  userId: string | null,
  userName: string | null,
  action: string,
  module: string,
  recordId: string | null,
  oldValue: any,
  newValue: any
) {
  try {
    const id = `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const oldStr = oldValue ? (typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue)) : null;
    const newStr = newValue ? (typeof newValue === 'string' ? newValue : JSON.stringify(newValue)) : null;

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, module, record_id, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userName || 'System User', action, module, recordId, oldStr, newStr);
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}

export function maskBankAccount(accNo: string | null | undefined): string {
  if (!accNo) return '••••••••';
  if (accNo.length <= 4) return accNo;
  return '••••' + accNo.slice(-4);
}
