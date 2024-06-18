# Script para iniciar o servidor Node.js automaticamente

# Caminho para o diretório do projeto
$projectPath = "C:\Users\FOTODEMARCA\Desktop\meu-conversor-de-imagens"

# Navegar até o diretório do projeto
Set-Location -Path $projectPath

# Instalar dependências (apenas se necessário)
npm install

# Iniciar o servidor
Start-Process "node" -ArgumentList "server.js"
