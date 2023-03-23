import { Controller, Get, Query } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationDto } from './dto/simulation.dto';
import { InputParameters, Simulation } from './entities/simulation.entity';

@Controller('api/v1/simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Get()
  async calculate(@Query() simulationDto: SimulationDto) {
    const inputParameters: InputParameters = {
      simulationParameters: {
        lambda: simulationDto.lambda,
        miu: simulationDto.miu,
        M: simulationDto.M,
        k: simulationDto.k,
        N: simulationDto.N,
      },
      simulationCosts: {
        Cte: simulationDto.Cte,
        Cts: simulationDto.Cts,
        Ctse: simulationDto.Ctse,
        Cs: simulationDto.Cs,
        hr: simulationDto.hr,
      },
      info: {
        decimalPrecision: simulationDto.decimalPrecision,
        simulationType: simulationDto.simulationType,
        queueModel: simulationDto.queueModel,
        timeUnit: simulationDto.timeUnit,
        quantifier: simulationDto.quantifier,
      },
    };
    const simulation = new Simulation(inputParameters);
    return this.simulationsService.calculate(simulation);
  }
}
