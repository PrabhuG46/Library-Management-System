
# LibManager Pro - Full Stack Library Management System

A robust library management system built with the MERN stack (MongoDB, Express, React, Node.js). Features role-based access control, book inventory management, author management, and borrowing workflows.

## Features

- **Books**: Create, Read, Update, Delete books. Advanced filtering by author, status, and search text.
- **Authors**: Complete CRUD management for book authors.
- **Users**: Admin-controlled user creation and management.
- **Borrowing**: Complete flow to check out and return books.
- **Authentication**: JWT-based secure authentication.
- **Architecture**: Clean separation of concerns, containerized with Docker.

## Tech Stack

- **Frontend**: React 19 (TypeScript), Tailwind CSS, Zustand, Vite.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **DevOps**: Docker, Docker Compose, Nginx.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- OR Node.js 20+ and MongoDB locally

### Method 1: Docker (Recommended)

1. **Clone the repository**
2. **Run Docker Compose**:
   ```bash
   docker-compose up --build
   ```
3. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

### Method 2: Local Development

#### Backend
1. Navigate to server: `cd server`
2. Install dependencies: `npm install`
3. Create `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/library_db
   JWT_SECRET=dev_secret
   PORT=5000
   ```
4. Start server: `npm run dev`

#### Frontend
1. Navigate to root: `cd ..` (assuming root is frontend)
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## Default Credentials

The system automatically seeds an admin user on first startup:

- **Email**: `admin@library.com`
- **Password**: `admin123`

## API Routes

- `POST /api/auth/login` - Authenticate user
- `GET /api/books` - List books (filters: search, status, authorId)
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)
- `GET /api/authors` - List authors
- `POST /api/authors` - Create author (Admin)
- `PUT /api/authors/:id` - Update author (Admin)
- `DELETE /api/authors/:id` - Delete author (Admin)
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)

## Design Decisions

- **State Management**: Used Zustand for a lightweight, hook-based global state solution for auth.
- **Styling**: Tailwind CSS for rapid, responsive UI development.
- **Database**: MongoDB for flexible schema design tailored to document-based data (books, users).
- **Containerization**: Nginx used to serve static frontend assets in production Docker build for performance.

