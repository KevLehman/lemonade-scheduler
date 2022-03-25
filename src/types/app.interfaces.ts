// Convert to class and use class validator
export class TimerDto {
  hours?: number;
  minutes?: number;
  seconds?: number;
  url: string;
}

export interface Timer {
  id: string;
  nextRunAt: Date;
  url: string;
}

export interface TimerJob {
  url: string;
}

export interface StoredJob {
  _id: string;
  name: string;
  data: { [k: string]: unknown };
  nextRunAt: Date;
}
