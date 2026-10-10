console.log("hello");
// edno-lint-ignore require-await
const foo = async (): Promise<never> => {
  console.log("before error");
  throw Error("error");
};

foo();
console.log("world");
