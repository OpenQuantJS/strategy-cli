#!/usr/bin/env node

import minimist from 'minimist'
import path from 'path'
import { DbType } from './types';

let start

const argv = minimist(process.argv.slice(2))

let strategyPath = argv.s
const type = argv.d

if (!type) {
  throw 'Missing Argument: `-t`';
}

if (!strategyPath) {
  throw 'Missing Argument: `-s`'
}

if (type === DbType.MongoDb) {
  start = require('./mongodb').start
}

if (!path.isAbsolute(strategyPath)) {
  strategyPath = path.join(process.cwd(), strategyPath)
}

start(strategyPath).then((d: string[]) => {
  console.log(d)
  process.exit()
})
