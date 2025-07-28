const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { PassThrough } = require('stream');

dayjs.extend(utc);

AWS.config.update({ region: 'us-east-1' }); // cámbialo si usas otra región
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'PruebaCloudSensorDataMaster'; // cambia por el nombre real

async function obtenerDatosUltimas24Horas(sensorId) {
  const hace24Horas = dayjs().utc().subtract(24, 'hour').toISOString();

  const params = {
    TableName: TABLE_NAME,
    FilterExpression: '#sensor = :sensorId AND #fecha >= :fechaMinima',
    ExpressionAttributeNames: {
      '#sensor': 'S',
      '#fecha': 'date',
    },
    ExpressionAttributeValues: {
      ':sensorId': sensorId,
      ':fechaMinima': hace24Horas,
    },
  };

  const resultado = await dynamoDb.scan(params).promise();
  return resultado.Items.sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function generarReportePDF(sensorId) {
  const datos = await obtenerDatosUltimas24Horas(sensorId);
  if (!datos.length) throw new Error('No hay datos en las últimas 24 horas');

  const doc = new PDFDocument();
  const stream = new PassThrough();
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.pipe(stream);

    doc.fontSize(18).text(`Reporte de ${sensorId}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Fecha y hora (UTC)         | Valor');
    doc.moveDown(0.5);

    datos.forEach((item) => {
      doc.text(`${item.date} | ${item.V}`);
    });

    doc.end();
  });
}

async function obtenerDatosUltimos15Min(sensorId) {
  const hace15Min = dayjs().utc().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss.SSSSSSZ');
  console.log(hace15Min)

  const params = {
    TableName: TABLE_NAME,
    FilterExpression: '#sensor = :sensorId AND #fecha >= :fechaMinima',
    ExpressionAttributeNames: {
      '#sensor': 'S',
      '#fecha': 'date',
    },
    ExpressionAttributeValues: {
      ':sensorId': sensorId,
      ':fechaMinima': hace15Min,
    },
  };

  const resultado = await dynamoDb.scan(params).promise();
  return resultado.Items.sort((a, b) => new Date(a.date) - new Date(b.date));
}



module.exports = {
  generarReportePDF,
  obtenerDatosUltimos15Min
};
