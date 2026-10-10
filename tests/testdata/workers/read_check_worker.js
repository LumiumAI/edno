onmessage = async () => {
  const { state } = await Edno.permissions.query({
    name: "read",
  });
  postMessage(state === "granted");
  close();
};
