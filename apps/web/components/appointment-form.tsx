// apps/web/components/appointment-form.tsx
'use client';

import { useState } from 'react';

export function AppointmentForm({
  onSubmit,
  loading,
  patients,
  doctors,
}: {
  onSubmit: (data: any) => void;
  loading: boolean;
  patients: any[];
  doctors: any[];
}) {
  const [patientId, setPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [patientDropdown, setPatientDropdown] = useState(false);
  const [doctorDropdown, setDoctorDropdown] = useState(false);

  const filteredPatients = patients.filter((p) =>
    p.user.name.toLowerCase().includes(patientSearch.toLowerCase()),
  );

  const filteredDoctors = doctors.filter((d) =>
    d.user.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization.toLowerCase().includes(doctorSearch.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId) {
      alert('Please select both patient and doctor');
      return;
    }
    onSubmit({
      patientId,
      doctorId,
      appointmentTime: new Date(appointmentTime).toISOString(),
      notes,
    });
    setPatientId('');
    setPatientSearch('');
    setDoctorId('');
    setDoctorSearch('');
    setAppointmentTime('');
    setNotes('');
  };

  const selectedPatient = patients.find((p) => p.id === patientId);
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
          <input
            type="text"
            placeholder="Search patient..."
            value={selectedPatient ? selectedPatient.user.name : patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              setPatientId('');
              setPatientDropdown(true);
            }}
            onFocus={() => setPatientDropdown(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {patientDropdown && filteredPatients.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    setPatientId(patient.id);
                    setPatientSearch('');
                    setPatientDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm"
                >
                  {patient.user.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
          <input
            type="text"
            placeholder="Search doctor..."
            value={selectedDoctor ? `${selectedDoctor.user.name} (${selectedDoctor.specialization})` : doctorSearch}
            onChange={(e) => {
              setDoctorSearch(e.target.value);
              setDoctorId('');
              setDoctorDropdown(true);
            }}
            onFocus={() => setDoctorDropdown(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {doctorDropdown && filteredDoctors.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {filteredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => {
                    setDoctorId(doctor.id);
                    setDoctorSearch('');
                    setDoctorDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm"
                >
                  {doctor.user.name} ({doctor.specialization})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
        <input
          type="datetime-local"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
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
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
