@echo off
chcp 65001 >nul
echo ========================================
echo   CGDim - Initialiser le depot Git
echo ========================================
echo.

where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo [ERREUR] Git n'est pas installe ou pas dans le PATH.
  echo Installez Git : https://git-scm.com/download/win
  pause
  exit /b 1
)

cd /d "%~dp0"

if exist .git (
  echo Le depot Git existe deja.
  echo Pour ajouter un commit : git add . ^& git commit -m "Mise a jour"
  pause
  exit /b 0
)

echo Initialisation du depot...
git init
echo.
echo Ajout des fichiers (selon .gitignore)...
git add .
echo.
echo Premier commit...
git commit -m "Initial commit - CGDim appli-nidal"
echo.
echo Depot Git pret. Pour partager :
echo   - GitHub/GitLab : creez un repo vide, puis : git remote add origin URL ^& git push -u origin main
echo   - Ou partagez le dossier entier (sans node_modules/target grace a .gitignore)
echo.
pause
