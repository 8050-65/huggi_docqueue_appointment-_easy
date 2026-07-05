// apps/web/app/admin/patients/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  usePatientsList,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from '@/lib/hooks/use-api';
import { PatientsList } from '@/components/patients-list';
import { PatientForm } from '@/components/patient-form';
import { Plus } from 'lucide-react';

export default function PatientsPage() {
  const { user } = useAuthStore();
  const clinicId = user?.clinicId;
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const { data: patients = [], isLoading } = usePatientsList(clinicId);
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(editingPatient?.id ?? '');
  const deleteMutation = useDeletePatient();

  const handleCreate = async (data: any) => {
    if (!clinicId) return;
    try {
      await createMutation.mutateAsync({ ...data, clinicId });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateMutation.mutateAsync(data);
      setShowForm(false);
      setEditingPatient(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await deleteMutation.mutateAsync(patientId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) setEditingPatient(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={handleToggleForm}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Add Patient</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          {editingPatient ? (
            <PatientForm
              onSubmit={handleUpdate}
              loading={updateMutation.isPending}
              initialData={editingPatient}
            />
          ) : (
            <PatientForm
              onSubmit={handleCreate}
              loading={createMutation.isPending}
            />
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-600">Loading patients...</p>
      ) : (
        <PatientsList patients={patients} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
