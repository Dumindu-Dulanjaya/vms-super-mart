# Hugging Face Spaces Deploy Script for NestJS Backend
# This script runs inside c:\Users\ASUS\Desktop\vms\client

$SpaceRepoUrl = "https://huggingface.co/spaces/Dumindu420/vms-backend"
$TargetDir = [System.IO.Path]::GetFullPath("$PSScriptRoot/../hf-space")

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "NestJS Backend - Hugging Face Spaces Deployer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Space: $SpaceRepoUrl" -ForegroundColor Yellow
Write-Host "Local Target Directory: $TargetDir" -ForegroundColor Yellow

# 1. Clean existing hf-space directory if it exists
if (Test-Path $TargetDir) {
    Write-Host "Cleaning existing temporary space folder..." -ForegroundColor Gray
    Remove-Item -Path $TargetDir -Recurse -Force
}

# 2. Clone the Hugging Face Space repository
Write-Host "Cloning Hugging Face Space repository..." -ForegroundColor Green
git clone $SpaceRepoUrl $TargetDir

if (-not (Test-Path $TargetDir)) {
    Write-Error "Failed to clone the repository. Please make sure git is installed and URL is correct."
    exit 1
}

# 3. Copy backend files to target
Write-Host "Copying backend source files..." -ForegroundColor Green
$SourceDir = [System.IO.Path]::GetFullPath("$PSScriptRoot/../backend")

# List of items to copy (exclude Dockerfile and public folder to save space)
Get-ChildItem -Path $SourceDir -Exclude "node_modules", "dist", ".env", "tsconfig.tsbuildinfo", "tsconfig.build.tsbuildinfo", "Dockerfile", "public" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $TargetDir -Recurse -Force
}

# 4. Copy Dockerfile.hf as Dockerfile
Write-Host "Setting up Hugging Face optimized Dockerfile..." -ForegroundColor Green
$HfDockerfile = Join-Path $SourceDir "Dockerfile.hf"
$TargetDockerfile = Join-Path $TargetDir "Dockerfile"
Copy-Item -Path $HfDockerfile -Destination $TargetDockerfile -Force

# 5. Git Commit and Push
Write-Host "Committing and pushing changes to Hugging Face..." -ForegroundColor Green
Push-Location $TargetDir

git add .
git commit -m "Deploy NestJS backend to Hugging Face Spaces"

Write-Host "Pushing to Hugging Face. Git might ask for your credentials." -ForegroundColor Yellow
Write-Host "Username: Use your Hugging Face username (Dumindu420)" -ForegroundColor Yellow
Write-Host "Password: Use a Hugging Face Access Token with WRITE permission" -ForegroundColor Yellow

git push origin main

Pop-Location

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Done! Check the build progress on your Hugging Face Space page." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
