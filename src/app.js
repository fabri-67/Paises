import express from 'express';
import paisesRouter from './routes/paises.js';
import provinciasRouter from './routes/provincias.js';

const app = express();

app.use(express.json());
app.use('/api/paises', paisesRouter);
app.use('/api/provincias', provinciasRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es JSON válido.' });
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});

export default app;
