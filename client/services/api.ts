
import { USE_MOCK_DATA, API_URL, MOCK_DELAY } from '../constants';
import { User, Book, Author, BorrowRecord, AuthResponse, UserRole, BookStatus, Stats } from '../types';

 
let mockUsers: User[] = [];
let mockAuthors: Author[] = [];
let mockBooks: Book[] = [];
let mockLoans: BorrowRecord[] = [];

// --- HELPER ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHeaders = (token?: string) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = res.statusText;
    try {
        const json = JSON.parse(text);
        errorMessage = json.message || errorMessage;
    } catch {
        errorMessage = text || `Error ${res.status}`;
    }
    throw new Error(errorMessage);
  }
  // For 204 No Content
  if (res.status === 204) return null;
  return res.json();
};

const safeFetch = async (url: string, options: RequestInit) => {
    try {
        const res = await fetch(url, options);
        return handleResponse(res);
    } catch (error: any) {
        if (error.message === 'Failed to fetch') {
            throw new Error(`Cannot reach server at ${API_URL}. Is the backend running?`);
        }
        throw error;
    }
}

// --- API METHODS ---

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        const user = mockUsers.find(u => u.email === email);
        if (user && (password === 'admin123' || password === 'user123')) {
          return { token: 'mock-jwt-token', user };
        }
        throw new Error('Invalid credentials');
      }
      return safeFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
    }
  },

  stats: {
    getDashboard: async (token: string): Promise<Stats> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        return {
          totalBooks: mockBooks.length,
          availableBooks: mockBooks.filter(b => b.status === BookStatus.AVAILABLE).length,
          totalUsers: mockUsers.length,
          activeLoans: mockLoans.filter(l => l.status === 'ACTIVE').length,
        };
      }
      
      // In a real app you might have a dedicated dashboard endpoint. 
      // Here we aggregate manually or assume the backend provides specific endpoints.
      // For efficiency, we will fetch books and users.
      
      const books: Book[] = await safeFetch(`${API_URL}/books`, { headers: getHeaders(token) });
      const users: User[] = await safeFetch(`${API_URL}/users`, { headers: getHeaders(token) }).catch(() => []);
      
      return {
        totalBooks: books.length,
        availableBooks: books.filter((b: any) => b.status === 'AVAILABLE').length,
        totalUsers: users.length || 0,
        activeLoans: books.filter((b: any) => b.status === 'BORROWED').length
      };
    }
  },

  books: {
    getAll: async (token: string, filters?: { search?: string, status?: string, authorId?: string }): Promise<Book[]> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        let result = [...mockBooks];
        if (filters?.search) {
            const lower = filters.search.toLowerCase();
            result = result.filter(b => b.title.toLowerCase().includes(lower) || b.isbn.includes(filters.search!));
        }
        if (filters?.status) result = result.filter(b => b.status === filters.status);
        if (filters?.authorId) result = result.filter(b => (typeof b.authorId === 'object' ? b.authorId._id : b.authorId) === filters.authorId);
        return result;
      }
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.authorId) params.append('authorId', filters.authorId);

      return safeFetch(`${API_URL}/books?${params.toString()}`, { headers: getHeaders(token) });
    },
    create: async (token: string, book: Partial<Book>): Promise<Book> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        const newBook = { ...book, _id: Math.random().toString(), status: BookStatus.AVAILABLE } as Book;
        mockBooks.push(newBook);
        return newBook;
      }
      return safeFetch(`${API_URL}/books`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(book),
      });
    },
    update: async (token: string, id: string, book: Partial<Book>): Promise<Book> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        mockBooks = mockBooks.map(b => b._id === id ? { ...b, ...book } : b);
        return mockBooks.find(b => b._id === id) as Book;
      }
      return safeFetch(`${API_URL}/books/${id}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(book),
      });
    },
    delete: async (token: string, id: string): Promise<void> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        mockBooks = mockBooks.filter(b => b._id !== id);
        return;
      }
      return safeFetch(`${API_URL}/books/${id}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
    },
    borrow: async (token: string, bookId: string): Promise<void> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        const book = mockBooks.find(b => b._id === bookId);
        if (book) {
            book.status = BookStatus.BORROWED;
        }
        return;
      }
      return safeFetch(`${API_URL}/books/${bookId}/borrow`, {
        method: 'POST',
        headers: getHeaders(token),
      });
    },
    return: async (token: string, bookId: string): Promise<void> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        const book = mockBooks.find(b => b._id === bookId);
        if (book) {
            book.status = BookStatus.AVAILABLE;
            book.borrowedBy = undefined;
        }
        return;
      }
      return safeFetch(`${API_URL}/books/${bookId}/return`, {
        method: 'POST',
        headers: getHeaders(token),
      });
    },
    getMyLoans: async (token: string): Promise<Book[]> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        return mockBooks.filter(b => b.status === BookStatus.BORROWED); 
      }
      return safeFetch(`${API_URL}/books/my-loans`, { headers: getHeaders(token) });
    }
  },

  authors: {
    getAll: async (token: string): Promise<Author[]> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        return [...mockAuthors];
      }
      return safeFetch(`${API_URL}/authors`, { headers: getHeaders(token) });
    },
    create: async (token: string, author: Partial<Author>): Promise<Author> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        const newAuthor = { ...author, _id: Math.random().toString() } as Author;
        mockAuthors.push(newAuthor);
        return newAuthor;
      }
      return safeFetch(`${API_URL}/authors`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(author),
      });
    },
    update: async (token: string, id: string, author: Partial<Author>): Promise<Author> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        mockAuthors = mockAuthors.map(a => a._id === id ? { ...a, ...author } : a);
        return mockAuthors.find(a => a._id === id) as Author;
      }
      return safeFetch(`${API_URL}/authors/${id}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(author),
      });
    },
    delete: async (token: string, id: string): Promise<void> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        mockAuthors = mockAuthors.filter(a => a._id !== id);
        return;
      }
      return safeFetch(`${API_URL}/authors/${id}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
    }
  },

  users: {
    getAll: async (token: string): Promise<User[]> => {
      if (USE_MOCK_DATA) {
        await sleep(MOCK_DELAY);
        return [...mockUsers];
      }
      return safeFetch(`${API_URL}/users`, { headers: getHeaders(token) });
    },
    create: async (token: string, user: Partial<User> & {password: string}): Promise<User> => {
         if (USE_MOCK_DATA) {
            await sleep(MOCK_DELAY);
            const newUser = {...user, _id: Math.random().toString()} as User;
            mockUsers.push(newUser);
            return newUser;
         }
         return safeFetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(user)
         });
    },
    update: async (token: string, id: string, user: Partial<User>): Promise<User> => {
         if (USE_MOCK_DATA) {
            await sleep(MOCK_DELAY);
            const index = mockUsers.findIndex(u => u._id === id);
            if (index !== -1) {
              mockUsers[index] = { ...mockUsers[index], ...user };
              return mockUsers[index];
            }
            throw new Error('User not found');
         }
         return safeFetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(token),
            body: JSON.stringify(user)
         });
    },
    delete: async (token: string, id: string): Promise<void> => {
         if (USE_MOCK_DATA) {
            await sleep(MOCK_DELAY);
            mockUsers = mockUsers.filter(u => u._id !== id);
            return;
         }
         return safeFetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(token)
         });
    }
  }
};
