const express = require('express');
const app = express();
const port = 8080;
const functions = require("./functions/functions")
const email = require("./functions/email")
const fs = require('fs');
const cors = require('cors');

app.use(express.json());

app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

// Ruta tipo API
app.get('/getReport', async (req, res) => {
  const sensorId = req.query.sensor || 'sensor_3';

  try {
    const pdfBuffer = await functions.generarReportePDF(sensorId);

    console.log(pdfBuffer)

    await email.enviarCorreoConPDF("construccionesmantenimientokv@outlook.com", pdfBuffer, "pruebaCloud.pdf")

    res.status(200).json({ message: "se envio el corro" });
  } catch (error) {
    console.error('Error generando el reporte:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

app.get('/getLast15Min', async (req, res) => {
  const sensorId = req.query.sensor;

  if (!sensorId) {
    return res.status(400).json({ error: 'Parámetro sensor requerido' });
  }

  try {
    const datos = await functions.obtenerDatosUltimos15Min(sensorId);

    res.status(200).json({ datos });
  } catch (error) {
    console.error('Error obteniendo datos de los últimos 15 minutos:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
