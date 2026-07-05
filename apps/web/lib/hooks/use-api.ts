// apps/web/lib/hooks/use-api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useApi() {
  return apiClient;
}

export function useClinicById(clinicId: string | null | undefined) {
  const api = useApi();
  return useQuery<any>({
    queryKey: ['clinic', clinicId],
    queryFn: () => api.get(`/clinics/${clinicId}`),
    enabled: !!clinicId,
  });
}

export function useDoctorsList(clinicId: string | null | undefined) {
  const api = useApi();
  return useQuery<any[]>({
    queryKey: ['doctors', clinicId],
    queryFn: () => api.get(`/doctors?clinicId=${clinicId}`),
    enabled: !!clinicId,
  });
}

export function useCreateDoctor() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/doctors', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.clinicId] });
    },
  });
}

export function useUpdateDoctor(doctorId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch(`/doctors/${doctorId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useDeleteDoctor() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doctorId: string) => api.delete(`/doctors/${doctorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function usePatientsList(clinicId: string | null | undefined) {
  const api = useApi();
  return useQuery<any[]>({
    queryKey: ['patients', clinicId],
    queryFn: () => api.get(`/patients?clinicId=${clinicId}`),
    enabled: !!clinicId,
  });
}

export function useCreatePatient() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/patients', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.clinicId] });
    },
  });
}

export function useUpdatePatient(patientId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch(`/patients/${patientId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => api.delete(`/patients/${patientId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useAppointmentsList(clinicId: string | null | undefined) {
  const api = useApi();
  return useQuery<any[]>({
    queryKey: ['appointments', clinicId],
    queryFn: () => api.get(`/appointments?clinicId=${clinicId}`),
    enabled: !!clinicId,
  });
}

export function useCreateAppointment() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/appointments', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['queue', variables.clinicId] });
    },
  });
}

export function useUpdateAppointment(appointmentId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch(`/appointments/${appointmentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelAppointment() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => api.post(`/appointments/${appointmentId}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useDeleteAppointment() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => api.delete(`/appointments/${appointmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useQueueList(clinicId: string | null | undefined, status?: string) {
  const api = useApi();
  return useQuery<any[]>({
    queryKey: ['queue', clinicId, status],
    queryFn: () => api.get(`/queue?clinicId=${clinicId}${status ? `&status=${status}` : ''}`),
    enabled: !!clinicId,
    refetchInterval: 5000,
  });
}

export function useUpdateQueueStatus() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queueId, status }: { queueId: string; status: string }) =>
      api.patch(`/queue/${queueId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useUsersList(clinicId: string | null | undefined) {
  const api = useApi();
  return useQuery<any[]>({
    queryKey: ['users', clinicId],
    queryFn: () => api.get(`/users?clinicId=${clinicId}`),
    enabled: !!clinicId,
  });
}

export function useCreateUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.clinicId] });
    },
  });
}

export function useUpdateUser(userId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch(`/users/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
