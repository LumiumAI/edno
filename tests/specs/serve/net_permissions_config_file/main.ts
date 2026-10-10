export default {
  async fetch(_req) {
    return new Response("Hello world!");
  },
} satisfies Edno.ServeDefaultExport;

function checkNetPermission(host: string) {
  console.log(
    host,
    Edno.permissions.querySync({
      name: "net",
      host,
    }).state,
  );
}

checkNetPermission("github.com");
checkNetPermission("google.com");
checkNetPermission("localhost:1234");
checkNetPermission("localhost:12818");
Edno.exit(0);
