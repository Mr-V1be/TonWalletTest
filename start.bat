@echo off
cd /d "%~dp0"

docker --version >nul 2>&1
if %errorlevel%==0 (
  docker compose version >nul 2>&1
  if %errorlevel%==0 (
    echo Starting with Docker...
    docker compose -f ops\compose.yml up --build -d
    echo.
    echo TON Wallet is running at http://localhost:8090
    echo Stop: docker compose -f ops\compose.yml down
    echo Logs: docker compose -f ops\compose.yml logs -f
    goto :eof
  )
)

node --version >nul 2>&1
if %errorlevel%==0 (
  echo Docker not found, starting locally...
  pnpm --version >nul 2>&1
  if %errorlevel% neq 0 (
    echo Installing pnpm...
    npm install -g pnpm
  )
  if not exist node_modules pnpm install
  pnpm dev:host
  goto :eof
)

echo Error: Need either Docker or Node.js installed.
exit /b 1
