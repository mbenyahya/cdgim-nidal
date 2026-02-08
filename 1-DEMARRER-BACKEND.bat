@echo off
chcp 65001 >nul
title Backend CGDim - Spring Boot (port 8080)
cd /d "%~dp0backend-spring"

echo.
echo ========================================
echo   Demarrage du BACKEND (Spring Boot)
echo   URL API : http://localhost:8080
echo ========================================
echo.
echo Attendez le message "Started CgdimApplication" avant de lancer le frontend.
echo.

call mvn spring-boot:run

echo.
echo Le backend s'est arrete.
pause
