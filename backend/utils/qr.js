const QRCode = require('qrcode');
const fs = require('fs');

async function generateMemberQr(memberCode, filePath) {
  const qrData = `member:${memberCode}`;
  return new Promise((resolve, reject) => {
    QRCode.toFile(filePath, qrData, { type: 'png' }, function (err) {
      if (err) return reject(err);
      resolve(filePath);
    });
  });
}

module.exports = { generateMemberQr }; 