const specifier = "npm:@ednotest/add";
const { add } = await import(specifier);

console.log(add(1, 2));
