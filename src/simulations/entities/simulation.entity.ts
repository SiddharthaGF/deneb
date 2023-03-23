import * as math from 'mathjs';

export enum DecimalPrecision {
  D3 = 3,
  D4 = 4,
  D5 = 5,
  D6 = 6,
  D7 = 7,
  D8 = 8,
  D9 = 9,
  D10 = 10,
}

export enum Quantifiers {
  EXACTLY = 'EXACTLY',
  AT_LEAST = 'AT_LEAST',
  AT_MOST = 'AT_MOST',
}

export enum QueueModels {
  MM1 = 'MM1',
  MM1MM = 'MM1MM',
  MMK = 'MMK',
  MMKMM = 'MMKMM',
}

export enum SimulationType {
  SYSTEM = 'SYSTEM',
  QUEUE = 'QUEUE',
}

export enum TimeUnit {
  MILLISECONDS = 'MILLISECONDS',
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
}

export interface GeneralPerformanceMeasures {
  L: number;
  Lq: number;
  Ln: number;
  W: number;
  Wq: number;
  Wn: number;
}

export interface Info {
  decimalPrecision: DecimalPrecision;
  simulationType: SimulationType;
  queueModel: QueueModels;
  timeUnit: TimeUnit;
  quantifier: Quantifiers;
}

export interface SimulationCosts {
  Cte: number;
  Cts: number;
  Ctse: number;
  Cs: number;
  hr: number;
}

export interface TotalSimulationCosts {
  CTte: number;
  CTts: number;
  CTtse: number;
  CTs: number;
  CT: number;
}

export interface SimulationParameters {
  lambda: number;
  miu: number;
  M?: number;
  k?: number;
  N?: number;
}

export interface InputParameters {
  simulationParameters: SimulationParameters;
  simulationCosts: SimulationCosts;
  info: Info;
}

export interface SpecificPerformanceMeasures {
  p: number;
  p0: number;
  pn?: number;
  pe?: number;
  pne?: number;
  pk?: number;
}

export interface SimulationResults {
  parameters: {
    simulationParameters: SimulationParameters;
    simulationCosts?: SimulationCosts;
  };
  performanceMeasures: {
    specificPerformanceMeasures: SpecificPerformanceMeasures;
    generalPerformanceMeasures: GeneralPerformanceMeasures;
  };
  costs?: TotalSimulationCosts;
  info: Info;
}

