// apps/web/app/admin/dashboard/page.tsx
'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useClinicById } from '@/lib/hooks/use-api';
import { useQueueList, useDoctorsList, usePatientsList, useAppointmentsList } from '@/lib/hooks/use-api';
import { BarChart3, Stethoscope, Users, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const clinicId = user?.clinicId;

  const { data: clinic, isLoading: clinicLoading } = useClinicById(clinicId);
  const { data: doctors } = useDoctorsList(clinicId);
  const { data: patients } = usePatientsList(clinicId);
  const { data: appointments } = useAppointmentsList(clinicId);
  const { data: queue } = useQueueList(clinicId);

  const doctorCount = Array.isArray(doctors) ? doctors.length : 0;
  const patientCount = Array.isArray(patients) ? patients.length : 0;
  const appointmentCount = Array.isArray(appointments) ? appointments.length : 0;
  const waitingCount = Array.isArray(queue) ? queue.filter((q: any) => q.status === 'waiting').length : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {clinic && !clinicLoading && (
          <p className="text-gray-600 mt-2">
            Welcome to <strong>{(clinic as any).name}</strong>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{doctorCount}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Stethoscope className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Patients</p>
              <p className="text-3xl font-bold text-gray-900">{patientCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{appointmentCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Waiting</p>
              <p className="text-3xl font-bold text-gray-900">{waitingCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {clinic && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Clinic Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-gray-900 font-medium">{(clinic as any).name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Address</p>
              <p className="text-gray-900 font-medium">{(clinic as any).address}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="text-gray-900 font-medium">{(clinic as any).phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
