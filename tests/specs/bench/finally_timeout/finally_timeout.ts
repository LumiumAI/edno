Edno.bench("error", function () {
  const timer = setTimeout(() => null, 10000);
  try {
    throw new Error("fail");
  } finally {
    clearTimeout(timer);
  }
});

Edno.bench("success", function () {
});
