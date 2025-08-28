@echo off
echo ========================================
echo    🚨 NUCLEAR GIT CLEANUP
echo ========================================
echo.

echo This script will completely clean your git repository
echo and remove ALL node_modules from git history
echo.
echo WARNING: This will rewrite git history!
echo.
set /p confirm="Type 'NUCLEAR' to confirm: "
if not "%confirm%"=="NUCLEAR" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Step 1: Removing all node_modules from current tracking...
git rm -rf --cached "sewago/node_modules" 2>nul
git rm -rf --cached "sewago/frontend/node_modules" 2>nul
git rm -rf --cached "sewago/backend/node_modules" 2>nul
git rm -rf --cached "node_modules" 2>nul
git rm -rf --cached "sewago-final/node_modules" 2>nul
git rm -rf --cached "sewago-final-remote/node_modules" 2>nul

echo.
echo Step 2: Cleaning git objects...
git gc --prune=now --aggressive

echo.
echo Step 3: Adding all changes...
git add .

echo.
echo Step 4: Committing...
git commit -m "🚨 NUCLEAR CLEANUP: Remove all node_modules completely"

echo.
echo Step 5: Force pushing to overwrite remote...
git push origin main --force

echo.
echo ========================================
echo    ✅ NUCLEAR CLEANUP COMPLETE!
echo ========================================
echo.
echo Your deployments should now work:
echo - Vercel: https://vercel.com/dashboard
echo - Railway: https://railway.app/dashboard
echo.
pause
