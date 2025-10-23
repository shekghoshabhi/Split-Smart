# Expense Splitting App

A full-stack application for splitting expenses among groups of users, built with Node.js backend and React frontend. This app allows users to create groups, add expenses, track balances, and settle debts efficiently.

## 🚀 Features

- **User Management**: Create and manage users with unique email validation
- **Group Management**: Create groups and add multiple members
- **Expense Tracking**: Add expenses with different split types (equal, percentage, exact amounts)
- **Balance Calculation**: Real-time balance tracking between users
- **Settlement**: Settle balances with transaction tracking
- **AI Integration**: Automatic expense categorization and optimal settlement suggestions
- **Responsive UI**: Clean and intuitive user interface

## 🏗️ Project Structure

```
expense-split-app/
├── backend/                    # Node.js Express API
│   ├── models/                # MongoDB models
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   └── Settlement.js
│   ├── routes/                # API routes
│   │   ├── users.js
│   │   └── groups.js
│   ├── services/              # Business logic services
│   │   └── aiService.js       # AI integration service
│   ├── package.json
│   └── server.js
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM
- **Express Validator** for input validation
- **Axios** for HTTP requests
- **OpenAI API** for AI-powered features

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** for styling and responsive design

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Users API

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "userId": "u1",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Get All Users
```http
GET /api/users
```

### Groups API

#### Create Group
```http
POST /api/groups
Content-Type: application/json

{
  "name": "Trip to Goa",
  "members": ["u1", "u2", "u3"]
}
```

**Response:**
```json
{
  "groupId": "g1",
  "name": "Trip to Goa"
}
```

#### Add Expense to Group
```http
POST /api/groups/:groupId/expenses
Content-Type: application/json

{
  "paidBy": "u1",
  "amount": 1200.00,
  "description": "Hotel",
  "splitBetween": ["u1", "u2", "u3"],
  "splitType": "equal"
}
```

**Response:**
```json
{
  "expenseId": "e1",
  "status": "success"
}
```

#### Get Group Balances
```http
GET /api/groups/:groupId/balances
```

**Response:**
```json
{
  "balances": [
    {
      "from": "u2",
      "to": "u1",
      "amount": 400.0000
    },
    {
      "from": "u3",
      "to": "u1",
      "amount": 400.0000
    }
  ]
}
```

#### Settle Balance
```http
POST /api/groups/:groupId/settle
Content-Type: application/json

{
  "from": "u2",
  "to": "u1",
  "amount": 400.00
}
```

**Response:**
```json
{
  "status": "settled",
  "txnId": "txn123"
}
```

#### Get Group Details
```http
GET /api/groups/:groupId
```

#### Get AI Settlement Suggestions
```http
GET /api/groups/:groupId/settlement-suggestions
```

**Response:**
```json
{
  "suggestions": [
    {
      "from": "u2",
      "to": "u1",
      "amount": 400.0000
    }
  ],
  "originalTransactions": 2,
  "optimizedTransactions": 1,
  "savings": 1
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-split
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start the development server:**
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## 🤖 AI Integration

### Expense Categorization
The app automatically categorizes expenses using AI based on the description. Categories include:
- Food & Dining
- Travel & Accommodation
- Entertainment
- Shopping
- Transportation
- Utilities
- Healthcare
- Education
- Other

### Settlement Optimization
AI suggests the minimum number of transactions needed to settle all debts, reducing complexity and transaction fees.

### Implementation Details
- Uses OpenAI's GPT-3.5-turbo model for intelligent categorization
- Fallback to rule-based categorization if AI service is unavailable
- Lightweight integration that doesn't impact performance
- Cost-effective approach suitable for prototype applications

## 🎯 Usage Example

### Complete Workflow

1. **Create Users:**
```bash
# Create John
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# Create Alice
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Create Bob
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "email": "bob@example.com"}'
```

2. **Create Group:**
```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Goa Trip", "members": ["u1", "u2", "u3"]}'
```

3. **Add Expense:**
```bash
curl -X POST http://localhost:5000/api/groups/g1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "paidBy": "u1",
    "amount": 1200.00,
    "description": "Hotel",
    "splitBetween": ["u1", "u2", "u3"],
    "splitType": "equal"
  }'
```

4. **Check Balances:**
```bash
curl http://localhost:5000/api/groups/g1/balances
```

5. **Settle Balance:**
```bash
curl -X POST http://localhost:5000/api/groups/g1/settle \
  -H "Content-Type: application/json" \
  -d '{"from": "u2", "to": "u1", "amount": 400.0000}'
```

## 🧪 Testing

### Manual Testing
Use the provided frontend interface or API testing tools like Postman to test all endpoints.

### Test Scenarios
1. Create users with valid and invalid emails
2. Create groups with existing and non-existing users
3. Add expenses with different split types
4. Verify balance calculations
5. Test settlement functionality
6. Test AI categorization with various expense descriptions

## 🚀 Deployment

### Backend Deployment
1. **Prepare for production:**
```bash
cd backend
npm install --production
```

2. **Deploy to your preferred platform:**
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Railway
   - Vercel

3. **Set environment variables in production**

### Frontend Deployment
1. **Build for production:**
```bash
cd frontend
npm run build
```

2. **Deploy to:**
   - Netlify
   - Vercel
   - AWS S3
   - GitHub Pages

## 📝 Notes

- All IDs are system-generated using timestamps and random strings
- Amounts are stored with 4 decimal places precision
- The app handles race conditions in balance calculations
- AI integration is lightweight and includes fallback mechanisms
- The frontend includes responsive design for mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Collaborators

- dev-highlevel

## 🔗 Live Demo

[Deployment URL will be added after deployment]

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.