export class Simulation {
  private readonly lambda: number;
  private readonly miu: number;
  private readonly M: number;
  private readonly k: number;
  private readonly N: number;
  private readonly Cte: number;
  private readonly Cts: number;
  private readonly Ctse: number;
  private readonly Cs: number;
  private readonly hr: number;
  private readonly decimalPrecision: DecimalPrecision;
  private readonly simulationType: SimulationType;
  private readonly queueModel: QueueModels;
  private readonly timeUnit: TimeUnit;
  private readonly quantifier: Quantifiers;
  private P: number;
  private P0: number;
  private PN: number;
  private PK: number;
  private PE: number;
  private PNE: number;
  private W: number;
  private WQ: number;
  private WN: number;
  private L: number;
  private LQ: number;
  private LN: number;
  private CT: number;
  private CTs: number;
  private CTte: number;
  private CTts: number;
  private CTtse: number;
  constructor(inputParameters: InputParameters) {
    const { simulationParameters, simulationCosts, info } = inputParameters;
    this.lambda = simulationParameters.lambda;
    this.miu = simulationParameters.miu;
    this.decimalPrecision = info.decimalPrecision;
    this.simulationType = info.simulationType;
    this.queueModel = info.queueModel;
    this.timeUnit = info.timeUnit;
    this.quantifier = info.quantifier;
    if (
      this.queueModel == QueueModels.MM1MM ||
      this.queueModel == QueueModels.MMKMM
    )
      this.M = simulationParameters.M;
    if (
      this.queueModel == QueueModels.MMK ||
      this.queueModel == QueueModels.MMKMM
    )
      this.k = simulationParameters.k;
    this.N = simulationParameters.N;
    this.Cte = simulationCosts.Cte;
    this.Cts = simulationCosts.Cts;
    this.Ctse = simulationCosts.Ctse;
    this.Cs = simulationCosts.Cs;
    if (
      this.Cts != undefined ||
      this.Cte != undefined ||
      this.Ctse != undefined ||
      this.Cs != undefined
    )
      this.hr = simulationCosts.hr;
  }
  private calculateAll() {
    this.P = this.calculateP();
    this.P0 = this.calculateP0();
    this.PK = this.calculatePk();
    this.PE = this.calculatePe();
    this.PNE = this.calculatePne();
    this.PN = this.calculatePn();
    this.L = this.calculateL();
    this.LQ = this.calculateLq();
    this.LN = this.calculateLn();
    this.W = this.calculateW();
    this.WQ = this.calculateWq();
    this.WN = this.calculateWn();
    if (this.Cte > 0 || this.Cts > 0 || this.Ctse > 0 || this.Cs > 0) {
      this.CTte = this.calculateCTte(this.lambda, this.WQ, this.Cte, this.hr);
      this.CTts = this.calculateCTts(this.lambda, this.W, this.Cts, this.hr);
      this.CTtse = this.calculateCTtse(
        this.lambda,
        this.miu,
        this.Ctse,
        this.hr,
      );
      this.CTs = this.calculateCTs(this.Cs, this.k);
      this.CT = this.calculateCT(this.CTte, this.CTts, this.CTtse, this.CTs);
    }
  }
  private calculateP(): number {
    return this.lambda / this.miu;
  }
  private calculateP0(): number {
    let sum = 0;
    switch (this.queueModel) {
      case QueueModels.MM1:
        return 1 - this.P;
      case QueueModels.MMK:
        for (let n = 0; n <= this.k - 1; n++) {
          sum += Math.pow(this.P, n) / math.factorial(n);
        }
        sum +=
          (Math.pow(this.P, this.k) / math.factorial(this.k)) *
          ((this.k * this.miu) / (this.k * this.miu - this.lambda));
        return 1 / sum;
      case QueueModels.MM1MM:
        for (let n = 0; n <= this.M; n++) {
          sum += math.permutations(this.M, n) * Math.pow(this.P, n);
        }
        return 1 / sum;
      case QueueModels.MMKMM:
        for (let n = 0; n <= this.k - 1; n++) {
          sum += math.combinations(this.M, n) * Math.pow(this.P, n);
        }
        for (let n = this.k; n <= this.M; n++) {
          sum +=
            (math.permutations(this.M, n) * Math.pow(this.P, n)) /
            (math.factorial(this.k) * Math.pow(this.k, n - this.k));
        }
        return 1 / sum;
    }
  }
  private calculatePn(): number {
    if (this.N == undefined) return this.PN;
    let n: number;
    if (this.simulationType == SimulationType.SYSTEM) n = this.N;
    else if (this.simulationType == SimulationType.QUEUE) {
      if (
        this.queueModel == QueueModels.MMK ||
        this.queueModel == QueueModels.MMKMM
      )
        n = this.N + this.k;
      else n = this.N + 1;
    }
    switch (this.quantifier) {
      case Quantifiers.EXACTLY:
        return this.calculateExactPn(n);
      case Quantifiers.AT_MOST:
        return this.calculateMaxPn(n);
      case Quantifiers.AT_LEAST:
        return this.calculateMinPn(n);
    }
  }
  private calculatePk(): number {
    if (this.queueModel == QueueModels.MMK)
      return (
        (((Math.pow(this.P, this.k) / math.factorial(this.k)) *
          (this.k * this.miu)) /
          (this.k * this.miu - this.lambda)) *
        this.P0
      );
  }
  private calculatePe(): number {
    if (this.queueModel == QueueModels.MM1MM) return 1 - this.P0;
    else if (this.queueModel == QueueModels.MMKMM) {
      let sum = 0;
      for (let n = 0; n <= this.k - 1; n++) {
        sum += this.calculateExactPn(n);
      }
      return 1 - sum;
    }
  }
  private calculatePne(): number {
    if (this.queueModel == QueueModels.MMK) return 1 - this.PK;
    if (this.queueModel == QueueModels.MMKMM) return 1 - this.PE;
  }
  private calculateW(): number {
    switch (this.queueModel) {
      case QueueModels.MM1:
        return this.L / this.lambda;
      case QueueModels.MMK:
        return this.LQ / this.lambda + 1 / this.miu;
      case QueueModels.MM1MM:
        return this.LQ / ((this.M - this.L) * this.lambda) + 1 / this.miu;
      case QueueModels.MMKMM:
        return this.LQ / ((this.M - this.L) * this.lambda) + 1 / this.miu;
    }
  }
  private calculateWq(): number {
    switch (this.queueModel) {
      case QueueModels.MM1:
        return this.W * this.P;
      case QueueModels.MMK:
        return this.LQ / this.lambda;
      case QueueModels.MM1MM:
        return this.W - 1 / this.miu;
      case QueueModels.MMKMM:
        return this.W - 1 / this.miu;
    }
  }
  private calculateWn(): number {
    switch (this.queueModel) {
      case QueueModels.MM1:
        return this.W;
      case QueueModels.MMK:
        return this.WQ / this.PK;
      case QueueModels.MM1MM:
        return this.WQ / this.PE;
      case QueueModels.MMKMM:
        return this.WQ / this.PE;
    }
  }
  private calculateL(): number {
    switch (this.queueModel) {
      case QueueModels.MM1:
        return this.lambda / (this.miu - this.lambda);
      case QueueModels.MMK:
        return (
          (this.lambda * this.miu * Math.pow(this.P, this.k) * this.P0) /
            (math.factorial(this.k - 1) *
              Math.pow(this.k * this.miu - this.lambda, 2)) +
          this.P
        );
      case QueueModels.MM1MM:
        return this.M - (this.miu / this.lambda) * this.PE;
      case QueueModels.MMKMM:
        let sum = 0;
        for (let n = 0; n <= this.k - 1; n++) {
          sum += n * this.calculateExactPn(n);
        }
        for (let n = this.k; n <= this.M; n++) {
          sum += (n - this.k) * this.calculateExactPn(n);
        }
        let aux = 0;
        for (let n = 0; n <= this.k - 1; n++) {
          aux += this.calculateExactPn(n);
        }
        sum += this.k * (1 - aux);
        return sum;
    }
  }
  private calculateLq(): number {
    switch (this.queueModel) {
      case QueueModels.MM1:
        return this.L * this.P;
      case QueueModels.MMK:
        return this.L - this.P;
      case QueueModels.MM1MM:
        return this.M - ((this.miu + this.lambda) / this.lambda) * this.PE;
      case QueueModels.MMKMM:
        let sum = 0;
        for (let n = this.k; n <= this.M; n++) {
          sum += (n - this.k) * this.calculateExactPn(n);
        }
        return sum;
    }
  }
  private calculateLn(): number {
    switch (this.queueModel) {
      case QueueModels.MM1:
        return this.L;
      case QueueModels.MMK:
        return this.LQ / this.PK;
      case QueueModels.MM1MM:
        return this.LQ / this.PE;
      case QueueModels.MMKMM:
        return this.LQ / this.PE;
    }
  }
  private calculateExactPn(n: number = this.N): number {
    const base = Math.pow(this.P, n) * this.P0;
    switch (this.queueModel) {
      case QueueModels.MM1:
        return base;
      case QueueModels.MMK:
        return n < this.k
          ? base / math.factorial(n)
          : base / (math.factorial(this.k) * Math.pow(this.k, n - this.k));
      case QueueModels.MM1MM:
        return base * math.permutations(this.M, n);
      case QueueModels.MMKMM:
        return 0 <= n && n <= this.k
          ? base * math.combinations(this.M, n)
          : (base * math.permutations(this.M, n)) /
              (math.factorial(this.k) * Math.pow(this.k, n - this.k));
    }
  }
  private calculateMaxPn(end?: number): number {
    let sum = 0;
    for (let i = 0; i <= end; i++) {
      sum += this.calculateExactPn(i);
    }
    return sum;
  }
  private calculateMinPn(start?: number): number {
    return 1 - this.calculateMaxPn(start - 1);
  }
  async getAllCalculations(): Promise<SimulationResults> {
    this.calculateAll();
    return new Promise<SimulationResults>((resolve) => {
      const results: SimulationResults = {
        parameters: {
          simulationParameters: {
            lambda: this.fixed(this.lambda, this.decimalPrecision),
            miu: this.fixed(this.miu, this.decimalPrecision),
            M: this.M,
            k: this.k,
            N: this.N,
          },
          simulationCosts: this.allPropertiesAreUndefined({
            Cte: this.fixed(this.Cte, this.decimalPrecision),
            Cts: this.fixed(this.Cts, this.decimalPrecision),
            Ctse: this.fixed(this.Ctse, this.decimalPrecision),
            Cs: this.fixed(this.Cs, this.decimalPrecision),
            hr: this.fixed(this.hr, this.decimalPrecision),
          }),
        },
        performanceMeasures: {
          specificPerformanceMeasures: {
            p: this.fixed(this.P, this.decimalPrecision),
            p0: this.fixed(this.P0, this.decimalPrecision),
            pk: this.fixed(this.PK, this.decimalPrecision),
            pn: this.fixed(this.PN, this.decimalPrecision),
            pe: this.fixed(this.PE, this.decimalPrecision),
            pne: this.fixed(this.PNE, this.decimalPrecision),
          },
          generalPerformanceMeasures: {
            L: this.fixed(this.L, this.decimalPrecision),
            Lq: this.fixed(this.LQ, this.decimalPrecision),
            Ln: this.fixed(this.LN, this.decimalPrecision),
            W: this.fixed(this.W, this.decimalPrecision),
            Wq: this.fixed(this.WQ, this.decimalPrecision),
            Wn: this.fixed(this.WN, this.decimalPrecision),
          },
        },
        costs: this.allPropertiesAreUndefined({
          CTte: this.fixed(this.CTte, this.decimalPrecision),
          CTts: this.fixed(this.CTts, this.decimalPrecision),
          CTtse: this.fixed(this.CTtse, this.decimalPrecision),
          CTs: this.fixed(this.CTs, this.decimalPrecision),
          CT: this.fixed(this.CT, this.decimalPrecision),
        }),
        info: {
          decimalPrecision: this.decimalPrecision,
          simulationType: this.simulationType,
          queueModel: this.queueModel,
          timeUnit: this.timeUnit,
          quantifier: this.quantifier,
        },
      };
      resolve(results);
    });
  }
  private allPropertiesAreUndefined(obj: any): any {
    let allUndefined = true;
    for (const prop in obj) {
      if (obj[prop] !== undefined) {
        allUndefined = false;
        break;
      }
    }
    return allUndefined ? undefined : obj;
  }
  fixed(number: number, fix: number): number | undefined {
    try {
      return Number(number.toFixed(fix));
    } catch (e) {
      return undefined;
    }
  }
  private calculateCTte(
    lambda: number,
    WQ: number,
    Cte: number,
    hr = 8,
  ): number {
    return Cte ? lambda * hr * WQ * Cte : 0;
  }
  private calculateCTts(
    lambda: number,
    W: number,
    Cts: number,
    hr = 8,
  ): number {
    return Cts ? lambda * hr * W * Cts : 0;
  }
  private calculateCTtse(
    lambda: number,
    miu: number,
    Ctse: number,
    hr = 8,
  ): number {
    return Ctse ? lambda * hr * (1 / miu) * Ctse : 0;
  }
  private calculateCTs(Cs: number, k?: number): number {
    return Cs ? (k ? k * Cs : Cs) : 0;
  }
  private calculateCT(...costs: number[]): number {
    const total = costs.reduce((total, num) => total + num, 0);
    return total ? total : 0;
  }
}
