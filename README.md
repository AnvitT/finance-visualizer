# Personal Finance Visualizer

A simple, modern web application for tracking personal finances, built with Next.js, React, shadcn/ui, Recharts, and MongoDB.

## Features

### Stage 1: Basic Transaction Tracking
- **Add, Edit, Delete Transactions:** Record your expenses and income with details like amount, date, and description.
- **Transaction List View:** View all your transactions in a clean list.
- **Monthly Expenses Bar Chart:** Visualize your monthly spending trends with an interactive bar chart.
- **Form Validation:** Basic validation ensures your data is accurate and complete.

### Stage 2: Categories
- **Predefined Categories:** Assign transactions to categories (e.g., Food, Transport, Utilities) for better organization.
- **Category-wise Pie Chart:** See a breakdown of your spending by category with a pie chart.
- **Dashboard Summary Cards:** Get quick insights with cards showing total expenses, category breakdown, and your most recent transactions.

### Stage 3: Budgeting
- **Set Monthly Budgets:** Define monthly budgets for each category to manage your spending.
- **Budget vs Actual Comparison:** Compare your actual spending against your set budgets with a visual chart.
- **Spending Insights:** Receive simple insights to help you understand and improve your spending habits.

## Tech Stack
- **Frontend:** Next.js, React, shadcn/ui, Recharts
- **Backend:** Next.js API routes, MongoDB
- **UI/UX:** Responsive design, error states, and modern UI components

## Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your MongoDB connection string in the environment variables.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure
- `src/app/` - Main application pages and API routes
- `src/components/` - UI components and charts
- `src/models/` - Mongoose models for MongoDB
- `src/lib/` - Utility functions and database connection