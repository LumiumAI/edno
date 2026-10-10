if ("Edno" in globalThis && typeof globalThis.Edno === 'object') {
  require('./helper.js');
  console.log('edno preinstall.js');
} else {
  console.log('node preinstall.js');
}