// apps/web/components/doctors-list.tsx
'use client';

import { Trash2, Edit2 } from 'lucide-react';

interface Doctor {
  id: string;
  specialization: string;
  consultationDuration: number;
  isAvailable: boolean;
  user: { name: string; email: string };
}

export function DoctorsList({
  doctors,
  onEdit,
  onDelete,
}: {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
}) {
  if (!doctors || doctors.length === 0) {
    return <p className="text-gray-600">No doctors found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Specialization</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Duration (min)</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {doctors.map((doctor) => (
            <tr key={doctor.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{doctor.user.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{doctor.specialization}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{doctor.consultationDuration}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {doctor.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm space-x-2 flex">
                <button
                  onClick={() => onEdit(doctor)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => onDelete(doctor.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
