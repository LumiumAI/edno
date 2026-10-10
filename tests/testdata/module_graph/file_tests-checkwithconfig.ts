import { ServerRequest } from "jsr:@std/http/server";

export default (req: ServerRequest) => {
  req.respond({ body: `Hello, from Edno v${Edno.version.edno}!` });
};
