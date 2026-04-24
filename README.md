# 💰 AI-Powered Expense Tracker

An intelligent full-stack Expense Tracker application that not only records your income and expenses but also analyzes your spending patterns using AI to provide personalized financial insights and savings advice.

---

## 🚀 Features

### 📊 Core Expense Tracking
- Add, edit, and delete expenses & income
- Categorize transactions (Food, Shopping, Healthcare, etc.)
- Track transaction history with timestamps
- Secure user authentication (JWT-based)

### 🤖 AI-Powered Insights
- Detect unusual spending patterns
- Compare monthly expenses
- Answer queries like:
  > "Why did I overspend this month?"
- Provide personalized saving suggestions in simple language

### 📈 Smart Analysis Dashboard
- Monthly spending comparison
- Category-wise breakdown
- Highlight high-spending categories
- AI-generated explanations + actionable tips

---

## 🧠 How AI Works

Instead of sending raw data to the model:

1. Backend processes expense data (MySQL)
2. Calculates:
   - Total spending
   - Category-wise changes
   - Unusual spending patterns
3. Sends structured insights to LLM via OpenRouter
4. AI generates human-friendly explanations and suggestions

---

## 🏗️ Tech Stack

### Frontend
- Angular
- Angular Material
- Reactive Forms

### Backend
- Node.js + Express
- TypeScript
- JWT Authentication

### Database
- MySQL (TiDB compatible)

### AI Integration
- OpenRouter API
- LLM: Gemma (with fallback support)

---

## 📂 Project Structure
frontend/
├── components/
├── services/
├── pages/

backend/
├── routes/
├── services/
├── db.ts
├── server.ts


---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/tanishkamakode/Expense-Tracker.git
cd expense-tracker
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```
Create a .env file:

```
PORT=3000

DB_HOST=your_host
DB_PORT=4000
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db

OPENROUTER_API_KEY=your_openrouter_key
JWT_SECRET=your_secret
```
Run backend:
```
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
ng serve
```
App runs on:
```
http://localhost:4200
```

## 🔗 API Endpoints

### Auth
- **POST** `/api/auth/register`
- **POST** `/api/auth/login`

### Expenses
- **GET** `/api/expenses`
- **POST** `/api/expenses`
- **PUT** `/api/expenses/:id`
- **DELETE** `/api/expenses/:id`

### AI Analysis
- **GET** `/api/ai/analyze?month=<m>&year=<y>`

---

## 📊 Example AI Response

```json
{
  "insights": {
    "totalCurrent": 12000,
    "totalPrevious": 6500,
    "changePercent": 85,
    "categories": [
      {
        "category": "Shopping",
        "amount": 5000,
        "change": 233
      }
    ],
    "unusual": ["Shopping", "Food"]
  },
  "explanation": "You overspent mainly due to increased spending in Shopping and Food..."
}
