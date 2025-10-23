#!/bin/bash

# Expense Split App - Quick Start Script
# This script helps you set up and run the Expense Split App quickly

echo "🚀 Expense Split App - Quick Start"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v14 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas."
    echo "   Local MongoDB: https://docs.mongodb.com/manual/installation/"
    echo "   MongoDB Atlas: https://www.mongodb.com/atlas"
fi

# Function to install backend dependencies
install_backend() {
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Backend dependencies installed successfully"
    else
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    cd ..
}

# Function to install frontend dependencies
install_frontend() {
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed successfully"
    else
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
}

# Function to create .env file
create_env_file() {
    echo "⚙️  Creating environment file..."
    cd backend
    if [ ! -f .env ]; then
        cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-split
JWT_SECRET=your_jwt_secret_key_here_$(date +%s)
OPENAI_API_KEY=your_openai_api_key_here
EOF
        echo "✅ Environment file created"
        echo "📝 Please update the .env file with your actual MongoDB URI and OpenAI API key"
    else
        echo "⚠️  .env file already exists, skipping creation"
    fi
    cd ..
}

# Function to start backend
start_backend() {
    echo "🔧 Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend server..."
    cd frontend
    PORT=3001 npm start &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    cd ..
}

# Function to check if servers are running
check_servers() {
    echo "🔍 Checking if servers are running..."
    
    # Check backend
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Backend server is running on http://localhost:5000"
    else
        echo "❌ Backend server is not responding"
    fi
    
    # Check frontend
    if curl -s http://localhost:3001 > /dev/null; then
        echo "✅ Frontend server is running on http://localhost:3001"
    else
        echo "❌ Frontend server is not responding"
    fi
}

# Function to show usage instructions
show_usage() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "📱 Frontend: http://localhost:3001"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📚 API Health: http://localhost:5000/health"
    echo ""
    echo "📖 Next Steps:"
    echo "1. Open http://localhost:3001 in your browser"
    echo "2. Create a user account"
    echo "3. Create a group"
    echo "4. Add expenses and track balances"
    echo ""
    echo "🛠️  Development Commands:"
    echo "Backend: cd backend && npm run dev"
    echo "Frontend: cd frontend && npm start"
    echo ""
    echo "📚 Documentation:"
    echo "README.md - Complete setup and API documentation"
    echo "DEPLOYMENT.md - Deployment instructions"
    echo "AI_INTEGRATION.md - AI features documentation"
    echo ""
    echo "🆘 Need Help?"
    echo "Check the README.md file for detailed instructions"
    echo "Or create an issue in the repository"
}

# Main execution
main() {
    echo "Starting setup process..."
    echo ""
    
    # Install dependencies
    install_backend
    install_frontend
    
    # Create environment file
    create_env_file
    
    echo ""
    echo "🎯 Setup Options:"
    echo "1. Start both servers automatically"
    echo "2. Show setup instructions only"
    echo "3. Exit"
    echo ""
    read -p "Choose an option (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo "🚀 Starting servers..."
            start_backend
            sleep 3
            start_frontend
            sleep 5
            check_servers
            show_usage
            ;;
        2)
            show_usage
            ;;
        3)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1, 2, or 3."
            exit 1
            ;;
    esac
}

# Run main function
main
