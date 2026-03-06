$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "[1/3] Building portable EXE (pkg)..."
npm run build:win:portable

$exePath = Join-Path $Root 'dist/OBSmusic.exe'
if (!(Test-Path $exePath)) {
  throw "Portable EXE not found: $exePath"
}

$innoCompiler = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
if (!(Test-Path $innoCompiler)) {
  throw "Inno Setup 6 not found. Install it from https://jrsoftware.org/isinfo.php"
}

Write-Host "[2/3] Compiling installer (Inno Setup)..."
& $innoCompiler (Join-Path $Root 'installer/windows/OBSmusic.iss')

Write-Host "[3/3] Done. Installer is in dist/installer/"
