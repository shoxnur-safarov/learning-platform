import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware, adminOnly);

// --- Kurslar ---

router.get('/courses', async (_req, res) => {
  try {
    const courses = await pool.query('SELECT * FROM courses ORDER BY id DESC');
    const lessons = await pool.query(
      'SELECT id,course_id,title,content,video_url,order_index,is_preview,challenge,lesson_type FROM lessons ORDER BY order_index'
    );
    const lessonsByCourse: Record<number, any[]> = {};
    for (const l of lessons.rows) {
      if (!lessonsByCourse[l.course_id]) lessonsByCourse[l.course_id] = [];
      lessonsByCourse[l.course_id].push(l);
    }
    const result = courses.rows.map(c => ({ ...c, lessons: lessonsByCourse[c.id] || [] }));
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.post('/courses', async (req: AuthRequest, res) => {
  const { title, description, price, image_url, level, duration_hours } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 2)
    return res.status(400).json({ error: 'Kurs nomi kerak (kamida 2 belgi)' });

  try {
    const result = await pool.query(
      `INSERT INTO courses (title,description,price,image_url,level,duration_hours)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        title.trim(),
        description?.trim() ?? '',
        Number(price) || 0,
        image_url?.trim() ?? null,
        level ?? 'beginner',
        Number(duration_hours) || 0
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    console.error('Kurs yaratish xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.put('/courses/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  const { title, description, price, image_url, level, duration_hours } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length < 2)
    return res.status(400).json({ error: 'Kurs nomi kerak' });

  try {
    const result = await pool.query(
      `UPDATE courses SET title=$1,description=$2,price=$3,image_url=$4,level=$5,duration_hours=$6
       WHERE id=$7 RETURNING *`,
      [title.trim(), description?.trim() ?? '', Number(price) || 0, image_url?.trim() ?? null, level ?? 'beginner', Number(duration_hours) || 0, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Kurs topilmadi' });
    res.json(result.rows[0]);
  } catch (e: any) {
    console.error('Kurs yangilash xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  try {
    await pool.query('DELETE FROM courses WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (e: any) {
    console.error('Kurs o\'chirish xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// --- Darslar ---

router.post('/courses/:courseId/lessons', async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  const { title, content, video_url, is_preview, challenge, solution, lesson_type } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length < 2)
    return res.status(400).json({ error: 'Dars nomi kerak' });

  try {
    // Avtomatik order_index: oxirgi darsdan keyin
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) as max_order FROM lessons WHERE course_id=$1',
      [courseId]
    );
    const nextOrder = maxOrder.rows[0].max_order + 1;

    const result = await pool.query(
      `INSERT INTO lessons (course_id,title,content,video_url,order_index,is_preview,challenge,solution,lesson_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [courseId, title.trim(), content?.trim() ?? '', video_url?.trim() ?? null, nextOrder, is_preview ?? false, challenge?.trim() ?? null, solution?.trim() ?? null, lesson_type ?? 'video']
    );
    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    console.error('Dars yaratish xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.put('/lessons/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  const { title, content, video_url, order_index, is_preview, challenge, solution, lesson_type } = req.body;

  try {
    const result = await pool.query(
      `UPDATE lessons SET title=$1,content=$2,video_url=$3,order_index=$4,is_preview=$5,challenge=$6,solution=$7,lesson_type=$8
       WHERE id=$9 RETURNING *`,
      [title?.trim(), content?.trim() ?? '', video_url?.trim() ?? null, Number(order_index) || 0, is_preview ?? false, challenge?.trim() ?? null, solution?.trim() ?? null, lesson_type ?? 'video', id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Dars topilmadi' });
    res.json(result.rows[0]);
  } catch (e: any) {
    console.error('Dars yangilash xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.delete('/lessons/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  try {
    await pool.query('DELETE FROM lessons WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (e: any) {
    console.error('Dars o\'chirish xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// --- Enrollment so'rovlari ---

router.get('/enrollments', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.status, e.created_at,
              u.id as user_id, u.name as user_name, u.email as user_email,
              c.id as course_id, c.title as course_title
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.put('/enrollments/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Noto'g'ri ID" });
  try {
    await pool.query("UPDATE enrollments SET status='approved' WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.put('/enrollments/:id/reject', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Noto'g'ri ID" });
  try {
    await pool.query("UPDATE enrollments SET status='rejected' WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// --- Foydalanuvchilar ---

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,email,name,role,created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (e: any) {
    console.error('Foydalanuvchilar xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;