# Deployment Guide

This guide will help you deploy the Expense Split App to various platforms.

## Prerequisites

1. **MongoDB Database**
   - Local MongoDB installation, or
   - MongoDB Atlas (cloud), or
   - Any MongoDB hosting service

2. **Node.js Environment**
   - Node.js v14 or higher
   - npm or yarn

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-split
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Deployment Options

### Option 1: Heroku (Recommended for beginners)

#### Backend Deployment to Heroku

1. **Install Heroku CLI**
```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
cd backend
heroku create your-expense-split-backend
```

4. **Set Environment Variables**
```bash
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set OPENAI_API_KEY=your_openai_api_key
```

5. **Deploy**
```bash
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Frontend Deployment to Netlify

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `build` folder
   - Set environment variables if needed

### Option 2: Railway (Full-stack deployment)

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy**
```bash
railway login
railway init
railway up
```

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Backend on Railway
```bash
cd backend
railway login
railway init
railway up
```

#### Frontend on Vercel
```bash
cd frontend
npm install -g vercel
vercel
```

### Option 4: AWS EC2 (Advanced)

1. **Launch EC2 Instance**
2. **Install Node.js and MongoDB**
3. **Clone repository**
4. **Set up PM2 for process management**
5. **Configure Nginx as reverse proxy**

## Database Setup

### MongoDB Atlas (Cloud)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

### Local MongoDB

1. **Install MongoDB**
```bash
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

2. **Start MongoDB**
```bash
mongod
```

## Testing Deployment

### Health Check
```bash
curl https://your-backend-url.herokuapp.com/health
```

### API Testing
```bash
# Create a user
curl -X POST https://your-backend-url.herokuapp.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check connection string
   - Ensure database is accessible
   - Verify network connectivity

2. **Environment Variables Not Set**
   - Double-check `.env` file
   - Verify platform-specific environment variable settings

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors

4. **CORS Issues**
   - Update CORS settings in backend
   - Verify frontend URL is whitelisted

### Logs and Debugging

#### Heroku Logs
```bash
heroku logs --tail
```

#### Railway Logs
```bash
railway logs
```

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Enable HTTPS
   - Implement rate limiting
   - Validate all inputs

2. **Performance**
   - Enable compression
   - Use CDN for static assets
   - Implement caching
   - Monitor database queries

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API performance
   - Track user analytics
   - Set up uptime monitoring

## Cost Optimization

1. **Database**
   - Use MongoDB Atlas free tier for development
   - Optimize queries to reduce usage

2. **Hosting**
   - Use free tiers when possible
   - Monitor usage and upgrade as needed
   - Consider serverless options for cost efficiency

## Backup Strategy

1. **Database Backups**
   - Regular MongoDB backups
   - Export/import functionality
   - Point-in-time recovery

2. **Code Backups**
   - Git repository
   - Regular commits
   - Tag releases

## Scaling Considerations

1. **Horizontal Scaling**
   - Load balancers
   - Multiple server instances
   - Database sharding

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database performance
   - Cache frequently accessed data
