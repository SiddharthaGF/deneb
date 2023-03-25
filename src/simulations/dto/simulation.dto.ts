import {
  IsDefined,
  IsEnum,
  IsOptional,
  IsPositive,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  DecimalPrecision,
  Quantifiers,
  QueueModels,
  SimulationType,
  TimeUnit,
} from '../entities/simulation.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'stabilityCondition', async: false })
class StabilityConditionConstraint implements ValidatorConstraintInterface {
  validate(queueModel: QueueModels, args: ValidationArguments) {
    const lambda = args.object['lambda'];
    const miu = args.object['miu'];
    const k = args.object['k'];
    return isStable(queueModel, lambda, miu, k);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    const lambda = args.object['lambda'];
    const miu = args.object['miu'];
    const k = args.object['k'];
    const queueModel = args.object['queueModel'];
    switch (queueModel) {
      case QueueModels.MM1:
        return `lambda=${lambda}/miu=${miu} < 1 does not satisfy the stability condition`;
      case QueueModels.MMK:
        if (!k)
          return 'k is required to calculate the satisfy the stability condition';
        return `lambda=${lambda}/(miu=${miu}*k=${k}) < 1 does not satisfy the stability condition`;
    }
  }
}

function isStable(
  queueModels: QueueModels,
  lambda: number,
  miu: number,
  k?: number,
): boolean {
  switch (queueModels) {
    case QueueModels.MM1:
      return lambda / miu < 1;
    case QueueModels.MMK:
      return lambda / (k * miu) < 1;
    case QueueModels.MM1MM:
      return true;
    case QueueModels.MMKMM:
      return true;
  }
}

export class SimulationDto {
  @ApiProperty({ default: 2 })
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsDefined()
  lambda: number;

  @ApiProperty({ default: 4 })
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsDefined()
  miu: number;

  @ApiPropertyOptional()
  @ValidateIf(
    (simulation) =>
      simulation.queueModel === QueueModels.MM1MM ||
      simulation.queueModel === QueueModels.MMKMM,
  )
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  M: number;

  @ApiPropertyOptional()
  @ValidateIf(
    (simulation) =>
      simulation.queueModel === QueueModels.MMK ||
      simulation.queueModel === QueueModels.MMKMM,
  )
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  k: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsOptional()
  N: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Cte: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Cts: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Ctse: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Cs: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  hr: number;

  @ApiPropertyOptional({ enum: DecimalPrecision })
  @Transform(({ value }) => parseInt(value))
  @IsEnum(DecimalPrecision)
  @IsOptional()
  decimalPrecision: DecimalPrecision = DecimalPrecision.D6;

  @ApiPropertyOptional({ enum: SimulationType })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(SimulationType)
  @IsOptional()
  simulationType: SimulationType = SimulationType.SYSTEM;

  @ApiPropertyOptional({ enum: TimeUnit })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(TimeUnit)
  @IsOptional()
  timeUnit: TimeUnit = TimeUnit.HOURS;

  @ApiPropertyOptional({ enum: Quantifiers })
  @ValidateIf((simulation) => !isNaN(simulation.N))
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Quantifiers)
  @IsOptional()
  quantifier: Quantifiers = Quantifiers.EXACTLY;

  @ApiProperty({ enum: QueueModels })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(QueueModels)
  @IsDefined()
  @Validate(StabilityConditionConstraint)
  queueModel: QueueModels;
}
