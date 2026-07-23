export interface ComputeFields {
  trust: number;
  nextTrust: number;
  trustFibA: number;
  trustFibB: number;
  processors: number;
  memory: number;
  ops: number;
  creativity: number;
  creativityUnlocked: boolean;
}

export function createComputeFields(): ComputeFields {
  return {
    trust: 2,
    nextTrust: 3000,
    trustFibA: 2,
    trustFibB: 3,
    processors: 1,
    memory: 1,
    ops: 0,
    creativity: 0,
    creativityUnlocked: false,
  };
}
