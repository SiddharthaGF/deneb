import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SimulationsService } from './simulations.service.js';
import { SimulationDto } from './dto/simulation.dto.js';
import { SimulationResultsDto } from './dto/simulation-response.dto.js';
import type { SimulationResults } from './entities/simulation.entity.js';

@Controller('api/v1/simulations')
@ApiTags('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Calculate queue model performance measures',
    description:
      'Calculates all performance measures and costs for the requested queue model.',
  })
  @ApiOkResponse({
    description: 'Performance measures and costs for the given queue model.',
    type: SimulationResultsDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid parameters, or the stability condition is not satisfied.',
  })
  calculate(@Query() simulationDto: SimulationDto): SimulationResults {
    return this.simulationsService.calculate(simulationDto);
  }
}
