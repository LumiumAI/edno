export default {
  fetch(_req: Request) {
    return new Response("edno serve --port 0 works!");
  },
};
