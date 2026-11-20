import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function parseId(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function readProvincia(body) {
  const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
  const paisId = parseId(body?.pais_id);
  return { nombre, paisId };
}

function errorProvincia(provincia) {
  if (!provincia.nombre) return 'El campo nombre es obligatorio.';
  if (provincia.nombre.length > 100) return 'El nombre no puede superar los 100 caracteres.';
  if (!provincia.paisId) return 'El campo pais_id es obligatorio y debe ser un entero positivo.';
  return null;
}

router.get('/', async (_req, res) => {
  const [provincias] = await pool.query(
    `SELECT provincias.id, provincias.nombre, provincias.pais_id, paises.nombre AS pais
     FROM provincias
     INNER JOIN paises ON paises.id = provincias.pais_id
     ORDER BY provincias.id`
  );
  res.json(provincias);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  const [provincias] = await pool.execute(
    `SELECT provincias.id, provincias.nombre, provincias.pais_id, paises.nombre AS pais
     FROM provincias
     INNER JOIN paises ON paises.id = provincias.pais_id
     WHERE provincias.id = ?`,
    [id]
  );
  if (provincias.length === 0) {
    return res.status(404).json({ error: 'Provincia no encontrada.' });
  }

  res.json(provincias[0]);
});

router.post('/', async (req, res) => {
  const provincia = readProvincia(req.body);
  const error = errorProvincia(provincia);
  if (error) return res.status(400).json({ error });

  try {
    const [result] = await pool.execute(
      'INSERT INTO provincias (nombre, pais_id) VALUES (?, ?)',
      [provincia.nombre, provincia.paisId]
    );
    return res.status(201).json({
      id: result.insertId,
      nombre: provincia.nombre,
      pais_id: provincia.paisId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El país indicado no existe.' });
    }
    throw error;
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  const provincia = readProvincia(req.body);
  const error = errorProvincia(provincia);
  if (error) return res.status(400).json({ error });

  try {
    const [result] = await pool.execute(
      'UPDATE provincias SET nombre = ?, pais_id = ? WHERE id = ?',
      [provincia.nombre, provincia.paisId, id]
    );
    if (result.affectedRows === 0) {
      const [provincias] = await pool.execute(
        'SELECT id FROM provincias WHERE id = ?',
        [id]
      );
      if (provincias.length === 0) {
        return res.status(404).json({ error: 'Provincia no encontrada.' });
      }
    }
    return res.json({
      id,
      nombre: provincia.nombre,
      pais_id: provincia.paisId
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El país indicado no existe.' });
    }
    throw error;
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  const [result] = await pool.execute('DELETE FROM provincias WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Provincia no encontrada.' });
  }

  res.status(204).end();
});

export default router;
