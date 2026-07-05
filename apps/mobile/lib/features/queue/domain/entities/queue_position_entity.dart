// lib/features/queue/domain/entities/queue_position_entity.dart
class QueuePositionEntity {
  final String patientId;
  final String queueId;
  final int positionNumber;
  final String doctorName;
  final DateTime tokenTime;
  final String status; // waiting, called, in_consultation, done

  const QueuePositionEntity({
    required this.patientId,
    required this.queueId,
    required this.positionNumber,
    required this.doctorName,
    required this.tokenTime,
    required this.status,
  });
}
