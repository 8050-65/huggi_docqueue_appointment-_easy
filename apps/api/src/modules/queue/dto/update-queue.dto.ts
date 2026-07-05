// apps/api/src/modules/queue/dto/update-queue.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateQueueDto {
  @ApiProperty({
    example: 'called',
    description: 'New queue status. Allowed: waiting | called | in_consultation | done | no_show',
    enum: ['waiting', 'called', 'in_consultation', 'done', 'no_show'],
  })
  @IsNotEmpty()
  @IsIn(['waiting', 'called', 'in_consultation', 'done', 'no_show'])
  status!: string;

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;
}
