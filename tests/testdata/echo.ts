function echo(args: string[]) {
  const msg = args.join(", ");
  Edno.stdout.write(new TextEncoder().encode(msg));
}

echo(Edno.args);
