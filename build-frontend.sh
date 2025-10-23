#!/bin/bash
# Build script for Vercel deployment

echo "Starting frontend build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "ERROR: public directory not found!"
    ls -la
    exit 1
fi

# Check if index.html exists
if [ ! -f "public/index.html" ]; then
    echo "ERROR: index.html not found in public directory!"
    ls -la public/
    exit 1
fi

echo "public/index.html found, proceeding with build..."

# Run build
echo "Running React build..."
npm run build

echo "Build completed successfully!"
