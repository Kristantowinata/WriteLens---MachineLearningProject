#!/usr/bin/env bash
# render-build.sh — Render Build Script for WriteLens
# This script is executed by Render during the build phase.

set -o errexit  # Exit on any error

echo "=== [1/3] Installing frontend dependencies ==="
cd frontend
npm install

echo "=== [2/3] Building frontend ==="
npm run build

echo "=== [3/3] Installing backend dependencies ==="
cd ../backend
pip install -r requirements.txt

echo "=== Build complete! ==="
