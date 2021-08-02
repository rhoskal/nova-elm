type Buffer = {
  stdout: string;
  stderr: string;
};

type Reject = (reason?: any) => void;

const elmFormat = (inputText: string) => {
  const setUpProcess = (reject: Reject): Process => {
    const identifier = nova.extension.identifier;
    const config = nova.workspace.config;
    const defaultProcess = new Process("elm-format");

    const configPath = config.get(`${identifier}.elmFormatPath`, "string");
    if (!configPath || configPath.trim() === "") {
      const message =
        "Please provide an elm-format executable in Project Settings to enable formatting.";
      reject(message);
      return defaultProcess;
    }
    const elmFormatPath = nova.path.expanduser(configPath);

    return new Process(elmFormatPath, { args: ["--stdin"], stdio: "pipe" });
  };

  const writeToStdin = (process: Process, inputText: string) => {
    const writer = (process.stdin as any).getWriter();
    writer.ready.then(() => {
      writer.write(inputText);
      writer.close();
    });
  };

  const collectOutputText = (stdout: string, buffer: Buffer) => (buffer.stdout += stdout);
  const collectErrorText = (stderr: string, buffer: Buffer) => (buffer.stderr += stderr);

  return new Promise<string>((resolve, reject) => {
    try {
      const process = setUpProcess(reject);
      let buffer: Buffer = { stdout: "", stderr: "" };

      process.onStdout((stdout: string) => collectOutputText(stdout, buffer));
      process.onStderr((stderr: string) => collectErrorText(stderr, buffer));
      process.onDidExit((status: number) => {
        if (status === 0) {
          resolve(buffer.stdout);
        } else {
          reject(buffer.stderr);
        }
      });
      writeToStdin(process, inputText);
      process.start();
    } catch (err) {
      reject(err);
    }
  });
};

export { elmFormat };
