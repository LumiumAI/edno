# Checkin: A Tiny Testing Tool for `edno_core`

<img src="docs/logo.png" align="right" width="100" />

## Why Checkin?

Dino : _Deno_ :: Chicken : _Checkin_

Also because it _checks_ how edno_core works. Yuk yuk.

## Overview

_Checkin_ is a tiny testing tool designed to exercise the functionality of
`edno_core`. It implements a very small standard library which is just enough to
exercise all of the components that we expose to
[Edno](https://github.com/denoland/deno) without reinventing the wheel.

## Modules

Modules in _Checkin_ are written in TypeScript and transpiled before loading.
