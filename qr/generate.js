#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { QRCodeCanvas } = require('@loskir/styled-qr-code-node');

const url = process.argv[2];
const outputBase = process.argv[3] || 'qr-output';

if (!url) {
  console.error('Error: URL is required');
  process.exit(1);
}

const logoPath = path.resolve(__dirname, '..', 'logo', 'SAYLESS-BLACK-BG.png');

if (!fs.existsSync(logoPath)) {
  console.error(`Error: Logo not found at ${logoPath}`);
  process.exit(1);
}

async function generate() {
  // 1. Terminal text output
  console.log(await QRCode.toString(url, { type: 'utf8' }));

  // 2. Styled PNG and SVG with logo
  const qrConfig = {
    width: 1024,
    height: 1024,
    data: url,
    image: logoPath,
    dotsOptions: {
      color: '#000000',
      type: 'square',
    },
    cornersSquareOptions: {
      color: '#000000',
      type: 'square',
    },
    cornersDotOptions: {
      color: '#000000',
      type: 'square',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    qrOptions: {
      errorCorrectionLevel: 'H',
    },
    imageOptions: {
      imageSize: 0.3,
      hideBackgroundDots: true,
      margin: 4,
    },
  };

  // PNG
  const qrPng = new QRCodeCanvas(qrConfig);
  const pngBuffer = await qrPng.toBuffer('png');
  const pngPath = `${outputBase}.png`;
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`PNG saved: ${pngPath}`);

  // SVG
  const qrSvg = new QRCodeCanvas(qrConfig);
  const svgBuffer = await qrSvg.toBuffer('svg');
  const svgPath = `${outputBase}.svg`;
  fs.writeFileSync(svgPath, svgBuffer);
  console.log(`SVG saved: ${svgPath}`);
}

generate().catch((err) => {
  console.error('Error generating QR code:', err.message);
  process.exit(1);
});
