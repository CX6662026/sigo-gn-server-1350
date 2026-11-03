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
        res.status(500).json({ mensaje: "Error al obtener expedientes" });
    }
});

// Registrar un expediente
app.post("/expedientes", (req, res) => {
    try {
        const expediente = req.body;

        if (!expediente.folio) {
            return res.status(400).json({ mensaje: "El folio es obligatorio" });
        }

        const rutaArchivo = path.join(
            carpetaExpedientes,
            `${expediente.folio}.json`
        );

        if (fs.existsSync(rutaArchivo)) {
            return res.status(409).json({ mensaje: "El folio ya existe" });
        }

        fs.writeFileSync(
            rutaArchivo,
            JSON.stringify(expediente, null, 2),
            "utf8"
        );

        res.status(201).json({
            mensaje: "Expediente registrado correctamente",
            expediente
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar expediente" });
    }
});

// Consultar un expediente por folio
app.get("/expedientes/:folio", (req, res) => {
    const rutaArchivo = path.join(
        carpetaExpedientes,
        `${req.params.folio}.json`
    );

    if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ mensaje: "Expediente no encontrado" });
    }

    const contenido = fs.readFileSync(rutaArchivo, "utf8");
    res.json(JSON.parse(contenido));
});

// Actualizar un expediente
app.put("/expedientes/:folio", (req, res) => {
    const rutaArchivo = path.join(
        carpetaExpedientes,
        `${req.params.folio}.json`
    );

    if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ mensaje: "Expediente no encontrado" });
    }

    const expedienteActualizado = {
        ...req.body,
        folio: req.params.folio
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
});

// Eliminar un expediente
app.delete("/expedientes/:folio", (req, res) => {
    const rutaArchivo = path.join(
        carpetaExpedientes,
        `${req.params.folio}.json`
    );

    if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ mensaje: "Expediente no encontrado" });
    }

    fs.unlinkSync(rutaArchivo);

    res.json({ mensaje: "Expediente eliminado correctamente" });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});