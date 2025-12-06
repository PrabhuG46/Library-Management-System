import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Library, AlertCircle } from 'lucide-react';
import { USE_MOCK_DATA } from '../constants';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.login(email, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        
        <div className="flex flex-col items-center gap-3 mb-8">
            <div className="p-3 bg-slate-900 rounded-xl">
                <Library className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LibManager Pro</h1>
        </div>

        <h2 className="text-lg font-medium mb-6 text-center text-slate-600">Sign in to your account</h2>
        
        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Enter your email"
            required 
            autoFocus
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required 
          />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        {USE_MOCK_DATA && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="flex justify-between">
                <span>Admin: admin@library.com</span>
                <span>Pass: admin123</span>
            </div>
            <div className="flex justify-between mt-1">
                <span>User: user@library.com</span>
                <span>Pass: user123</span>
            </div>
            <p className="mt-4 text-center text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                Running in Mock Mode. No backend required.
            </p>
          </div>
        )}
      </div>
      <p className="mt-8 text-slate-400 text-sm">© {new Date().getFullYear()} LibManager Systems</p>
    </div>
  );
};