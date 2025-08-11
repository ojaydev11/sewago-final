$ErrorActionPreference = "Stop"

Write-Host "SewaGo E2E starting..."

& "$PSScriptRoot\ensure-env.ps1"

Set-Location (Join-Path $PSScriptRoot "..\..")

if (-not (Test-Path "node_modules")) { npm ci }
if (-not (Test-Path "backend\node_modules")) { npm --prefix backend ci }
if (-not (Test-Path "frontend\node_modules")) { npm --prefix frontend ci }

# Detect free ports
function Test-PortFree { param([int]$Port) try { $client = New-Object System.Net.Sockets.TcpClient; $client.Connect("127.0.0.1", $Port); $client.Close(); return $false } catch { return $true } }

$apiPort = 4100; if (-not (Test-PortFree $apiPort)) { $apiPort = 4101 }
$webPort = 3001; if (-not (Test-PortFree $webPort)) { $webPort = 3003 }

$env:API_PORT = $apiPort
$env:WEB_PORT = $webPort
$env:E2E_BACKEND_PORT = $apiPort
$env:E2E_FRONTEND_PORT = $webPort
$env:SEED_KEY = "dev-seed-key"

$null = npm run e2e:prepare

node scripts\e2e\run.js


