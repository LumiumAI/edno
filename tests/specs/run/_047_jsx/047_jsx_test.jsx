const React = {
  createElement(factory, props, ...children) {
    return { factory, props, children };
  },
};
const View = () => <div class="edno">land</div>;
console.log(<View />);
