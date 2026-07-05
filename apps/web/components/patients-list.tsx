// apps/web/components/patients-list.tsx
'use client';

import { Trash2, Edit2 } from 'lucide-react';

interface Patient {
  id: string;
  notes: string | null;
  isActive: boolean;
  user: { name: string; phone: string };
}

export function PatientsList({
  patients,
  onEdit,
  onDelete,
}: {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}) {
  if (!patients || patients.length === 0) {
    return <p className="text-gray-600">No patients found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{patient.user.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{patient.user.phone}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{patient.notes || '-'}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm space-x-2 flex">
                <button
                  onClick={() => onEdit(patient)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => onDelete(patient.id)} className="text-red-600 hover:text-red-900">
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
