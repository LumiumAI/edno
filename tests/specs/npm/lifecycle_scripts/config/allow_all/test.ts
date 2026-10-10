const kind = Edno.args[0];

switch (kind) {
  case "all": {
    modify(true);
    install({
      expected: [
        "@ednotest/node-addon@1.0.0",
        "@ednotest/node-lifecycle-scripts@1.0.0",
      ],
    });
    break;
  }
  case "some": {
    modify(["npm:@ednotest/node-addon@1.0.0"]);
    install({
      expected: ["@ednotest/node-addon@1.0.0"],
    });
    break;
  }
  case "deny": {
    modify({
      allow: true,
      deny: ["npm:@ednotest/node-addon@1.0.0"],
    });
    install({
      expected: ["@ednotest/node-lifecycle-scripts@1.0.0"],
    });
    break;
  }
  case "arg": {
    modify({
      allow: true,
      deny: ["npm:@ednotest/node-addon@1.0.0"],
    });
    install({
      additionalArgs: ["--allow-scripts"],
      expected: [
        "@ednotest/node-addon@1.0.0",
        "@ednotest/node-lifecycle-scripts@1.0.0",
      ],
    });
    break;
  }
  default:
    throw new Error("Unknown: " + kind);
}

function modify(value: any) {
  const obj = JSON.parse(Edno.readTextFileSync("edno.json"));
  obj.allowScripts = value;
  Edno.writeTextFileSync("edno.json", JSON.stringify(obj));
}

function install(options: {
  expected: (
    | "@ednotest/node-addon@1.0.0"
    | "@ednotest/node-lifecycle-scripts@1.0.0"
  )[];
  additionalArgs?: string[];
}) {
  const args = ["install", ...(options.additionalArgs ?? [])];
  console.error("args", args);
  const command = new Edno.Command(Edno.execPath(), {
    args,
    stderr: "piped",
    stdout: "piped",
  });
  const { stdout, stderr } = command.outputSync();
  const output = new TextDecoder().decode(stdout) +
    new TextDecoder().decode(stderr);

  for (const packageId of options.expected) {
    const expectedText = initializeText(packageId);
    if (!output.includes(expectedText)) {
      console.log(output);
      throw new Error("Could not find: " + expectedText);
    }
  }

  for (
    const packageId of [
      "@ednotest/node-addon@1.0.0",
      "@ednotest/node-lifecycle-scripts@1.0.0",
    ]
  ) {
    if (!options.expected.includes(packageId)) {
      const expectedText = initializeText(packageId);
      if (output.includes(expectedText)) {
        console.log(output);
        throw new Error("Output contained: " + packageId);
      }
    }
  }
}

function initializeText(packageId: string) {
  return `Initialize ${packageId}: running 'install' script`;
}
