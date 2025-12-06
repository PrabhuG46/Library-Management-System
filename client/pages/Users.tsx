import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Shield, User as UserIcon, Edit2, Trash2 } from 'lucide-react';

export const Users: React.FC = () => {
  const { token, user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string }>({ 
    name: '', 
    email: '', 
    password: '', 
    role: UserRole.USER 
  });

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const data = await api.users.getAll(token);
      setUsers(data);
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
      if (editingUser._id) {
        await api.users.update(token, editingUser._id, editingUser);
      } else {
        await api.users.create(token, editingUser as Partial<User> & { password: string });
      }
      setIsModalOpen(false);
      setEditingUser({ name: '', email: '', password: '', role: UserRole.USER });
      fetchUsers();
    } catch (err) {
      alert('Operation failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.users.delete(token, id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openModal = (editUser?: User) => {
    setEditingUser(editUser ? { ...editUser, password: '' } : { name: '', email: '', password: '', role: UserRole.USER });
    setIsModalOpen(true);
  };

  if (user?.role !== UserRole.ADMIN) return <div className="p-8 text-center">Access Denied</div>;
  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <Button onClick={() => openModal()}>
          <Plus size={18} className="mr-2" /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">User</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Email</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
              <th className="px-6 py-4 font-semibold text-slate-700">ID</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        {u.role === UserRole.ADMIN ? <Shield size={14} /> : <UserIcon size={14} />}
                    </div>
                    <span className="font-medium text-slate-900">{u.name}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  <Badge variant={u.role === UserRole.ADMIN ? 'warning' : 'neutral'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{u._id}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(u)} className="text-slate-400 hover:text-slate-900">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(u._id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingUser._id ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <Input 
                label="Full Name" 
                value={editingUser.name || ''} 
                onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                required 
              />
              <Input 
                label="Email" 
                type="email"
                value={editingUser.email || ''} 
                onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                required 
              />
              <Input 
                label={editingUser._id ? 'Password (leave blank to keep current)' : 'Password'}
                type="password"
                value={editingUser.password || ''} 
                onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
                required={!editingUser._id}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    value={editingUser.role}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                >
                    <option value={UserRole.USER}>User</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingUser._id ? 'Update User' : 'Create User'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};