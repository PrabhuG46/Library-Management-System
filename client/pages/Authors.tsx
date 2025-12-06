
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { api } from '../services/api';
import { Author, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, User as UserIcon, Edit2, Trash2 } from 'lucide-react';

export const Authors: React.FC = () => {
  const { token, user } = useAuthStore();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author>>({ name: '', bio: '' });

  useEffect(() => {
    fetchAuthors();
  }, [token]);

  const fetchAuthors = async () => {
    if (!token) return;
    try {
      const data = await api.authors.getAll(token);
      setAuthors(data);
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
      if (editingAuthor._id) {
        await api.authors.update(token, editingAuthor._id, editingAuthor);
      } else {
        await api.authors.create(token, editingAuthor);
      }
      setIsModalOpen(false);
      setEditingAuthor({ name: '', bio: '' });
      fetchAuthors();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure? This may affect books linked to this author.')) return;
    try {
      await api.authors.delete(token, id);
      setAuthors(authors.filter(a => a._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openModal = (author?: Author) => {
    setEditingAuthor(author || { name: '', bio: '' });
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading authors...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Authors</h1>
        {user?.role === UserRole.ADMIN && (
          <Button onClick={() => openModal()}>
            <Plus size={18} className="mr-2" /> Add Author
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map(author => (
          <div key={author._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
              <UserIcon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900">{author.name}</h3>
              <p className="text-slate-500 text-sm mt-1 line-clamp-3 mb-3">{author.bio}</p>
              
              {user?.role === UserRole.ADMIN && (
                <div className="flex gap-2">
                   <button onClick={() => openModal(author)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                      <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(author._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingAuthor._id ? 'Edit Author' : 'Add Author'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <Input 
                label="Name" 
                value={editingAuthor.name} 
                onChange={e => setEditingAuthor({...editingAuthor, name: e.target.value})} 
                required 
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    rows={3}
                    value={editingAuthor.bio}
                    onChange={e => setEditingAuthor({...editingAuthor, bio: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
