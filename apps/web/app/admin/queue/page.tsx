// apps/web/app/admin/queue/page.tsx
'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useQueueList, useUpdateQueueStatus } from '@/lib/hooks/use-api';
import { CheckCircle, Clock, Play, AlertCircle, XCircle } from 'lucide-react';

function QueueCard({
  item,
  actions,
  onAction,
}: {
  item: any;
  actions?: { label: string; className: string; status: string }[];
  onAction?: (queueId: string, status: string) => void;
}) {
  const patientName = item.appointment?.patient?.user?.name ?? 'Unknown Patient';
  const doctorName = item.appointment?.doctor?.user?.name ?? 'Unknown Doctor';
  const appointmentTime = item.appointment?.appointmentTime
    ? new Date(item.appointment.appointmentTime).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  return (
    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{patientName}</p>
      <p className="text-xs text-gray-500">Dr. {doctorName}</p>
      <p className="text-xs text-gray-400">{appointmentTime}</p>
      {actions && actions.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              onClick={() => onAction?.(item.id, action.status)}
              className={`flex-1 text-xs text-white py-1 rounded transition ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QueuePage() {
  const { user } = useAuthStore();
  const clinicId = user?.clinicId;

  const { data: queue, isLoading } = useQueueList(clinicId);
  const updateStatusMutation = useUpdateQueueStatus();

  const waitingQueue = Array.isArray(queue) ? queue.filter((q: any) => q.status === 'waiting') : [];
  const calledQueue = Array.isArray(queue) ? queue.filter((q: any) => q.status === 'called') : [];
  const inConsultationQueue = Array.isArray(queue)
    ? queue.filter((q: any) => q.status === 'in_consultation')
    : [];
  const doneQueue = Array.isArray(queue) ? queue.filter((q: any) => q.status === 'done') : [];
  const noShowQueue = Array.isArray(queue) ? queue.filter((q: any) => q.status === 'no_show') : [];

  const handleCallNext = async () => {
    if (waitingQueue.length === 0) return;
    try {
      await updateStatusMutation.mutateAsync({ queueId: waitingQueue[0].id, status: 'called' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (queueId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ queueId, status });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-600">Loading queue...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Queue Management</h1>
        <button
          type="button"
          onClick={handleCallNext}
          disabled={waitingQueue.length === 0 || updateStatusMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
        >
          Call Next Patient ({waitingQueue.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Waiting */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Waiting</h2>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-4">{waitingQueue.length}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {waitingQueue.map((item: any) => (
              <QueueCard
                key={item.id}
                item={item}
                onAction={handleAction}
                actions={[
                  { label: 'No Show', status: 'no_show', className: 'bg-gray-400 hover:bg-gray-500' },
                ]}
              />
            ))}
          </div>
        </div>

        {/* Called */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Called</h2>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-4">{calledQueue.length}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {calledQueue.map((item: any) => (
              <QueueCard
                key={item.id}
                item={item}
                onAction={handleAction}
                actions={[
                  { label: 'In Consultation', status: 'in_consultation', className: 'bg-yellow-600 hover:bg-yellow-700' },
                  { label: 'No Show', status: 'no_show', className: 'bg-gray-400 hover:bg-gray-500' },
                ]}
              />
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center space-x-2 mb-3">
            <Play className="text-orange-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">In Progress</h2>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-4">{inConsultationQueue.length}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {inConsultationQueue.map((item: any) => (
              <QueueCard
                key={item.id}
                item={item}
                onAction={handleAction}
                actions={[
                  { label: 'Mark Done', status: 'done', className: 'bg-green-600 hover:bg-green-700' },
                ]}
              />
            ))}
          </div>
        </div>

        {/* Done */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="text-green-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Done</h2>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-4">{doneQueue.length}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {doneQueue.map((item: any) => (
              <QueueCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* No Show */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="text-gray-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900">No Show</h2>
          </div>
          <p className="text-3xl font-bold text-gray-500 mb-4">{noShowQueue.length}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {noShowQueue.map((item: any) => (
              <QueueCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
