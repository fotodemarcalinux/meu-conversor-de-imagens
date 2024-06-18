const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const serverless = require('serverless-http');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });  // Use /tmp para Netlify functions

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadFields = upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'watermark', maxCount: 1 }
]);

app.post('/upload', uploadFields, async (req, res) => {
  try {
    console.log('Recebendo requisição para /upload');
    console.log('Arquivos recebidos:', req.files);
    const watermarkFile = req.files['watermark'][0].path;
    const outputFormat = req.body.format || 'jpeg';
    const zip = archiver('zip');

    res.attachment('images.zip');
    zip.pipe(res);

    if (!fs.existsSync('/tmp/processed')) {
      fs.mkdirSync('/tmp/processed');
    }

    const processedFiles = [];

    for (const file of req.files['images']) {
      const outputPath = path.join('/tmp/processed', `${path.parse(file.originalname).name}.${outputFormat}`);
      await sharp(file.path)
        .resize({ width: 1984, height: 1100 })
        .composite([{ input: watermarkFile, gravity: 'center', blend: 'over' }])
        .toFormat(outputFormat)
        .toFile(outputPath);

      zip.append(fs.createReadStream(outputPath), { name: path.basename(outputPath) });
      processedFiles.push(outputPath);
    }

    zip.finalize();

    zip.on('end', () => {
      for (const file of req.files['images']) {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Failed to delete temp image file: ${err}`);
        });
      }
      fs.unlink(watermarkFile, (err) => {
        if (err) console.error(`Failed to delete temp watermark file: ${err}`);
      });
      for (const outputPath of processedFiles) {
        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Failed to delete processed file: ${err}`);
        });
      }
    });
  } catch (error) {
    console.error('Erro ao processar imagens:', error);
    res.status(500).send('An error occurred while processing the images.');
  }
});

module.exports.handler = serverless(app);
