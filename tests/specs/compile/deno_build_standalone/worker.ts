// ensure this is properly set in a worker
const value: boolean = Edno.build.standalone;
console.log(value);
self.close();
