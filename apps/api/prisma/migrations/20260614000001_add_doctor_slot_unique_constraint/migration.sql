-- Prevent doctor double-booking at the database level.
-- Partial unique index: only active appointments (not cancelled or no_show) block a slot.
-- Cancelled slots can be rebooked by a new patient.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_doctor_time_active
  ON appointments (doctor_id, appointment_time)
  WHERE status NOT IN ('cancelled', 'no_show');
