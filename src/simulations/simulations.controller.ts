import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SimulationsService } from './simulations.service.js';
import { SimulationDto } from './dto/simulation.dto.js';
import type { SimulationResults } from './entities/simulation.entity.js';

@Controller('api/v1/simulations')
@ApiTags('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Get()
  @ApiOperation({
    description: 'Calculates all performance measures and costs.',
  })
  calculate(@Query() simulationDto: SimulationDto): SimulationResults {
    return this.simulationsService.calculate(simulationDto);
  }
}
