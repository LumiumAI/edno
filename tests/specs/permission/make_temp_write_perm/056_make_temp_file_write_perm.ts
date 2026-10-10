Edno.mkdirSync("subdir");

// async file
{
  const path = await Edno.makeTempFile({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Edno.remove(path);
  }
}
// sync file
{
  const path = Edno.makeTempFileSync({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Edno.remove(path);
  }
}

// async dir
{
  const path = await Edno.makeTempDir({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Edno.remove(path);
  }
}

// sync dir
{
  const path = Edno.makeTempDirSync({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Edno.remove(path);
  }
}
