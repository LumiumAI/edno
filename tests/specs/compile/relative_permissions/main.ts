try {
  Edno.readTextFileSync("a.txt");
} catch (err) {
  console.log((err as Error).message);
}
