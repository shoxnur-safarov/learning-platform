import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:courseId/:lessonId', authMiddleware, async (req: AuthRequest, res) => {
  const { courseId, lessonId } = req.params;
  const lesson = await pool.query(
    'SELECT * FROM lessons WHERE id=$1 AND course_id=$2',
    [lessonId, courseId]
  );
  if (!lesson.rows[0]) return res.status(404).json({ error: 'Dars topilmadi' });

  if (!lesson.rows[0].is_preview) {
    const enrolled = await pool.query(
      'SELECT 1 FROM enrollments WHERE user_id=$1 AND course_id=$2',
      [req.user!.id, courseId]
    );
    const isAdmin = req.user!.role === 'admin';
    if (enrolled.rows.length === 0 && !isAdmin) {
      return res.status(403).json({ error: 'Avval kursni sotib oling' });
    }
  }
  res.json(lesson.rows[0]);
});

export default router;