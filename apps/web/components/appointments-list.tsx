// apps/web/components/appointments-list.tsx
'use client';

import { Trash2, X } from 'lucide-react';

interface Appointment {
  id: string;
  appointmentTime: string;
  status: string;
  notes: string | null;
}

export function AppointmentsList({
  appointments,
  onCancel,
  onDelete,
}: {
  appointments: Appointment[];
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!appointments || appointments.length === 0) {
    return <p className="text-gray-600">No appointments found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Time</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">
                {new Date(appointment.appointmentTime).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    appointment.status === 'booked'
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'done'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {appointment.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{appointment.notes || '-'}</td>
              <td className="px-6 py-4 text-sm space-x-2 flex">
                {appointment.status === 'booked' && (
                  <button
                    onClick={() => onCancel(appointment.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    <X size={18} />
                  </button>
                )}
                <button onClick={() => onDelete(appointment.id)} className="text-red-600 hover:text-red-900">
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
