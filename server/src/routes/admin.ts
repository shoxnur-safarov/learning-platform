import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware, adminOnly);

router.post('/courses', async (req: AuthRequest, res) => {
  const { title, description, price, image_url, level, duration_hours } = req.body;
  const result = await pool.query(
    `INSERT INTO courses (title,description,price,image_url,level,duration_hours)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [title, description, price ?? 0, image_url, level ?? 'beginner', duration_hours ?? 0]
  );
  res.json(result.rows[0]);
});

router.put('/courses/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, description, price, image_url, level, duration_hours } = req.body;
  const result = await pool.query(
    `UPDATE courses SET title=$1,description=$2,price=$3,image_url=$4,level=$5,duration_hours=$6
     WHERE id=$7 RETURNING *`,
    [title, description, price, image_url, level, duration_hours, id]
  );
  res.json(result.rows[0]);
});

router.delete('/courses/:id', async (req, res) => {
  await pool.query('DELETE FROM courses WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

router.post('/courses/:courseId/lessons', async (req, res) => {
  const { courseId } = req.params;
  const { title, content, video_url, order_index, is_preview } = req.body;
  const result = await pool.query(
    `INSERT INTO lessons (course_id,title,content,video_url,order_index,is_preview)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [courseId, title, content, video_url, order_index ?? 0, is_preview ?? false]
  );
  res.json(result.rows[0]);
});

router.delete('/lessons/:id', async (req, res) => {
  await pool.query('DELETE FROM lessons WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

router.get('/users', async (_req, res) => {
  const result = await pool.query(
    'SELECT id,email,name,role,created_at FROM users ORDER BY id'
  );
  res.json(result.rows);
});

export default router;