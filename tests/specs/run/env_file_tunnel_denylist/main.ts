// The denylisted Edno control variables must not have been imported from the
// env file...
console.log("EDNO_CONNECTED:", Edno.env.get("EDNO_CONNECTED"));
console.log(
  "EDNO_DEPLOY_TUNNEL_ENDPOINT:",
  Edno.env.get("EDNO_DEPLOY_TUNNEL_ENDPOINT"),
);
// ...but ordinary variables from the same file still are.
console.log("NOT_DENYLISTED:", Edno.env.get("NOT_DENYLISTED"));
console.log("user code started");
