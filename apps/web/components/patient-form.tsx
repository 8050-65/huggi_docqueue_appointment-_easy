// apps/web/components/patient-form.tsx
'use client';

import { useState } from 'react';

interface PatientInitialData {
  id: string;
  notes: string | null;
  user?: { name: string; phone: string };
}

export function PatientForm({
  onSubmit,
  loading,
  initialData,
}: {
  onSubmit: (data: any) => void;
  loading: boolean;
  users?: any[];
  initialData?: PatientInitialData;
}) {
  const isEditing = !!initialData;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      onSubmit({ notes: notes.trim() });
      return;
    }

    if (!name.trim()) {
      alert('Patient name is required');
      return;
    }

    if (!phone.trim()) {
      alert('Phone number is required');
      return;
    }

    if (phone.trim().length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    onSubmit({ name: name.trim(), phone: phone.trim(), notes: notes.trim() });
    setName('');
    setPhone('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {isEditing ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">
            Patient: <span className="font-normal">{initialData?.user?.name}</span>
          </p>
          <p className="text-sm font-medium text-gray-700">
            Phone: <span className="font-normal">{initialData?.user?.phone}</span>
          </p>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name
            </label>
            <input
              id="patient-name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="patient-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="patient-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="patient-notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          id="patient-notes"
          placeholder="Allergies, conditions, other notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading
          ? isEditing
            ? 'Saving...'
            : 'Registering...'
          : isEditing
            ? 'Update Patient'
            : 'Register Patient'}
      </button>
    </form>
  );
}
