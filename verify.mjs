// Runtime proof that the flagged values really are instances of the expected
// class. Expected output: three `true` lines.
import os from 'node:os'
import path from 'node:path'

import DailyRotateFile from 'winston-daily-rotate-file'
import TransportStream from 'winston-transport'
import { transports } from 'winston'

const file = new transports.File({ filename: path.join(os.tmpdir(), 'repro-error.log') })
const rotating = new DailyRotateFile({
  filename: path.join(os.tmpdir(), 'repro-app-%DATE%.log'),
})
const consoleTransport = new transports.Console()

console.log('new transports.File() instanceof TransportStream:', file instanceof TransportStream)
console.log(
  'new DailyRotateFile() instanceof TransportStream:',
  rotating instanceof TransportStream
)
console.log(
  'new transports.Console() instanceof TransportStream:',
  consoleTransport instanceof TransportStream
)

process.exitCode = 0
