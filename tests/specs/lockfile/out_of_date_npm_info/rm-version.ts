const registryPath = Edno.args[0].trim();
const version = Edno.args[1].trim();

const registryJson = JSON.parse(Edno.readTextFileSync(registryPath));

delete registryJson.versions[version];

if (registryJson["dist-tags"]["latest"] === version) {
  const latestVersion = Object.keys(registryJson.versions).sort()[0];
  registryJson["dist-tags"]["latest"] = latestVersion;
}
delete registryJson["_deno.etag"];
const registryJsonString = JSON.stringify(registryJson, null, 2);
Edno.writeTextFileSync(registryPath, registryJsonString);
console.log(registryJsonString);
