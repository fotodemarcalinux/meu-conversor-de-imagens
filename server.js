const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadFields = upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'watermark', maxCount: 1 }
]);

app.post('/upload', uploadFields, async (req, res) => {
  try {
    console.log("Received upload request");
    const watermarkFile = req.files['watermark'][0].path;
    const outputFormat = req.body.format || 'jpeg';
    const zip = archiver('zip', { zlib: { level: 9 } });

    res.attachment('images.zip');
    zip.pipe(res);

    // Certifique-se de que a pasta 'processed' exista
    if (!fs.existsSync('processed')) {
      fs.mkdirSync('processed');
    }

    const processedFiles = [];
    console.log("Processing images...");

    for (const file of req.files['images']) {
      const outputPath = path.join('processed', `${path.parse(file.originalname).name}.${outputFormat}`);
      await sharp(file.path)
        .resize({ width: 1984, height: 1100 })
        .composite([{ input: watermarkFile, gravity: 'center', blend: 'over' }])
        .toFormat(outputFormat)
        .toFile(outputPath);

      zip.append(fs.createReadStream(outputPath), { name: path.basename(outputPath) });
      processedFiles.push(outputPath);
      console.log(`Processed file: ${outputPath}`);
    }

    zip.finalize().then(() => {
      console.log("Zip finalized and sent to client");

      zip.on('end', () => {
        console.log("Cleaning up temporary files...");
        for (const file of req.files['images']) {
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Failed to delete temp image file: ${err}`);
          });
        }
        fs.unlink(watermarkFile, (err) => {
          if (err) console.error(`Failed to delete temp watermark file: ${err}`);
        });
        // Delete processed files after zip finalization
        for (const outputPath of processedFiles) {
          fs.unlink(outputPath, (err) => {
            if (err) console.error(`Failed to delete processed file: ${err}`);
          });
        }
      });

    }).catch((err) => {
      console.error("Error during zip finalization:", err);
      res.status(500).send('An error occurred while finalizing the zip file.');
    });

  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).send('An error occurred while processing the images.');
  }
});

// Porta dinâmica para suporte a deploys no Render
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
