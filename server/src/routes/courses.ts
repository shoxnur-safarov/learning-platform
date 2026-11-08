import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id DESC');
    res.json(result.rows);
  } catch (e: any) {
    console.error('Kurslar xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Noto\'g\'ri ID' });

  try {
    const course = await pool.query('SELECT * FROM courses WHERE id=$1', [id]);
    if (!course.rows[0]) return res.status(404).json({ error: 'Kurs topilmadi' });

    const lessons = await pool.query(
      'SELECT id,title,content,video_url,order_index,is_preview,challenge,lesson_type FROM lessons WHERE course_id=$1 ORDER BY order_index',
      [id]
    );
    res.json({ ...course.rows[0], lessons: lessons.rows });
  } catch (e: any) {
    console.error('Kurs xatosi:', e.message);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;