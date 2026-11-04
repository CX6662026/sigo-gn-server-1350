
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Configuración
app.use(cors());
app.use(express.json());

// Carpeta donde se guardarán los expedientes
const carpetaExpedientes = path.join(__dirname, "data", "expedientes");

// Crear la carpeta si no existe
if (!fs.existsSync(carpetaExpedientes)) {
    fs.mkdirSync(carpetaExpedientes, { recursive: true });
}

// Obtener todos los expedientes
app.get("/expedientes", (req, res) => {
    try {
        const archivos = fs.readdirSync(carpetaExpedientes);

        const expedientes = archivos
            .filter(archivo => archivo.endsWith(".json"))
            .map(archivo => {
                const contenido = fs.readFileSync(
                    path.join(carpetaExpedientes, archivo),
                    "utf8"
                );
                return JSON.parse(contenido);
            });

        res.json(expedientes);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener expedientes"
        });
    }
});

// Buscar expedientes por texto
// IMPORTANTE: esta ruta debe ir antes de /expedientes/:folio
app.get("/expedientes/buscar", (req, res) => {
    try {
        const texto = (req.query.texto || "").toLowerCase();

        const archivos = fs.readdirSync(carpetaExpedientes);

        const expedientes = archivos
            .filter(archivo => archivo.endsWith(".json"))
            .map(archivo => {
                const contenido = fs.readFileSync(
                    path.join(carpetaExpedientes, archivo),
                    "utf8"
                );
                return JSON.parse(contenido);
            });

        const resultados = expedientes.filter(expediente => {
            const folio = String(expediente.folio || "").toLowerCase();
            const operativo = String(
                expediente.nombreOperativo ||
                expediente.operativo ||
                expediente.nombre ||
                ""
            ).toLowerCase();
            const descripcion = String(
                expediente.descripcion || ""
            ).toLowerCase();

            return (
                folio.includes(texto) ||
                operativo.includes(texto) ||
                descripcion.includes(texto)
            );
        });

        res.json(resultados);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al buscar expedientes"
        });
    }
});

// Registrar un expediente
app.post("/expedientes", (req, res) => {
    try {
        const expediente = req.body;

        if (!expediente.folio) {
            return res.status(400).json({
                mensaje: "El folio es obligatorio"
            });
        }

        const rutaArchivo = path.join(
            carpetaExpedientes,
            `${expediente.folio}.json`
        );

        if (fs.existsSync(rutaArchivo)) {
            return res.status(409).json({
                mensaje: "El folio ya existe"
            });
        }

        const fechaActual = new Date().toISOString();

        const nuevoExpediente = {
            ...expediente,
            estatus: expediente.estatus || "Abierto",
            prioridad: expediente.prioridad || "Media",
            fechaCreacion: expediente.fechaCreacion || fechaActual,
            fechaModificacion: expediente.fechaModificacion || fechaActual
        };

        fs.writeFileSync(
            rutaArchivo,
            JSON.stringify(nuevoExpediente, null, 2),
            "utf8"
        );

        res.status(201).json({
            mensaje: "Expediente registrado correctamente",
            expediente: nuevoExpediente
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar expediente"
        });
    }
});

// Consultar un expediente por folio
app.get("/expedientes/:folio", (req, res) => {
    const rutaArchivo = path.join(
        carpetaExpedientes,
        `${req.params.folio}.json`
    );

    if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
            mensaje: "Expediente no encontrado"
        });
    }

    const contenido = fs.readFileSync(rutaArchivo, "utf8");
    res.json(JSON.parse(contenido));
});

// Actualizar un expediente
app.put("/expedientes/:folio", (req, res) => {
    try {
        const rutaArchivo = path.join(
            carpetaExpedientes,
            `${req.params.folio}.json`
        );

        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({
                mensaje: "Expediente no encontrado"
            });
        }

        const contenido = fs.readFileSync(rutaArchivo, "utf8");
        const expedienteAnterior = JSON.parse(contenido);

        const expedienteActualizado = {
            ...expedienteAnterior,
            ...req.body,
            folio: req.params.folio,
            fechaCreacion: expedienteAnterior.fechaCreacion,
            fechaModificacion: new Date().toISOString()
        };

        fs.writeFileSync(
            rutaArchivo,
            JSON.stringify(expedienteActualizado, null, 2),
            "utf8"
        );

        res.json({
            mensaje: "Expediente actualizado correctamente",
            expediente: expedienteActualizado
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar expediente"
        });
    }
});

// Eliminar un expediente
app.delete("/expedientes/:folio", (req, res) => {
    const rutaArchivo = path.join(
        carpetaExpedientes,
        `${req.params.folio}.json`
    );

    if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
            mensaje: "Expediente no encontrado"
        });
    }

    fs.unlinkSync(rutaArchivo);

    res.json({
        mensaje: "Expediente eliminado correctamente"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
