import cjsDefault from "npm:@ednotest/cjs-default-export";

// should error since cjsDefault.default() is a number
export const Test: string = cjsDefault.default();
