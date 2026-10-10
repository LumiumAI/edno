// @ts-expect-error "Edno[Edno.internal].core" is not a public interface
Edno[Edno.internal].core.evalContext(
  "(async () => console.log(await import('./_042_dyn_import_evalcontext/mod4.js')))()",
  new URL("..", import.meta.url).href,
);
