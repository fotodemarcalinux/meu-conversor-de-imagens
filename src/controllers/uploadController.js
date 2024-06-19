const fs = require('fs');
const path = require('path');

exports.handleUpload = (req, res) => {
  if (!req.files) {
    return res.status(400).send('Nenhum arquivo foi enviado.');
  }

  const files = req.files;
  console.log('Arquivos recebidos:', files);
  
  // Exemplo de manipulação dos arquivos recebidos
  files['images'].forEach(file => {
    console.log(`Imagem recebida: ${file.originalname}`);
    // Adicione aqui o código para converter a imagem e adicionar marca d'água
  });

  if (files['watermark']) {
    console.log(`Marca d'água recebida: ${files['watermark'][0].originalname}`);
  }

  res.send('Upload concluído com sucesso.');
};
