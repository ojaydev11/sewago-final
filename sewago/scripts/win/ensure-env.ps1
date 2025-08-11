$ErrorActionPreference = "Stop"

function Ensure-File {
  param([string]$Path, [string]$Content)
  if (-not (Test-Path $Path)) { $Content | Out-File -FilePath $Path -Encoding utf8 }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Join-Path $root "..\.."
$backendEnv = Join-Path $repo "backend\.env"
$frontendEnv = Join-Path $repo "frontend\.env.local"

Ensure-File $backendEnv "PORT=4100`nMONGODB_URI=mongodb://127.0.0.1:27017/sewago`nCLIENT_ORIGIN=http://localhost:3001`nSEED_KEY=dev-seed-key`n"
Ensure-File $frontendEnv "PORT=3001`nNEXT_PUBLIC_API_URL=http://localhost:4100/api`nNEXT_PUBLIC_SITE_URL=http://localhost:3001`n"

Write-Host "Env ensured."


