# Fix Git Push Issue - Remove node_modules from tracking
Write-Host "Fixing Git Push Issue..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Remove node_modules from git tracking
Write-Host "Removing node_modules from git tracking..." -ForegroundColor Yellow

# Remove all node_modules directories from git tracking
git rm -r --cached "sewago/node_modules" 2>$null
git rm -r --cached "sewago/frontend/node_modules" 2>$null
git rm -r --cached "sewago/backend/node_modules" 2>$null

# Check git status
Write-Host "`nGit Status:" -ForegroundColor Green
git status

Write-Host "`nTo complete the fix:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Remove node_modules from tracking'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
