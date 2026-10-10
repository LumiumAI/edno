#!/usr/bin/env -S edno run --allow-read

for (const item of Edno.readDirSync(".")) {
  console.log(item.name);
}
