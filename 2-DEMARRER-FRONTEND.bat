@echo off
chcp 65001 >nul
title Frontend CGDim - Vite (port 5173)
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0frontend"

echo.
echo ========================================
echo   Demarrage du FRONTEND (Vite/React)
echo   URL    : http://localhost:5173
echo ========================================
echo.

if not exist "node_modules" (
  echo Installation des dependances npm...
  call npm install
  echo.
)

echo Demarrage du serveur de developpement...
echo Ouvrez http://localhost:5173 dans votre navigateur.
echo.
call npm run dev

echo.
echo Le frontend s'est arrete.
pause
