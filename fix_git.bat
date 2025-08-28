@echo off
echo Fixing Git Push Issue...
echo.

echo Removing node_modules from git tracking...
git rm -r --cached "sewago/node_modules" 2>nul
git rm -r --cached "sewago/frontend/node_modules" 2>nul
git rm -r --cached "sewago/backend/node_modules" 2>nul

echo.
echo Git Status:
git status

echo.
echo To complete the fix:
echo 1. git add .
echo 2. git commit -m "Remove node_modules from tracking"
echo 3. git push origin main
echo.
pause
