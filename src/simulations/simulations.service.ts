import { Injectable } from '@nestjs/common';
import { Simulation, SimulationResults } from './entities/simulation.entity.js';

@Injectable()
export class SimulationsService {
  calculate(simulation: Simulation): Promise<SimulationResults> {
    return simulation.getAllCalculations();
  }
}
