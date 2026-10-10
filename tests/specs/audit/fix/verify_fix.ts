const p = JSON.parse(Edno.readTextFileSync("package.json"));
console.log(p.dependencies["@ednotest/with-vuln1"]);
