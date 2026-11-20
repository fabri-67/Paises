import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function parseId(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function readNombre(body) {
  return typeof body?.nombre === 'string' ? body.nombre.trim() : '';
}

function nombreInvalido(nombre) {
  if (!nombre) return 'El campo nombre es obligatorio.';
  if (nombre.length > 100) return 'El nombre no puede superar los 100 caracteres.';
  return null;
}

router.get('/', async (_req, res) => {
  const [paises] = await pool.query('SELECT id, nombre FROM paises ORDER BY id');
  res.json(paises);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  const [paises] = await pool.execute(
    'SELECT id, nombre FROM paises WHERE id = ?',
    [id]
  );
  if (paises.length === 0) return res.status(404).json({ error: 'País no encontrado.' });

  res.json(paises[0]);
});

router.post('/', async (req, res) => {
  const nombre = readNombre(req.body);
  const error = nombreInvalido(nombre);
  if (error) return res.status(400).json({ error });

  const [result] = await pool.execute('INSERT INTO paises (nombre) VALUES (?)', [nombre]);
  res.status(201).json({ id: result.insertId, nombre });
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  const nombre = readNombre(req.body);
  const error = nombreInvalido(nombre);
  if (error) return res.status(400).json({ error });

  const [result] = await pool.execute(
    'UPDATE paises SET nombre = ? WHERE id = ?',
    [nombre, id]
  );
  if (result.affectedRows === 0) {
    const [paises] = await pool.execute('SELECT id FROM paises WHERE id = ?', [id]);
    if (paises.length === 0) {
      return res.status(404).json({ error: 'País no encontrado.' });
    }
  }

  res.json({ id, nombre });
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  try {
    const [result] = await pool.execute('DELETE FROM paises WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'País no encontrado.' });
    }
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'No se puede eliminar el país porque tiene provincias asociadas.'
      });
    }
    throw error;
  }

  res.status(204).end();
});

export default router;
