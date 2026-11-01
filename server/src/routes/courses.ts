import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await pool.query('SELECT * FROM courses ORDER BY id DESC');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const course = await pool.query('SELECT * FROM courses WHERE id=$1', [id]);
  if (!course.rows[0]) return res.status(404).json({ error: 'Kurs topilmadi' });
  const lessons = await pool.query(
    'SELECT id,title,order_index,is_preview FROM lessons WHERE course_id=$1 ORDER BY order_index',
    [id]
  );
  res.json({ ...course.rows[0], lessons: lessons.rows });
});

export default router;