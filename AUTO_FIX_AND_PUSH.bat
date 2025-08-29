@echo off
echo ========================================
echo    🚨 GIT PUSH ISSUE AUTO-FIX
echo ========================================
echo.

echo Step 1: Removing node_modules from git tracking...
git rm -r --cached "sewago/node_modules" 2>nul
git rm -r --cached "sewago/frontend/node_modules" 2>nul
git rm -r --cached "sewago/backend/node_modules" 2>nul
git rm -r --cached "node_modules" 2>nul
git rm -r --cached "sewago-final/node_modules" 2>nul
git rm -r --cached "sewago-final-remote/node_modules" 2>nul

echo.
echo Step 2: Checking git status...
git status

echo.
echo Step 3: Adding all changes...
git add .

echo.
echo Step 4: Committing changes...
git commit -m "🔧 Remove node_modules from tracking - Fix large file issue"

echo.
echo Step 5: Pushing to trigger auto-deploy...
git push origin main

echo.
echo ========================================
echo    ✅ FIX COMPLETE!
echo ========================================
echo.
echo Check your deployment platforms:
echo - Vercel: https://vercel.com/dashboard
echo - Railway: https://railway.app/dashboard
echo.
pause
