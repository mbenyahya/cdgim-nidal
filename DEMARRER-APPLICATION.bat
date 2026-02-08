@echo off
chcp 65001 >nul
title CGDim - Lancement

echo.
echo ========================================
echo   CGDim - Lancement Backend + Frontend
echo ========================================
echo.
echo 1. Ouverture du BACKEND (fenetre separee)...
echo    Attendez "Started CgdimApplication" dans cette fenetre.
echo.

start "Backend CGDim - port 8080" cmd /k "cd /d ""%~dp0backend-spring"" && mvn spring-boot:run"

echo 2. Attente du demarrage du backend (environ 25 secondes)...
timeout /t 25 /nobreak >nul

echo.
echo 3. Ouverture du FRONTEND (fenetre separee)...
set "PATH=%PATH%;C:\Program Files\nodejs"
start "Frontend CGDim - port 5173" cmd /k "cd /d ""%~dp0frontend"" && (if not exist node_modules npm install) && npm run dev"

echo.
echo ========================================
echo   Les deux serveurs demarrent.
echo   Ouvrez : http://localhost:5173
echo ========================================
echo.
echo Si la page ne charge pas, attendez encore 10 secondes
echo que le backend affiche "Started CgdimApplication".
echo.
pause
