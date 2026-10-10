const blob = new Blob(
  ["export default function() {\n  return <div>Hello Edno!</div>\n}\n"],
  { type: "text/jsx" },
);
const url = URL.createObjectURL(blob);

const { default: render } = await import(url);

// edno-lint-ignore no-explicit-any
(globalThis as any).React = {
  createElement(...args: unknown[]) {
    console.log(...args);
  },
};

render();
