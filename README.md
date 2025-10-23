# Split Smart

**Live App**: [https://smart-split-ai.netlify.app](https://smart-split-ai.netlify.app)  
**API**: [https://split-smart-production.up.railway.app](https://split-smart-production.up.railway.app)


**Demo Video**:

https://www.loom.com/share/46069ccfc2f744a284f80125f8b5f089?sid=64313ea9-0c28-4061-bc13-5ed88d09ff99

A modern expense splitting app that makes splitting bills with friends effortless. Built with Node.js and React, featuring AI-powered insights to help you understand your spending patterns.

## What Makes This Special

Ever been on a group trip where everyone's constantly asking "who owes what?" This app solves that problem completely. You can:

- Create groups for trips, dinners, or any shared expenses
- Add expenses with flexible splitting options (equal, percentage, or custom amounts)
- See exactly who owes whom at a glance
- Settle balances with one click
- Get AI-powered insights like "Who spent the most?" or "What was our biggest expense category?"

The AI features are pretty cool - it automatically categorizes your expenses and can answer natural language questions about your spending.

## Tech Stack

**Backend**: Node.js + Express + MongoDB + OpenAI API  
**Frontend**: React + Material-UI  
**Database**: MongoDB Atlas  
**Deployment**: Railway (backend) + Netlify (frontend)

## Quick Start

### Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account (free tier works fine)
- OpenAI API key (optional but recommended for AI features)

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/shekghoshabhi/Split-Smart.git
cd Split-Smart
```

2. **Set up the backend**
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/split-smart
OPENAI_API_KEY=your-openai-api-key-here
PORT=5000
```

Start the backend:
```bash
npm run dev
```

3. **Set up the frontend**
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

4. **Or use the quick start script**
```bash
chmod +x start.sh
./start.sh
```

That's it! The app should be running on `http://localhost:3001` (frontend) and `http://localhost:5000` (backend).

## API Documentation

The API is pretty straightforward. Here are the main endpoints:

### Users

**Create a user**
```bash
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Get all users**
```bash
GET /api/users
```

### Groups

**Create a group**
```bash
POST /api/groups
{
  "name": "Weekend Trip",
  "members": ["user1", "user2", "user3"],
  "createdBy": "user1"
}
```

**Get all groups**
```bash
GET /api/groups
```

**Get specific group**
```bash
GET /api/groups/{groupId}
```

### Expenses

**Add an expense**
```bash
POST /api/groups/{groupId}/expenses
{
  "paidBy": "user1",
  "amount": 1200.00,
  "description": "Hotel booking",
  "splitBetween": ["user1", "user2", "user3"],
  "splitType": "equal"
}
```

**Update an expense**
```bash
PUT /api/groups/{groupId}/expenses/{expenseId}
{
  "paidBy": "user1",
  "amount": 1000.00,
  "description": "Updated hotel booking",
  "splitBetween": ["user1", "user2", "user3"],
  "splitType": "equal"
}
```

**Delete an expense**
```bash
DELETE /api/groups/{groupId}/expenses/{expenseId}
```

**Get group expenses**
```bash
GET /api/groups/{groupId}/expenses
```

### Balances

**Get outstanding balances**
```bash
GET /api/groups/{groupId}/balances
```

**Settle a balance**
```bash
POST /api/groups/{groupId}/settle
{
  "from": "user1",
  "to": "user2",
  "amount": 400.00
}
```

### AI Features

**Get smart summary**
```bash
POST /api/groups/{groupId}/summaries
{
  "query": "Who spent the most on food?"
}
```

**Get settlement suggestions**
```bash
GET /api/groups/{groupId}/settlement-suggestions
```

## Database Design

I went with MongoDB because it's flexible and works well with Node.js. Here's how the data is structured:

### Users Collection
```javascript
{
  userId: "u1703123456789abc",  // Custom ID for easier frontend handling
  name: "John Doe",
  email: "john@example.com",
  createdAt: "2023-12-21T10:30:00Z"
}
```

### Groups Collection
```javascript
{
  groupId: "g1703123456789xyz",  // Custom ID
  name: "Goa Trip",
  members: ["u1703123456789abc", "u1703123456789def"],
  createdBy: "u1703123456789abc",
  createdAt: "2023-12-21T10:30:00Z"
}
```

### Expenses Collection
```javascript
{
  expenseId: "e1703123456789exp",  // Custom ID
  groupId: "g1703123456789xyz",
  paidBy: "u1703123456789abc",
  amount: 1500.00,
  description: "Dinner at restaurant",
  splitBetween: ["u1703123456789abc", "u1703123456789def"],
  splitType: "equal",  // or "percentage" or "exact_amounts"
  splitDetails: {},  // Contains split configuration
  category: "Food & Dining",  // AI-generated
  createdAt: "2023-12-21T10:30:00Z"
}
```

### Settlements Collection
```javascript
{
  txnId: "t1703123456789settle",  // Transaction ID
  groupId: "g1703123456789xyz",
  from: "u1703123456789abc",
  to: "u1703123456789def",
  amount: 750.00,
  status: "settled",
  createdAt: "2023-12-21T10:30:00Z"
}
```

### Balance Calculation Logic

The balance calculation is the heart of the app. Here's how it works:

1. **Initialize a balance matrix** for all group members
2. **Process each expense**:
   - Calculate how much each person owes based on split type
   - Update the balance matrix accordingly
3. **Apply settlements**:
   - Reduce balances where payments have been made
4. **Extract outstanding balances**:
   - Only show positive balances (who owes whom)

This approach ensures that settlements are properly accounted for and balances are always accurate.

## AI Integration

The AI features use OpenAI's GPT-3.5-turbo model. Here's what it does:

### Expense Categorization
When you add an expense like "Dinner at Pizza Hut", the AI automatically categorizes it as "Food & Dining". This helps with spending analysis.

### Smart Summaries
You can ask natural language questions like:
- "Who spent the most overall?"
- "What was our biggest expense category?"
- "How much did we spend on food?"

The AI analyzes all the expense data and gives you a conversational summary.

### Fallback System
If the OpenAI API is down or rate-limited, the app falls back to pre-built responses that still provide useful insights.

## Project Structure

```
Split-Smart/
├── backend/
│   ├── controllers/     # Handle HTTP requests
│   ├── services/       # Business logic
│   ├── routes/         # API endpoints
│   ├── models/         # Database schemas
│   ├── middleware/     # Validation, error handling
│   ├── utils/          # Helper functions
│   ├── constants/      # App constants
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Main pages
│   │   ├── config/     # API configuration
│   │   └── App.js
│   └── public/
└── README.md
```

## Deployment

### Backend (Railway)
The backend is deployed on Railway, which is great for Node.js apps. It automatically deploys from the main branch and handles environment variables.

### Frontend (Netlify)
The frontend is deployed on Netlify with automatic builds from GitHub. The build process installs dependencies and creates an optimized production build.

### Environment Variables
- **Backend**: MongoDB connection string, OpenAI API key
- **Frontend**: API base URL (currently hardcoded to Railway)

## Testing the App

1. **Create a few users** - Add yourself and some friends
2. **Create a group** - Maybe "Weekend Trip" or "Dinner Group"
3. **Add some expenses** - Try different split types (equal, percentage, custom)
4. **Check balances** - See who owes whom
5. **Settle a balance** - Click settle and watch it disappear
6. **Try AI features** - Ask questions like "Who spent the most?"

## Known Issues

<<<<<<< HEAD
- The AI features might be rate-limited if you hit the OpenAI API too hard
- Large groups with many expenses might take a moment to load balances
- The app works best with groups of 2-10 people (though it supports more)

## License

MIT License - feel free to use this code for your own projects!

## Contributing

Found a bug or want to add a feature? Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test everything works
5. Submit a pull request

## Support

Having issues? 
- Check the API documentation above
- Look at the setup instructions
- Create an issue on GitHub if you're still stuck
=======


