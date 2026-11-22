# Reproduction: `no-unsafe-class-instance-assignment` false positive on winston transports

`@typescript-eslint/no-unsafe-class-instance-assignment` (enabled by `strictTypeChecked`) reports
three errors in `repro.ts`, claiming the values "were not created by its constructor". Every flagged
value is a subclass instance created with `new`, and the code is winston's documented API.

## Setup

```sh
npm install
```

## Reproduce

```sh
npm run lint
```

Actual (3 errors):

```
/home/.../repro.ts
  12:3   error  This value is used where an instance of class `TransportStream` is expected, but was not created by its constructor  @typescript-eslint/no-unsafe-class-instance-assignment
  13:3   error  This value is used where an instance of class `TransportStream` is expected, but was not created by its constructor  @typescript-eslint/no-unsafe-class-instance-assignment
  18:12  error  This value is used where an instance of class `TransportStream` is expected, but was not created by its constructor  @typescript-eslint/no-unsafe-class-instance-assignment

✖ 3 problems (3 errors, 0 warnings)
```

Expected: no errors.

## Runtime proof the assignments are sound

```sh
npm run verify
```

```
new transports.File() instanceof TransportStream: true
new DailyRotateFile() instanceof TransportStream: true
new transports.Console() instanceof TransportStream: true
```

## Why class identity is lost

The expected class is never named directly: `winston` reaches it through a namespace import of an
`export =` class plus an alias re-export.

```ts
// node_modules/winston-transport/index.d.ts
declare class TransportStream extends stream.Writable { ... }
export = TransportStream

// node_modules/winston/index.d.ts
import * as Transport from 'winston-transport'
declare namespace winston {
  export import transport = Transport
  class Logger {
    add(transport: Transport): this
  }
}
```

Two value shapes both fail the class-identity check:

**1. A declared subclass of the expected class (line 13).** `winston-daily-rotate-file` declares an
ordinary `extends` relationship with the very same class:

```ts
// node_modules/winston-daily-rotate-file/index.d.ts
import TransportStream = require('winston-transport')
declare class DailyRotateFile extends TransportStream { ... }
```

`new DailyRotateFile(...)` is created by a constructor and is a `TransportStream` by inheritance. The
rule is documented as checking the prototypal inheritance chain, and the subclass report in
[#13218](https://github.com/typescript-eslint/typescript-eslint/issues/13218) was closed as "working
as expected" precisely because that value was *not* a subclass. Here it is one.

**2. An interface with a construct signature (lines 12 and 18).** winston's built-in transports are
typed that way, so `new transports.File(...)` has an interface type with no class declaration to
compare against, even though the interface extends the class:

```ts
// node_modules/winston/lib/winston/transports/index.d.ts
interface FileTransportInstance extends Transport {
  new (options?: FileTransportOptions): FileTransportInstance
}
```

Together they mean a winston user cannot satisfy the rule in any shape: subclass instances,
construct-signature interfaces, plain `transport[]` variables and `Logger.add(...)` arguments are all
reported, and the only way out is disabling the rule for winston files.

Related: [#13214](https://github.com/typescript-eslint/typescript-eslint/issues/13214) is the same
class-identity-through-alias failure with an intersection-based mixin base; here the alias comes from
a dependency's public typings (`export =` class + `export import` re-export).

## Versions

| package                            | version |
| ---------------------------------- | ------- |
| `@typescript-eslint/eslint-plugin` | 8.73.0  |
| `@typescript-eslint/parser`        | 8.73.0  |
| `typescript-eslint`                | 8.73.0  |
| `TypeScript`                       | 6.0.3   |
| `ESLint`                           | 10.15.0 |
| `node`                             | 26.13.1 |
| `winston`                          | 3.19.0  |
| `winston-daily-rotate-file`        | 5.0.0   |
