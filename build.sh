#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🐍 Building Backend..."
cd backend
python -m pip install -r requirements.txt
cd ..

echo "✅ Build Complete!"
