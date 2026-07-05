// apps/web/app/admin/appointments/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  useAppointmentsList,
  useCreateAppointment,
  useCancelAppointment,
  useDeleteAppointment,
  usePatientsList,
  useDoctorsList,
} from '@/lib/hooks/use-api';
import { AppointmentsList } from '@/components/appointments-list';
import { AppointmentForm } from '@/components/appointment-form';
import { Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const clinicId = user?.clinicId;
  const [showForm, setShowForm] = useState(false);

  const { data: appointments = [], isLoading } = useAppointmentsList(clinicId);
  const { data: patients = [] } = usePatientsList(clinicId);
  const { data: doctors = [] } = useDoctorsList(clinicId);
  const createMutation = useCreateAppointment();
  const cancelMutation = useCancelAppointment();
  const deleteMutation = useDeleteAppointment();

  const handleCreate = async (data: any) => {
    if (!clinicId) return;
    try {
      await createMutation.mutateAsync({
        ...data,
        clinicId,
      });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await cancelMutation.mutateAsync(appointmentId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Permanently delete this appointment?')) return;
    try {
      await deleteMutation.mutateAsync(appointmentId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Book Appointment</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <AppointmentForm
            onSubmit={handleCreate}
            loading={createMutation.isPending}
            patients={patients}
            doctors={doctors}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-600">Loading appointments...</p>
      ) : (
        <AppointmentsList appointments={appointments} onCancel={handleCancel} onDelete={handleDelete} />
      )}
    </div>
  );
}
