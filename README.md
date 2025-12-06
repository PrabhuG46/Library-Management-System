# LibManager Pro - Full Stack Library Management System

A robust, full-stack library management system built with the MERN stack (MongoDB, Express, React, Node.js). Features role-based access control, book inventory management, author management, user administration, and complete borrowing workflows with JWT authentication.

## Features

- **Books Management**: Create, Read, Update, Delete books with advanced filtering by author, status, and search text
- **Authors Management**: Complete CRUD operations for book authors
- **Users Management**: Admin-controlled user creation, editing, and deletion
- **Borrowing System**: Complete checkout and return workflows for library users
- **Authentication**: JWT-based secure authentication with role-based access control (Admin/User)
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Containerization**: Full Docker and Docker Compose support

## Tech Stack

- **Frontend**: React 19 (TypeScript), Tailwind CSS, Zustand (state management), Vite, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **DevOps**: Docker, Docker Compose, Nginx (production reverse proxy)

## Prerequisites

Choose one of the following:
- **Docker & Docker Compose** (recommended for quick setup)
- **Local Development**: Node.js 20+, MongoDB 6.0+, npm/yarn

---

## Quick Start

### Option 1: Docker Compose (Recommended)

#### Prerequisites
- Docker Desktop installed and running

#### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd libmanager
   ```

2. Create `.env` file in the root directory (see `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start the application:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Nginx Proxy** (alternative): http://localhost

5. Default credentials:
   - Email: `admin@library.com`
   - Password: `admin123`

6. To stop:
   ```bash
   docker-compose down
   ```

---

### Option 2: Local Development Setup

#### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in `server/` directory:
   ```bash
   cp ../.env.example .env
   ```
   
   Example `.env` for local MongoDB:
   ```env
   MONGO_URI=mongodb://localhost:27017/library_db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   NODE_ENV=development
   ```

4. Ensure MongoDB is running locally:
   ```bash
   # On Windows (if using MongoDB Community)
   net start MongoDB
   
   # On macOS (if using Homebrew)
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   Server running in development mode on port 5000
   API accessible at http://localhost:5000/api
   ```

#### Frontend Setup

1. Navigate to client directory (from root):
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v7.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173
   ```

4. Open http://localhost:5173 in your browser

---

## Migrations and Seeding

### Seeding Data

The system includes an automated seeder that creates default admin and sample data on first backend startup.

#### Option 1: Automatic Seeding (Default)
- Run the server; seeding runs automatically on first connection to MongoDB

#### Option 2: Manual Seeding
1. Ensure MongoDB is running
2. From the `server/` directory:
   ```bash
   npm run seed
   ```

#### Seeded Data
- **Admin User**
  - Email: `admin@library.com`
  - Password: `admin123`
  - Role: Admin

- **Sample User**
  - Email: `user@library.com`
  - Password: `user123`
  - Role: User

- **3 Sample Authors**: J.K. Rowling, George Orwell, Isaac Asimov
- **3 Sample Books**: Harry Potter, 1984, Foundation

#### Disabling Auto-Seeding
To disable auto-seeding on server startup, comment out the seeder call in `server/server.js`:
```javascript
// const seedData = require('./seeder');
// ... (commented out)
```

---

## Authentication and Testing Protected Routes

### Getting a JWT Token

#### Method 1: Through the UI
1. Navigate to http://localhost:5173 (frontend)
2. Log in with:
   - Email: `admin@library.com`
   - Password: `admin123`
3. The token is stored automatically in browser local storage

#### Method 2: Using cURL (Backend Testing)

1. Get token:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@library.com","password":"admin123"}'
   ```

   Response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "_id": "...",
       "name": "System Admin",
       "email": "admin@library.com",
       "role": "ADMIN"
     }
   }
   ```

2. Copy the `token` value and use it in subsequent requests:
   ```bash
   curl http://localhost:5000/api/books \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

#### Method 3: Using Postman
1. Open Postman
2. Create a POST request to `http://localhost:5000/api/auth/login`
3. Set Body (raw JSON):
   ```json
   {
     "email": "admin@library.com",
     "password": "admin123"
   }
   ```
4. Send and copy the token from response
5. For protected routes, set Authorization header:
   - Type: Bearer Token
   - Token: `<paste_token_here>`

### Testing Protected Routes

#### Books Endpoints (Require Authentication)

**List all books** (GET):
```bash
curl http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create a book** (POST, Admin only):
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Hobbit",
    "authorId": "AUTHOR_ID",
    "isbn": "978-0547928227",
    "publishedYear": 1937,
    "status": "AVAILABLE"
  }'
```

**Update a book** (PUT, Admin only):
```bash
curl -X PUT http://localhost:5000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Delete a book** (DELETE, Admin only):
```bash
curl -X DELETE http://localhost:5000/api/books/BOOK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Users Endpoints (Admin Only)

**List all users** (GET):
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Create a user** (POST):
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@library.com",
    "password": "password123",
    "role": "USER"
  }'
```

**Update a user** (PUT):
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "role": "ADMIN"}'
```

**Delete a user** (DELETE):
```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Authors Endpoints

**List all authors** (GET):
```bash
curl http://localhost:5000/api/authors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create an author** (POST, Admin only):
```bash
curl -X POST http://localhost:5000/api/authors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "J.R.R. Tolkien", "bio": "British author and philologist"}'
```

