// apps/web/components/doctor-form.tsx
'use client';

import { useState } from 'react';

export function DoctorForm({
  onSubmit,
  loading,
  users,
}: {
  onSubmit: (data: any) => void;
  loading: boolean;
  users: any[];
}) {
  const [userId, setUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [specialization, setSpecialization] = useState('General');
  const [duration, setDuration] = useState(30);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please select a user');
      return;
    }
    onSubmit({
      userId,
      specialization,
      consultationDuration: duration,
    });
    setUserId('');
    setUserSearch('');
    setSpecialization('General');
    setDuration(30);
  };

  const selectedUser = users.find((u) => u.id === userId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
        <input
          type="text"
          placeholder="Search or select user..."
          value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setUserId('');
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        {showDropdown && filteredUsers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setUserId(user.id);
                  setUserSearch('');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm"
              >
                {user.name} ({user.email})
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          min="15"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Doctor'}
      </button>
    </form>
  );
}
