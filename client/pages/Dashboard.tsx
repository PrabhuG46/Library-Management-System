import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { api } from '../services/api';
import { Stats } from '../types';
import { Book, Users, BookOpenCheck, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`p-4 rounded-lg ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (token) {
          const data = await api.stats.getDashboard(token);
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="animate-pulse flex gap-4"><div className="h-32 w-full bg-slate-200 rounded-xl"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-slate-500">Here's what's happening in your library today.</p>
        </div>
        <span className="text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Books" 
          value={stats?.totalBooks || 0} 
          icon={Book} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Available" 
          value={stats?.availableBooks || 0} 
          icon={BookOpenCheck} 
          color="bg-green-600" 
        />
        <StatCard 
          title="Active Loans" 
          value={stats?.activeLoans || 0} 
          icon={Activity} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="bg-purple-600" 
        />
      </div>

      
    </div>
  );
};