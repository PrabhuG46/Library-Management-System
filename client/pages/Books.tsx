
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { api } from '../services/api';
import { Book, UserRole, BookStatus, Author, User } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import { USE_MOCK_DATA } from '../constants';

export const Books: React.FC = () => {
  const { token, user } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [myLoans, setMyLoans] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [token, debouncedSearch, statusFilter, authorFilter]);

  const fetchData = async () => {
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      
      const filters = {
        search: debouncedSearch,
        status: statusFilter,
        authorId: authorFilter
      };

      const [booksData, authorsData] = await Promise.all([
        api.books.getAll(token, filters),
        api.authors.getAll(token)
      ]);
      setBooks(booksData);
      setAuthors(authorsData);

      if (user?.role === UserRole.USER) {
        const loans = await api.books.getMyLoans(token);
        setMyLoans(loans.map(b => b._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingBook._id) {
        await api.books.update(token, editingBook._id, editingBook);
      } else {
        await api.books.create(token, { ...editingBook, status: BookStatus.AVAILABLE } as Book);
      }
      setIsModalOpen(false);
      setEditingBook({});
      fetchData();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure?')) return;
    try {
      await api.books.delete(token, id);
      setBooks(books.filter(b => b._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleBorrow = async (id: string) => {
    if (!token) return;
    try {
      await api.books.borrow(token, id);
      fetchData(); // Refresh to update status
    } catch (err) {
      alert('Borrow failed');
    }
  };

  const handleReturn = async (id: string) => {
    if (!token) return;
    try {
      await api.books.return(token, id);
      fetchData();
    } catch (err) {
      alert('Return failed');
    }
  };

  const getAuthorName = (authorId: string | Author) => {
     if (typeof authorId === 'object') return authorId?.name || 'Unknown';
     const author = authors.find(a => a._id === authorId);
     return author?.name || 'Unknown';
  };

  const getBorrowerName = (borrowedBy?: string | User | null) => {
      if (!borrowedBy) return '-';
      if (typeof borrowedBy === 'object') return borrowedBy.name;
      return 'User ID: ' + borrowedBy;
  };

  if (loading && books.length === 0) return <div className="text-center py-10">Loading library...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Library Books</h1>
        {user?.role === UserRole.ADMIN && (
          <Button onClick={() => { setEditingBook({}); setIsModalOpen(true); }}>
            <Plus size={18} className="mr-2" /> Add Book
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Search by title or ISBN..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select 
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
        >
            <option value="">All Authors</option>
            {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <select 
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
        >
            <option value="">All Statuses</option>
            <option value={BookStatus.AVAILABLE}>Available</option>
            <option value={BookStatus.BORROWED}>Borrowed</option>
        </select>
      </div>

      {user?.role === UserRole.ADMIN ? (
        // ADMIN VIEW: Table
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Title</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Author</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">ISBN</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Borrower</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map(book => (
                  <tr key={book._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{book.title}</td>
                    <td className="px-6 py-4 text-slate-600">{getAuthorName(book.authorId)}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{book.isbn}</td>
                    <td className="px-6 py-4">
                      <Badge variant={book.status === BookStatus.AVAILABLE ? 'success' : 'warning'}>
                        {book.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {book.status === BookStatus.BORROWED ? getBorrowerName(book.borrowedBy) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingBook(book); setIsModalOpen(true); }} className="text-slate-400 hover:text-slate-900">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(book._id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No books found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // USER VIEW: Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => {
            const isBorrowedByMe = myLoans.includes(book._id) || (USE_MOCK_DATA && book.status === BookStatus.BORROWED);
            return (
              <div key={book._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-900">
                    <BookOpen size={24} />
                  </div>
                  <Badge variant={book.status === BookStatus.AVAILABLE ? 'success' : 'warning'}>
                    {book.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{book.title}</h3>
                <p className="text-slate-500 text-sm mb-4">by {getAuthorName(book.authorId)}</p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">{book.publishedYear}</span>
                  {book.status === BookStatus.AVAILABLE ? (
                    <Button size="sm" onClick={() => handleBorrow(book._id)}>Borrow</Button>
                  ) : isBorrowedByMe ? (
                    <Button variant="secondary" onClick={() => handleReturn(book._id)}>Return</Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
          {books.length === 0 && (
             <div className="col-span-full text-center py-10 text-slate-500">No books match your criteria.</div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingBook._id ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <Input 
                label="Title" 
                value={editingBook.title || ''} 
                onChange={e => setEditingBook({...editingBook, title: e.target.value})} 
                required 
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    value={typeof editingBook.authorId === 'object' ? editingBook.authorId._id : editingBook.authorId || ''}
                    onChange={e => setEditingBook({...editingBook, authorId: e.target.value})}
                    required
                >
                    <option value="">Select Author</option>
                    {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <Input 
                label="ISBN" 
                value={editingBook.isbn || ''} 
                onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} 
                required 
              />
              <Input 
                label="Year" 
                type="number" 
                value={editingBook.publishedYear || ''} 
                onChange={e => setEditingBook({...editingBook, publishedYear: parseInt(e.target.value)})} 
                required 
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Book</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