---

## API Routes Reference

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Books
- `GET /api/books` - List books (filters: search, status, authorId)
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)
- `POST /api/books/:id/borrow` - Borrow a book (Authenticated users)
- `POST /api/books/:id/return` - Return a book (Authenticated users)
- `GET /api/books/my-loans` - Get user's borrowed books (Authenticated users)

### Authors
- `GET /api/authors` - List all authors (Authenticated)
- `POST /api/authors` - Create author (Admin only)
- `PUT /api/authors/:id` - Update author (Admin only)
- `DELETE /api/authors/:id` - Delete author (Admin only)

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

---

## Design Decisions & Architecture Notes

### State Management
- **Zustand**: Lightweight, hook-based global state for authentication. Persists auth tokens and user info to localStorage for session recovery.
- **React Query Alternative**: Could be added for server state caching if API call frequency increases.

### Frontend Architecture
- **Pages vs Components**: Pages contain business logic and data fetching; UI components are reusable and stateless.
- **API Service Layer**: `services/api.ts` centralizes all backend communication. Mock data support included for frontend-only development.
- **Styling**: Tailwind CSS with custom component layer (`components/ui/*`) for consistent design.
- **Routing**: React Router v7 with protected routes (ProtectedRoute, AdminRoute HOCs).

### Backend Architecture
- **MVC Pattern**: Models (Mongoose), Controllers (business logic), Routes (HTTP endpoints).
- **Middleware**: Auth middleware validates JWT tokens; error middleware standardizes error responses.
- **Password Hashing**: bcryptjs with pre-save hooks in User model (never store plain-text passwords).
- **JWT Strategy**: Tokens contain user ID and role; issued on login, validated on each protected route.

### Database Design
- **MongoDB**: Chosen for flexible schema, document-based relationships (e.g., Book.authorId can be populated).
- **Relationships**: One-to-Many (Author → Books), Many-to-Many (Users ↔ Books via BorrowRecord).
- **Indexing**: Email field indexed for faster login queries.

### Security Considerations
- **JWT Tokens**: Stateless, no server-side session storage. Expiry can be added (currently infinite).
- **Password Hashing**: 10-round bcryptjs (cost factor), stored in DB, never transmitted.
- **CORS**: Enabled for frontend domain; adjust in production (`CORS_ORIGIN` env var).
- **HTTP-Only Cookies**: Future enhancement to store tokens (prevents XSS attacks).
- **Input Validation**: Basic validation in controllers; consider adding joi or zod schemas.

### Error Handling
- **Centralized Error Middleware**: Catches exceptions, logs, returns consistent JSON error format.
- **Custom Error Classes**: Consider extending for more granular error handling.

### Scalability Notes
- **Pagination**: Books endpoint could add limit/skip for large datasets.
- **Caching**: Redis could cache frequently accessed data (author list, popular books).
- **Background Jobs**: Consider Bull/Agenda for async tasks (e.g., book reservation reminders).

---

## Environment Variables

See `.env.example` for all required variables. Key variables:

### Backend
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing (change in production!)
- `PORT` - Server port (default 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS (default http://localhost:3000)

### Frontend
- `VITE_API_URL` - Backend API base URL (default http://localhost:5000)

---

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**
- Ensure MongoDB is running: `mongosh` should connect
- Check `MONGO_URI` in `.env` matches your setup
- On Windows: `net start MongoDB` to start the service

**Error: Port 5000 already in use**
- Change `PORT` in `.env` to a different port
- Or kill process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

**Error: JWT authentication failing**
- Ensure `JWT_SECRET` in `.env` is set and consistent
- Clear browser local storage and re-login
- Check token format: should be `Bearer <token>` in Authorization header

### Frontend Issues

**Error: Cannot reach API at localhost:5000**
- Ensure backend is running: `npm run dev` in `server/`
- Check `VITE_API_URL` in frontend `.env`
- Check CORS is enabled in backend

**Error: Blank login page**
- Clear browser cache and local storage
- Check console for JavaScript errors
- Ensure Vite dev server is running on correct port

### Docker Issues

**Error: Port 3000 already in use**
- Change port mapping in `docker-compose.yml`: `"3001:3000"`
- Or stop other containers: `docker-compose down`

**Error: Volumes not mounting**
- Ensure Docker Desktop has file sharing enabled
- Rebuild: `docker-compose up --build`

---

## Project Structure

```
libmanager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── store.ts        # Zustand state
│   │   ├── types.ts        # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js backend
│   ├── routes/             # API route definitions
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # Auth, error handling
│   ├── config/             # Database config
│   ├── seeder.js           # Initial data seeding
│   ├── server.js           # Express app entry
│   ├── package.json
│   └── .env                # Environment variables
├── docker-compose.yml      # Docker orchestration
├── nginx.conf              # Nginx configuration
└── README.md               # This file
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Support

For issues, questions, or suggestions:
1. Check the Troubleshooting section above
2. Review existing GitHub issues
3. Open a new GitHub issue with detailed description and error logs

---

## Changelog

### v1.0.0 (Initial Release)
- Full MERN stack library management system
- Role-based authentication (Admin/User)
- Complete book, author, and user CRUD operations
- Book borrowing and return workflows
- Responsive React UI with Tailwind CSS
- Docker containerization
- Comprehensive API documentation
