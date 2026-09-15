import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticate, AuthenticatedRequest, recordAuditLog } from '../auth.js';

const router = Router();

// Login
router.post('/login', (req, res: Response) => {
  const { username, password, rememberMe } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const user = db.prepare(`
    SELECT u.*, e.first_name, e.last_name, e.avatar_url, e.department, e.designation
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE (u.username = ? OR u.email = ?) AND u.status = 'Active'
  `).get(username, username) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    employee_id: user.employee_id,
    first_name: user.first_name || user.username,
    last_name: user.last_name || '',
    avatar_url: user.avatar_url || ''
  };

  const token = generateToken(payload);

  recordAuditLog(user.id, `${payload.first_name} ${payload.last_name}`.trim(), 'LOGIN', 'Auth', user.id, null, 'User logged in');

  res.json({
    token,
    user: {
      ...payload,
      department: user.department,
      designation: user.designation
    }
  });
});

// Quick Switch Role (for interactive testing / evaluation of RBAC)
router.post('/switch-role', (req, res: Response) => {
  const { role } = req.body;
  const validRoles = ['SUPER ADMIN', 'HR / ADMIN', 'ACCOUNTS', 'MANAGER', 'EMPLOYEE'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  const user = db.prepare(`
    SELECT u.*, e.first_name, e.last_name, e.avatar_url, e.department, e.designation
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.role = ? AND u.status = 'Active'
    LIMIT 1
  `).get(role) as any;

  if (!user) {
    return res.status(404).json({ error: `No active user found with role ${role}` });
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    employee_id: user.employee_id,
    first_name: user.first_name || user.username,
    last_name: user.last_name || '',
    avatar_url: user.avatar_url || ''
  };

  const token = generateToken(payload);

  res.json({
    token,
    user: {
      ...payload,
      department: user.department,
      designation: user.designation
    }
  });
});

// Current Authenticated User
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.prepare(`
    SELECT u.id, u.username, u.email, u.role, u.employee_id, u.status,
           e.first_name, e.last_name, e.avatar_url, e.department, e.designation, e.phone
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.id = ?
  `).get(req.user.id) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Fetch permissions for this role
  const permissions = db.prepare(`
    SELECT module, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_import, can_manage
    FROM roles_permissions
    WHERE role = ?
  `).all(user.role);

  res.json({
    user,
    permissions
  });
});

export default router;
