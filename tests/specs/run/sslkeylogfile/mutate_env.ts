Edno.env.set("SSLKEYLOGFILE", "./late_keylog.txt");

const resp = await fetch("https://example.com");
console.log(resp.status);

try {
  await Edno.stat("./late_keylog.txt");
  console.log("late_keylog.txt has been created");
} catch (error) {
  if (error instanceof Edno.errors.NotFound) {
    console.log("late_keylog.txt has not been created");
  } else {
    throw error;
  }
}
