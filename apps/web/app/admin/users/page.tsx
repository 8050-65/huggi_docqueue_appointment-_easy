// apps/web/app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  useUsersList,
  useCreateUser,
  useDeleteUser,
} from '@/lib/hooks/use-api';
import { UsersList } from '@/components/users-list';
import { UserForm } from '@/components/user-form';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuthStore();
  const clinicId = user?.clinicId;
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users = [], isLoading } = useUsersList(clinicId);
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const handleCreate = async (data: any) => {
    if (!clinicId) return;
    try {
      await createMutation.mutateAsync({
        ...data,
        clinicId,
      });
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (editUser: any) => {
    setEditingUser(editUser);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteMutation.mutateAsync(userId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <UserForm
            onSubmit={handleCreate}
            loading={createMutation.isPending}
          />
        </div>
      )}

      {isLoading ? <p className="text-gray-600">Loading users...</p> : <UsersList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
    </div>
  );
}
