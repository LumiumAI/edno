# edno_io

**This crate provides IO primitives for other Edno extensions, this includes
stdio streams and abstraction over File System files.**

## Usage Example

From javascript, include the extension's source:

```javascript
import { core } from "ext:core/mod.js";

const io = core.loadExtScript("ext:edno_io/12_io.js");
```

Then from rust, provide: `edno_io::edno_io::init(Option<edno_io::Stdio>)` in the
`extensions` field of your `RuntimeOptions`

Where `edno_io::Stdio` implements `Default`, and can therefore be provided as
`Some(edno_io::Stdio::default())`

## Dependencies

- **edno_web**: Provided by the `edno_web` crate
- **edno_tty**: Provided in `edno/runtime/ops/tty.rs`
