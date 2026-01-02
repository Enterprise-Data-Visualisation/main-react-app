// src/types.ts

export interface Signal {
  id: string;
  name: string;
  type: string;
  location: string;
}

export interface GetSignalsData {
  getSignals: Signal[];
}
