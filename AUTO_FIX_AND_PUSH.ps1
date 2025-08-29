# 🚨 GIT PUSH ISSUE AUTO-FIX SCRIPT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    🚨 GIT PUSH ISSUE AUTO-FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove node_modules from git tracking
Write-Host "Step 1: Removing node_modules from git tracking..." -ForegroundColor Yellow
git rm -r --cached "sewago/node_modules" 2>$null
git rm -r --cached "sewago/frontend/node_modules" 2>$null
git rm -r --cached "sewago/backend/node_modules" 2>$null
git rm -r --cached "node_modules" 2>$null
git rm -r --cached "sewago-final/node_modules" 2>$null
git rm -r --cached "sewago-final-remote/node_modules" 2>$null

Write-Host ""
Write-Host "Step 2: Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Step 3: Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
git commit -m "🔧 Remove node_modules from tracking - Fix large file issue"

Write-Host ""
Write-Host "Step 5: Pushing to trigger auto-deploy..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✅ FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Check your deployment platforms:" -ForegroundColor Cyan
Write-Host "- Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "- Railway: https://railway.app/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
