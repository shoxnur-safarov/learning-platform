import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Darsni olish (sequential lock bilan)
router.get('/:courseId/:lessonId', authMiddleware, async (req: AuthRequest, res) => {
  const courseId = parseInt(req.params.courseId);
  const lessonId = parseInt(req.params.lessonId);

  if (isNaN(courseId) || isNaN(lessonId))
    return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  const isAdmin = req.user!.role === 'admin';
  const userId = req.user!.id;

  try {
    const lesson = await pool.query(
      'SELECT * FROM lessons WHERE id=$1 AND course_id=$2',
      [lessonId, courseId]
    );
    if (!lesson.rows[0]) return res.status(404).json({ error: 'Dars topilmadi' });

    const l = lesson.rows[0];

    // Enrollment tekshirish (preview darslar uchun shart emas)
    if (!l.is_preview && !isAdmin) {
      const enrolled = await pool.query(
        "SELECT 1 FROM enrollments WHERE user_id=$1 AND course_id=$2 AND status='approved'",
        [userId, courseId]
      );
      if (enrolled.rows.length === 0) {
        return res.status(403).json({ error: "Kursga kirish ruxsati yo'q. Admin tasdiqlashini kuting." });
      }
    }

    // Sequential lock: oldingi dars tugatilganmi?
    if (!isAdmin && l.order_index > 0) {
      const prevLesson = await pool.query(
        'SELECT id FROM lessons WHERE course_id=$1 AND order_index < $2 ORDER BY order_index DESC LIMIT 1',
        [courseId, l.order_index]
      );
      if (prevLesson.rows[0]) {
        const completed = await pool.query(
          'SELECT 1 FROM lesson_completions WHERE user_id=$1 AND lesson_id=$2',
          [userId, prevLesson.rows[0].id]
        );
        if (completed.rows.length === 0) {
          return res.status(403).json({ error: "Avvalgi darsni tugatmadingiz!" });
        }
      }
    }

    // Completion statusini ham qaytaramiz
    const completion = await pool.query(
      'SELECT 1 FROM lesson_completions WHERE user_id=$1 AND lesson_id=$2',
      [userId, lessonId]
    );

    res.json({ ...l, completed: completion.rows.length > 0 });
  } catch (e: any) {
    console.error('Dars xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Darsni tugatish
router.post('/:courseId/:lessonId/complete', authMiddleware, async (req: AuthRequest, res) => {
  const courseId = parseInt(req.params.courseId);
  const lessonId = parseInt(req.params.lessonId);
  const userId = req.user!.id;

  if (isNaN(courseId) || isNaN(lessonId))
    return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  try {
    await pool.query(
      'INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, lessonId]
    );
    res.json({ ok: true });
  } catch (e: any) {
    console.error('Complete xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Kurs uchun barcha tugatilgan darslar
router.get('/:courseId/completions/my', authMiddleware, async (req: AuthRequest, res) => {
  const courseId = parseInt(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });
  const userId = req.user!.id;

  try {
    const result = await pool.query(
      `SELECT lc.lesson_id FROM lesson_completions lc
       JOIN lessons l ON l.id = lc.lesson_id
       WHERE lc.user_id=$1 AND l.course_id=$2`,
      [userId, courseId]
    );
    res.json(result.rows.map(r => r.lesson_id));
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;