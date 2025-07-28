const AWS = require('aws-sdk');

// Asegúrate de haber configurado la región
AWS.config.update({ region: 'us-east-1' });

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * Codifica el PDF como base64 y construye el email con adjunto
 */
async function enviarCorreoConPDF(destinatario, buffer, nombreArchivo) {
  const fromEmail = 'no-reply@tek10.mx';

  // Construcción MIME del correo
  const boundary = `NextPart${Date.now()}`;
  const pdfBase64 = buffer.toString('base64');

  const mensaje = [
    `From: Sensor App <${fromEmail}>`,
    `To: ${destinatario}`,
    `Subject: Reporte de Sensor`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    'Adjunto encontrarás el reporte de las últimas 24 horas.',
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${nombreArchivo}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${nombreArchivo}"`,
    '',
    pdfBase64,
    '',
    `--${boundary}--`,
  ].join('\n');

  const params = {
    RawMessage: { Data: mensaje },
    Source: fromEmail,
    Destinations: [destinatario],
  };

  await ses.sendRawEmail(params).promise();
  console.log(`✅ Correo enviado a ${destinatario}`);
}

module.exports = {
  enviarCorreoConPDF,
};
