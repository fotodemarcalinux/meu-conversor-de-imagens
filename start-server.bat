@echo off
cd /d %~dp0
npm install
node start-server.js
pause
