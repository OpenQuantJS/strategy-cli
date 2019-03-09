import { ProcessedArgs } from 'strategy-runner';

export interface CommonStrategy<T> {
  run: (data: T) => boolean
  processor: (r: ProcessedArgs) => any
}

export type ProcessedArgs = ProcessedArgs

export enum DbType {
  MongoDb = 'mongodb',
}
