// apps/web/app/admin/doctors/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  useDoctorsList,
  useCreateDoctor,
  useDeleteDoctor,
  useUsersList,
} from '@/lib/hooks/use-api';

import { DoctorsList } from '@/components/doctors-list';
import { DoctorForm } from '@/components/doctor-form';
import { Plus } from 'lucide-react';

export default function DoctorsPage() {
  const { user } = useAuthStore();
  const clinicId = user?.clinicId;
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  const { data: doctors = [], isLoading } = useDoctorsList(clinicId);
  const { data: users = [] } = useUsersList(clinicId);
  const createMutation = useCreateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleCreate = async (data: any) => {
    if (!clinicId) return;
    try {
      await createMutation.mutateAsync({
        ...data,
        clinicId,
      });
      setShowForm(false);
      setEditingDoctor(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await deleteMutation.mutateAsync(doctorId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Add Doctor</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <DoctorForm
            onSubmit={handleCreate}
            loading={createMutation.isPending}
            users={users}
          />
        </div>
      )}

      {isLoading ? <p className="text-gray-600">Loading doctors...</p> : <DoctorsList doctors={doctors} onEdit={handleEdit} onDelete={handleDelete} />}
    </div>
  );
}
