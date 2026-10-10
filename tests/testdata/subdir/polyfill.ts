declare global {
  const polyfill: () => void;
}

// edno-lint-ignore no-explicit-any
(globalThis as any).polyfill = () => {
  console.log("polyfill");
};
