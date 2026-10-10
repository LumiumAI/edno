const nameServer = { nameServer: { ipAddr: "127.0.0.1", port: 4553 } };

const [a, aaaa, aname, caa, cname, mx, naptr, ns, ptr, soa, srv, txt] =
  await Promise
    .all([
      Edno.resolveDns("www.example.com", "A", nameServer),
      Edno.resolveDns("www.example.com", "AAAA", nameServer),
      Edno.resolveDns("www.example.com", "ANAME", nameServer),
      Edno.resolveDns("example.com", "CAA", nameServer),
      Edno.resolveDns("alias.example.com", "CNAME", nameServer),
      Edno.resolveDns("example.com", "MX", nameServer),
      Edno.resolveDns("example.com", "NAPTR", nameServer),
      Edno.resolveDns("example.com", "NS", nameServer),
      Edno.resolveDns("1.2.3.4.IN-ADDR.ARPA.", "PTR", nameServer),
      Edno.resolveDns("example.com", "SOA", nameServer),
      Edno.resolveDns("_service._tcp.example.com", "SRV", nameServer),
      Edno.resolveDns("example.com", "TXT", nameServer),
    ]);

console.log("A");
console.log(JSON.stringify(a));

console.log("AAAA");
console.log(JSON.stringify(aaaa));

console.log("ANAME");
console.log(JSON.stringify(aname));

console.log("CAA");
console.log(JSON.stringify(caa));

console.log("CNAME");
console.log(JSON.stringify(cname));

console.log("MX");
console.log(JSON.stringify(mx));

console.log("NAPTR");
console.log(JSON.stringify(naptr));

console.log("NS");
console.log(JSON.stringify(ns));

console.log("PTR");
console.log(JSON.stringify(ptr));

console.log("SOA");
console.log(JSON.stringify(soa));

console.log("SRV");
console.log(JSON.stringify(srv));

console.log("TXT");
console.log(JSON.stringify(txt));

try {
  await Edno.resolveDns("not-found-example.com", "A", nameServer);
} catch (e) {
  console.log(
    `Error ${
      e instanceof Error ? e.name : "[non-error]"
    } thrown for not-found-example.com`,
  );
}

try {
  // @ts-ignore testing invalid overloads
  await Edno.resolveDns("example.com", "SSHFP", nameServer);
} catch (e) {
  console.log((e as Error).message);
}

try {
  const ac = new AbortController();
  queueMicrotask(() => ac.abort());
  await Edno.resolveDns("www.example.com", "A", {
    ...nameServer,
    signal: ac.signal,
  });
} catch (e) {
  console.log((e as Error).name);
}

try {
  const ac = new AbortController();
  ac.abort();
  await Edno.resolveDns("www.example.com", "A", {
    ...nameServer,
    signal: ac.signal,
  });
} catch (e) {
  console.log((e as Error).name);
}
