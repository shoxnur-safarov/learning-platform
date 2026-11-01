import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT c.*, e.created_at as enrolled_at FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.user_id=$1 ORDER BY e.created_at DESC`,
    [req.user!.id]
  );
  res.json(result.rows);
});

router.post('/:courseId', authMiddleware, async (req: AuthRequest, res) => {
  const { courseId } = req.params;
  try {
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2)',
      [req.user!.id, courseId]
    );
    res.json({ ok: true });
  } catch (e: any) {
    if (e.code === '23505') return res.status(400).json({ error: 'Allaqachon sotib olingan' });
    res.status(500).json({ error: 'Xato' });
  }
});

export default router;