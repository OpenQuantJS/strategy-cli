import { run } from 'strategy-runner'
import { Cursor } from 'mongodb';
import { CommonStrategy } from './types';

export interface Strategy<T = any> extends CommonStrategy<T> {
  data: () => Promise<Cursor<T>>
}

interface StrategyConstructor {
  new (): Strategy
}

export async function start(strategyPath: string) {
  const StrategyClass: StrategyConstructor = require(strategyPath).default
  const strategy = new StrategyClass()

  const data = await strategy.data()
  const size = await data.count()
  return await run(strategy.run, data, size, strategy.processor)
}
