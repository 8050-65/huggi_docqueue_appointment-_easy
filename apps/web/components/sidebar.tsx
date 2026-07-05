// apps/web/components/sidebar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Users, Stethoscope, Calendar, Clock, BarChart3, LogOut, UserPlus } from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Huggi</h1>
        <p className="text-gray-400 text-sm">Queue Management</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/doctors"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <Stethoscope size={20} />
          <span>Doctors</span>
        </Link>

        <Link
          href="/admin/patients"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <Users size={20} />
          <span>Patients</span>
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <UserPlus size={20} />
          <span>Users</span>
        </Link>

        <Link
          href="/admin/appointments"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <Calendar size={20} />
          <span>Appointments</span>
        </Link>

        <Link
          href="/admin/queue"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <Clock size={20} />
          <span>Queue</span>
        </Link>
      </nav>

      <div className="p-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-red-400"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
