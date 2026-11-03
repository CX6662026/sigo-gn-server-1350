# SIGO-GN - Servidor de Expedientes

## Descripción
Backend desarrollado con Node.js y Express para administrar expedientes mediante archivos JSON.

## Instalación
Ejecutar:

npm install

## Iniciar servidor
Ejecutar:

npm run dev

El servidor funciona en http://localhost:4000

## Rutas disponibles
- GET /expedientes: consultar todos los expedientes.
- POST /expedientes: registrar un expediente.
- GET /expedientes/:folio: consultar uno.
- PUT /expedientes/:folio: actualizar un expediente.
- DELETE /expedientes/:folio: eliminar un expediente.

Los expedientes se almacenan en data/expedientes.