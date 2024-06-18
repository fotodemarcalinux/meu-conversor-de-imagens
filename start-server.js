const { exec } = require('child_process');
const open = require('open');

exec('node server.js', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

// Abra o navegador após um pequeno atraso para garantir que o servidor está em execução
setTimeout(() => {
  open('http://localhost:3000');
}, 3000);
