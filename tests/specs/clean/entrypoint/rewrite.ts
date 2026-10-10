const path = Edno.args[0];
const contents = Edno.readTextFileSync(path);

const ednoDir = Edno.env.getEnv("EDNO_DIR");
const cwd = Edno.cwd();

const newContents = contents.replace(cwd, "$CWD").replace(ednoDir, "$EDNO_DIR");
Edno.writeTextFileSync(path, newContents);
