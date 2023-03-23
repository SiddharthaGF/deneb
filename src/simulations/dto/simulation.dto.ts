import {
  IsDefined,
  IsEnum,
  IsOptional,
  IsPositive,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
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
    const k = args.object['k'];
    if (k) return 'lambda/(miu*k) < 1 does not satisfy the stability condition';
    else return 'lambda/miu < 1 does not satisfy the stability condition';
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
    default:
      return false;
  }
}

export class SimulationDto {
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsDefined()
  lambda: number;

  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsDefined()
  miu: number;

  @ValidateIf(
    (simulation) =>
      simulation.queueModel === QueueModels.MM1MM ||
      simulation.queueModel === QueueModels.MMKMM,
  )
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  M: number;

  @ValidateIf(
    (simulation) =>
      simulation.queueModel === QueueModels.MMK ||
      simulation.queueModel === QueueModels.MMKMM,
  )
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  k: number;

  @Transform(({ value }) => parseInt(value))
  @IsEnum(DecimalPrecision)
  @IsOptional()
  N: number;

  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Cte: number;

  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Cts: number;

  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Ctse: number;

  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  Cs: number;

  @ValidateIf(
    (simulation) =>
      simulation.Cte != undefined ||
      simulation.Cts != undefined ||
      simulation.Ctse != undefined ||
      simulation.Cs != undefined,
  )
  @Transform(({ value }) => parseFloat(value))
  @IsPositive()
  @IsOptional()
  hr: number;

  @Transform(({ value }) => parseInt(value))
  @IsEnum(DecimalPrecision)
  @IsOptional()
  decimalPrecision: DecimalPrecision = DecimalPrecision.D6;

  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(SimulationType)
  @IsOptional()
  simulationType: SimulationType = SimulationType.SYSTEM;

  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(TimeUnit)
  @IsOptional()
  timeUnit: TimeUnit = TimeUnit.HOURS;

  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Quantifiers)
  @IsOptional()
  quantifier: Quantifiers = Quantifiers.EXACTLY;

  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(QueueModels)
  @IsDefined()
  @Validate(StabilityConditionConstraint)
  queueModel: QueueModels;
}
