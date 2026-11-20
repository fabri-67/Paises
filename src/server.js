import 'dotenv/config';
import app from './app.js';
import pool from './db.js';

const port = Number(process.env.PORT || 3000);

try {
  await pool.query('SELECT 1');
  app.listen(port, () => {
    console.log(`API disponible en http://localhost:${port}`);
  });
} catch (error) {
  console.error('No se pudo conectar con MySQL:', error.message);
  process.exitCode = 1;
  await pool.end();
}
