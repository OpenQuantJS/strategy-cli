import { maF } from 'technical-indicator'
import { MongoClient, Db } from 'mongodb'
import { last, dropLast, nth, gte, takeLast, compose, not, allPass } from 'ramda'
import { Strategy } from '../mongodb';
import { ProcessedArgs } from '../types';

const CLOSE = (v: any) => v.close
const minTradingDays = (n: number) => (d: any) => d.data.length >= n
const CYB = (d: any) => d.symbol.toUpperCase().indexOf('3') === 0
const TP = (d: any) => d.data.length > 0 && (last(d.data)! as any).volume === 0
const commonStrategy = [compose(not, CYB), compose(not, TP), minTradingDays(200)]

/**
 * ma70 > ma200
 * 前5日ma70和ma200有交叉
 */
const maStrategy1C = (d: any) => {
  // const today = CLOSE(data[data.length - 1])
  // const ma10 = maF(CLOSE, 10)(data)
  const data = d.data
  const N = 5
  const ma70 = maF(CLOSE, 70)(data)
  const ma200 = maF(CLOSE, 200)(data)
  const lastNDays70 = dropLast(1, takeLast(N, ma70))
  const lastNDays200 = dropLast(1, takeLast(N, ma200))
  const trend = last(ma70)! - nth(-5, ma70)!
  return gte(last(ma70)!, last(ma200)!) &&
    // gte(last(ma10), last(ma70)) &&
    trend > 0 &&
    // gt(today, last(ma10)) &&
    lastNDays70.some((x, i) => x < lastNDays200[i])
}

export default class MaStrategy implements Strategy {
  client: MongoClient
  db: Db

  async data() {
    if (!this.client) {
      this.client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
    }

    if (!this.db) {
      this.db = this.client.db('datastore')
    }

    const collection = this.db.collection('history_bars')
    const cursor = collection.find({ type: 'CS', status: 'Active' })
    return cursor
  }

  run = (data: any) => {
    return allPass([ ...commonStrategy, maStrategy1C ])(data)
  }

  processor = (r: ProcessedArgs) => {
    if (r.isValid) {
      console.log('Found !!!!!!', r.chunk.symbol)
    }
    console.log(`${r.cursor}-${r.size}:${r.chunk.symbol}`)
  }
}
