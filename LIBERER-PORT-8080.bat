@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Libérer le port 8080
echo.
echo Recherche du processus qui utilise le port 8080...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
  set "PID=%%a"
  goto :found
)
echo Aucun processus trouve sur le port 8080.
goto :end

:found
echo Processus trouve : PID !PID!
echo Arret en cours...
taskkill /PID !PID! /F 2>nul
if %errorlevel% equ 0 (
  echo Le port 8080 est libere. Vous pouvez relancer le backend.
) else (
  echo Echec. Essayez en tant qu'administrateur (clic droit - Executer en tant qu'administrateur).
)
:end
echo.
pause
