const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: '/tmp/uploads/' });

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Rota para upload de arquivos
app.post('/upload', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'watermark', maxCount: 1 }
]), (req, res) => {
  if (!req.files) {
    return res.status(400).send('Nenhum arquivo foi enviado.');
  }

  const files = req.files;

  console.log('Arquivos recebidos:', files);
  
  // Exemplo de manipulação dos arquivos recebidos
  files['images'].forEach(file => {
    console.log(`Imagem recebida: ${file.originalname}`);
  });

  if (files['watermark']) {
    console.log(`Marca d'água recebida: ${files['watermark'][0].originalname}`);
  }

  res.send('Upload concluído com sucesso.');
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
