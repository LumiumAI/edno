const filePath = "./cowsay/package.json";
const packageJson = JSON.parse(Edno.readTextFileSync(filePath));
packageJson.dependencies = {
  "@ednotest/add": "1",
};
Edno.writeTextFileSync(filePath, JSON.stringify(packageJson));
