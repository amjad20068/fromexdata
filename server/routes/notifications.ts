import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../auth.js';

const router = Router();

// List Notifications
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id IS NULL OR user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(userId);

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE (user_id IS NULL OR user_id = ?) AND is_read = 0
  `).get(userId) as any;

  res.json({
    notifications,
    unreadCount: unreadCount?.count || 0
  });
});

// Mark Single Notification as Read
router.patch('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  res.json({ message: 'Marked as read' });
});

// Mark All as Read
router.post('/mark-all-read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id IS NULL OR user_id = ?').run(userId);
  res.json({ message: 'All notifications marked as read' });
});

// Clear All
router.delete('/clear-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  db.prepare('DELETE FROM notifications WHERE user_id = ? OR (user_id IS NULL AND is_read = 1)').run(userId);
  res.json({ message: 'Notifications cleared' });
});

export default router;
