import addPkg from "npm:@ednotest/add@latest/package.json" with {
  type: "json",
};
console.log(addPkg.version);
