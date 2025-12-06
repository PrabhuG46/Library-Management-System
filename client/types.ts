export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Author {
  _id: string;
  name: string;
  bio: string;
}

export interface Book {
  _id: string;
  title: string;
  authorId: string | Author; // Populated or ID
  isbn: string;
  publishedYear: number;
  status: BookStatus;
  borrowedBy?: string | User | null; // Populated or ID
}

export interface BorrowRecord {
  _id: string;
  userId: string | User;
  bookId: string | Book;
  borrowDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Stats {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeLoans: number;
}