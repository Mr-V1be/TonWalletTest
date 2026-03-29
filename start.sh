#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  echo "Starting with Docker..."
  docker compose -f ./ops/compose.yml up --build -d
  echo ""
  echo "TON Wallet is running at http://localhost:8090"
  echo "Stop: docker compose -f ./ops/compose.yml down"
  echo "Logs: docker compose -f ./ops/compose.yml logs -f"
elif command -v node &>/dev/null; then
  echo "Docker not found, starting locally..."
  if ! command -v pnpm &>/dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
  fi
  [ -d node_modules ] || pnpm install
  pnpm dev:host
else
  echo "Error: Need either Docker or Node.js installed."
  exit 1
fi
