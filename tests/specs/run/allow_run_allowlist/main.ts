try {
  await new Edno.Command("ls").output();
} catch (e) {
  console.log(e);
}

const { success } = await new Edno.Command("curl", {
  args: ["--help"],
  stdout: "null",
  stderr: "inherit",
}).output();
console.log(success);
