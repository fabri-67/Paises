# CRUD de países y provincias

API REST con Node.js, Express y MySQL. La base de datos se llama `Paises`; cada provincia pertenece a un país y no se puede eliminar un país mientras tenga provincias asociadas.

## Requisitos

- Node.js 18 o posterior
- MySQL

## Configuración

1. Crear las tablas ejecutando `database/schema.sql` en MySQL:

   ```sh
   mysql -u root -p < database/schema.sql
   ```

2. Instalar dependencias:

   ```sh
   npm install
   ```

3. Copiar `.env.example` a `.env` y configurar el usuario y la contraseña de MySQL.
4. Iniciar la API:

   ```sh
   npm start
   ```

La API escucha en `http://localhost:3000` por defecto. Se puede cambiar el puerto con `PORT`.

## Endpoints

Los endpoints aceptan y devuelven JSON. Para las operaciones de creación y actualización, enviar `Content-Type: application/json`.

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/paises` | Listar países |
| GET | `/api/paises/:id` | Obtener un país |
| POST | `/api/paises` | Crear país |
| PUT | `/api/paises/:id` | Actualizar país |
| DELETE | `/api/paises/:id` | Eliminar país |
| GET | `/api/provincias` | Listar provincias con su país |
| GET | `/api/provincias/:id` | Obtener una provincia con su país |
| POST | `/api/provincias` | Crear provincia |
| PUT | `/api/provincias/:id` | Actualizar provincia |
| DELETE | `/api/provincias/:id` | Eliminar provincia |

Ejemplos de cuerpos:

```json
{ "nombre": "Argentina" }
```

```json
{ "nombre": "Buenos Aires", "pais_id": 1 }
```

La eliminación de un país con provincias asociadas responde con HTTP `409`. Una provincia solo puede crearse o actualizarse si el `pais_id` existe.
