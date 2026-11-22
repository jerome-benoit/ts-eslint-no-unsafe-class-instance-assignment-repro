import DailyRotateFile from 'winston-daily-rotate-file'
import { createLogger, transports, type transport } from 'winston'

// Both values are subclasses of winston's transport class (`TransportStream`,
// re-exported by winston as the alias `transport`):
// `new transports.File(...) instanceof TransportStream` and
// `new DailyRotateFile(...) instanceof TransportStream` are both `true` at
// runtime (see verify.mjs). Assigning them to `transport[]` and passing one to
// `Logger.add(transport)` is the documented winston API.
const logTransports: transport[] = [
  // 3 unexpected `no-unsafe-class-instance-assignment` reports start here
  new transports.File({ filename: 'error.log', level: 'error' }),
  new DailyRotateFile({ filename: 'app-%DATE%.log' }),
]

const logger = createLogger({ transports: logTransports })

logger.add(new transports.Console())

export { logger, logTransports }
