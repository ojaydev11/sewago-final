# 🚨 COMPLETE GIT HISTORY FIX SCRIPT
Write-Host "========================================" -ForegroundColor Red
Write-Host "    🚨 COMPLETE GIT HISTORY FIX" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "This will completely remove node_modules from git history" -ForegroundColor Yellow
Write-Host "WARNING: This is a destructive operation!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Are you sure? Type 'YES' to continue"
if ($confirm -ne "YES") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit
}

Write-Host ""
Write-Host "Step 1: Force removing all node_modules from git tracking..." -ForegroundColor Yellow
git rm -rf --cached "sewago/node_modules" 2>$null
git rm -rf --cached "sewago/frontend/node_modules" 2>$null
git rm -rf --cached "sewago/backend/node_modules" 2>$null
git rm -rf --cached "node_modules" 2>$null
git rm -rf --cached "sewago-final/node_modules" 2>$null
git rm -rf --cached "sewago-final-remote/node_modules" 2>$null

Write-Host ""
Write-Host "Step 2: Cleaning git cache..." -ForegroundColor Yellow
git gc --prune=now

Write-Host ""
Write-Host "Step 3: Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
git commit -m "🚨 COMPLETE REMOVAL: Remove all node_modules from git history"

Write-Host ""
Write-Host "Step 5: Force pushing to overwrite remote history..." -ForegroundColor Yellow
git push origin main --force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✅ COMPLETE FIX APPLIED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your deployment platforms should now auto-deploy:" -ForegroundColor Cyan
Write-Host "- Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "- Railway: https://railway.app/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
