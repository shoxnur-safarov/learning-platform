import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Foydalanuvchining TASDIQLANGAN kurslarini olish
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.created_at as enrolled_at, e.status FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id=$1 ORDER BY e.created_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Kursga so'rov yuborish (status = pending)
router.post('/:courseId', authMiddleware, async (req: AuthRequest, res) => {
  const courseId = parseInt(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ error: "Noto'g'ri ID" });

  try {
    const course = await pool.query('SELECT id FROM courses WHERE id=$1', [courseId]);
    if (!course.rows[0]) return res.status(404).json({ error: 'Kurs topilmadi' });

    // Oldingi so'rov bormi?
    const existing = await pool.query(
      'SELECT status FROM enrollments WHERE user_id=$1 AND course_id=$2',
      [req.user!.id, courseId]
    );
    if (existing.rows[0]) {
      const s = existing.rows[0].status;
      if (s === 'pending') return res.status(400).json({ error: "So'rov allaqachon yuborilgan, admin tasdigini kuting" });
      if (s === 'approved') return res.status(400).json({ error: 'Siz allaqachon bu kursga yozilgansiz' });
      if (s === 'rejected') {
        // Rad etilgan bo'lsa qayta so'rov yuborish mumkin
        await pool.query(
          "UPDATE enrollments SET status='pending', created_at=NOW() WHERE user_id=$1 AND course_id=$2",
          [req.user!.id, courseId]
        );
        return res.json({ ok: true, status: 'pending' });
      }
    }

    await pool.query(
      "INSERT INTO enrollments (user_id, course_id, status) VALUES ($1,$2,'pending')",
      [req.user!.id, courseId]
    );
    res.json({ ok: true, status: 'pending' });
  } catch (e: any) {
    console.error('Yozilish xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Kursga kirish tekshirish (approved bo'lsa true)
router.get('/check/:courseId', authMiddleware, async (req: AuthRequest, res) => {
  const courseId = parseInt(req.params.courseId);
  try {
    const result = await pool.query(
      'SELECT status FROM enrollments WHERE user_id=$1 AND course_id=$2',
      [req.user!.id, courseId]
    );
    res.json({ status: result.rows[0]?.status || null });
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;