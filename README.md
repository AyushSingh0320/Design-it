# DesignerHub - Portfolio & Collaboration Platform

A full-stack web application for designers to showcase their work and collaborate with others.

## Features

- User Authentication (Signup, Login, Logout)
- Portfolio Management
- Public Gallery
- Collaboration System
- User Profiles
- Image Upload Support

## Tech Stack

- Frontend: React with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Project Structure

```
designerhub/
├── client/             # React frontend
├── server/             # Node.js backend
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

### Backend (.env)
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret key for JWT token generation
- PORT: Backend server port (default: 5000)

### Frontend (.env)
- REACT_APP_API_URL: Backend API URL (default: http://localhost:5000) 