// NOTE: Ensure that source maps are handled correctly by adding a type which
//       will be removed during transpilation
type Dummy = {
  _: string;
};

export function used(condition: boolean): boolean {
  // edno-coverage-ignore
  if (condition) return false;

  return true;
}

// edno-coverage-ignore
function unused() {}
