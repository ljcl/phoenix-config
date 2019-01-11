# Phoenix configuration

See [src/config.ts](src/config.ts) for `hyper` and `hyperShift` definitions.

## Basic bindings

- `hyper + z` (cycle between screen halves and thirds)
- `hyper + c` (Toggle maximize, remembers unmaximized position)
- `hyper + Tab` (Jump to next screen whilst keeping relative size and placement)
- `hyperShift + z` (cycle between screen 2/3rds)
- `hyperShift + c` (center window)
- `hyperShift + Tab` (Jump to next screen whilst maintaining current window size)

## Building

```shell
npm i
npm run typings
npm run build
```

`out/phoenix.js` can be used as Phoenix configuration.

## Debugging

In a terminal, run:

```shell
log stream --process Phoenix
```

Original package & typings by [mafredri](https://github.com/mafredri).
