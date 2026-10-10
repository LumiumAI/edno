// @ts-expect-error - testing runtime validation
Edno.test.each({ not: "an array" })("name", () => {});
