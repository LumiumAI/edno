Edno.test(function testLeakTcpOps() {
  const listener1 = Edno.listen({ port: 0 });
  listener1.accept();
});
