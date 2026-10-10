import { loadConfigFile } from "npm:@ednotest/permissions-outside-package";

const fileName = `${Edno.cwd()}/foo/config.js`;
const config = loadConfigFile(fileName);
console.log(config);
