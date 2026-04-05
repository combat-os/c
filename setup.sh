#!/bin/bash

# COMBAT OS Setup Script
# Quick setup for development environment

echo "🛡️ COMBAT OS - Setup Script"
echo "============================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install
node init-db.js
cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📱 Access points:"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🔐 Demo login: NRP P001, P002, P003, or P004"
echo ""
echo "Happy coding! 🛡️"