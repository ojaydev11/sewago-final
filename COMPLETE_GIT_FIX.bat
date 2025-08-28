@echo off
echo ========================================
echo    🚨 COMPLETE GIT HISTORY FIX
echo ========================================
echo.

echo This will completely remove node_modules from git history
echo WARNING: This is a destructive operation!
echo.
set /p confirm="Are you sure? Type 'YES' to continue: "
if not "%confirm%"=="YES" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Step 1: Force removing all node_modules from git tracking...
git rm -rf --cached "sewago/node_modules" 2>nul
git rm -rf --cached "sewago/frontend/node_modules" 2>nul
git rm -rf --cached "sewago/backend/node_modules" 2>nul
git rm -rf --cached "node_modules" 2>nul
git rm -rf --cached "sewago-final/node_modules" 2>nul
git rm -rf --cached "sewago-final-remote/node_modules" 2>nul

echo.
echo Step 2: Cleaning git cache...
git gc --prune=now

echo.
echo Step 3: Adding all changes...
git add .

echo.
echo Step 4: Committing changes...
git commit -m "🚨 COMPLETE REMOVAL: Remove all node_modules from git history"

echo.
echo Step 5: Force pushing to overwrite remote history...
git push origin main --force

echo.
echo ========================================
echo    ✅ COMPLETE FIX APPLIED!
echo ========================================
echo.
echo Your deployment platforms should now auto-deploy:
echo - Vercel: https://vercel.com/dashboard
echo - Railway: https://railway.app/dashboard
echo.
pause
