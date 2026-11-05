import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:courseId/:lessonId', authMiddleware, async (req: AuthRequest, res) => {
  const courseId = parseInt(req.params.courseId);
  const lessonId = parseInt(req.params.lessonId);

  if (isNaN(courseId) || isNaN(lessonId))
    return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  try {
    const lesson = await pool.query(
      'SELECT * FROM lessons WHERE id=$1 AND course_id=$2',
      [lessonId, courseId]
    );
    if (!lesson.rows[0]) return res.status(404).json({ error: 'Dars topilmadi' });

    if (!lesson.rows[0].is_preview) {
      const isAdmin = req.user!.role === 'admin';
      if (!isAdmin) {
        const enrolled = await pool.query(
          "SELECT 1 FROM enrollments WHERE user_id=$1 AND course_id=$2 AND status='approved'",
          [req.user!.id, courseId]
        );
        if (enrolled.rows.length === 0) {
          return res.status(403).json({ error: "Kursga kirish ruxsati yo'q. Admin tasdiqlashini kuting." });
        }
      }
    }

    res.json(lesson.rows[0]);
  } catch (e: any) {
    console.error('Dars xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;