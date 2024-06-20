const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('./src/controllers/uploadController');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para upload de arquivos
app.post('/upload', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'watermark', maxCount: 1 }
]), uploadController.handleUpload);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
