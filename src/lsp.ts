import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { match } from "ts-pattern";
import * as D from "io-ts/Decoder";

import { dependencyManagement } from "nova-extension-utils";

import { showNotification } from "./novaUtils";
import { ExtensionConfigKeys } from "./types";

const compositeDisposable = new CompositeDisposable();

interface PluginError {
  tag: string;
  reason: string;
}

interface StartError extends PluginError {
  tag: "startError";
  reason: string;
}

interface InstallDepsError extends PluginError {
  tag: "installDepsError";
  reason: string;
}

interface ShutdownError extends PluginError {
  tag: "shutdownError";
  reason: string;
}

type Behavior = "error" | "off" | "warning";

interface ClientSettings {
  elmLS: {
    // The path to your `elm` binary. ..
    elmPath: string;
    // The path to your `elm-format` binary. ..
    elmFormatPath: string;
    // The path to your `elm-review` binary. ..
    elmReviewPath: string;
    // Set severity or disable linting diagnostics for `elm-review`
    elmReviewDiagnostics: Behavior;
    // The path to your `elm-test` binary. ..
    elmTestPath: string;
    // Disable linting diagnostics from the language server
    disableElmLSDiagnostics: boolean;
    // Traces the communication between Nova and the language server
    trace: {
      server: Behavior;
    };
  };
}

const mkExtensionDepsPath = (binary: string): string => {
  return `${dependencyManagement.getDependencyDirectory()}/node_modules/.bin/${binary}`;
};

const getClientSettings = (): ClientSettings => ({
  elmLS: {
    elmPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmPath)),
      O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.ElmPath))),
      O.chain((path) => O.fromEither(D.string.decode(path))),
      O.getOrElse(() => mkExtensionDepsPath("elm")),
    ),
    elmFormatPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmFormatPath)),
      O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.ElmFormatPath))),
      O.chain((path) => O.fromEither(D.string.decode(path))),
      O.getOrElse(() => mkExtensionDepsPath("elm-format")),
    ),
    elmReviewPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmReviewPath)),
      O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.ElmReviewPath))),
      O.chain((path) => O.fromEither(D.string.decode(path))),
      O.getOrElse(() => mkExtensionDepsPath("elm-review")),
    ),
    elmReviewDiagnostics: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSReviewDiagnostics)),
      O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.LSReviewDiagnostics))),
      O.chain((value) =>
        O.fromEither(
          D.union(D.literal("error"), D.literal("off"), D.literal("warning")).decode(value),
        ),
      ),
      O.getOrElseW(() => "off"),
    ) as Behavior,
    elmTestPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmTestPath)),
      O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.ElmTestPath))),
      O.chain((path) => O.fromEither(D.string.decode(path))),
      O.getOrElse(() => mkExtensionDepsPath("elm-test")),
    ),
    disableElmLSDiagnostics: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSDisableDiagnostics)),
      O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.LSDisableDiagnostics))),
      O.chain((value) => O.fromEither(D.boolean.decode(value))),
      O.getOrElseW(() => false),
    ),
    trace: {
      server: pipe(
        O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSTrace)),
        O.alt(() => O.fromNullable(nova.config.get(ExtensionConfigKeys.LSTrace))),
        O.chain((value) =>
          O.fromEither(
            D.union(D.literal("error"), D.literal("off"), D.literal("warning")).decode(value),
          ),
        ),
        O.getOrElseW(() => "off"),
      ) as Behavior,
    },
  },
});

export class ElmLanguageServer {
  private languageClient: O.Option<LanguageClient>;

  constructor() {
    this.languageClient = O.none;

    console.log("Activating...");
    this.start();
  }

  deactivate(): void {
    this.stop();
  }

  start(): void {
    showNotification("Starting extension...");

    const safeStart = pipe(
      TE.sequenceSeqArray<void, InstallDepsError | StartError>([
        TE.tryCatch<InstallDepsError, void>(
          () => {
            return dependencyManagement.installWrappedDependencies(compositeDisposable, {
              console: {
                log: (...args: Array<unknown>) => {
                  console.log("dependencies:", ...args);
                },
                info: (...args: Array<unknown>) => {
                  console.info("dependencies:", ...args);
                },
                warn: (...args: Array<unknown>) => {
                  console.warn("dependencies:", ...args);
                },
              },
            });
          },
          () => ({ tag: "installDepsError", reason: "Failed to install extension deps." }),
        ),
        TE.tryCatch<StartError, void>(
          () => {
            return new Promise<void>((resolve, _reject) => {
              pipe(
                this.languageClient,
                O.map((oldClient) => {
                  oldClient.stop();
                  nova.subscriptions.remove(compositeDisposable);
                }),
              );

              const newClient = new LanguageClient(
                "elm-language-server",
                "Elm Language Server",
                {
                  path: mkExtensionDepsPath("elm-language-server"),
                  type: "stdio",
                },
                {
                  initializationOptions: getClientSettings(),
                  syntaxes: ["elm"],
                },
              );

              compositeDisposable.add(
                newClient.onDidStop((err) => {
                  let message = "Elm Language Server stopped unexpectedly";
                  if (err) {
                    message += `:\n\n${err.toString()}`;
                  } else {
                    message += ".";
                  }
                  message +=
                    "\n\nPlease report this, along with any output in the Extension Console.";

                  nova.workspace.showActionPanel(
                    message,
                    { buttons: ["Restart", "Ignore"] },
                    (idx) => {
                      if (idx == 0) {
                        // nova.commands.invoke("x.x.reload");
                      }
                    },
                  );
                }),
              );

              newClient.start();

              this.languageClient = O.some(newClient);

              resolve();
            });
          },
          () => ({ tag: "startError", reason: "Failed to start language server." }),
        ),
      ]),
    );

    safeStart().then(
      E.fold(
        (err) => {
          match(err)
            .with({ tag: "installDepsError" }, console.error)
            .with({ tag: "startError" }, console.error)
            .exhaustive();
        },
        () => console.log("Activated. Happy Elm-ing :)"),
      ),
    );
  }

  stop(): void {
    const safeShutdown = pipe(
      TE.tryCatch<ShutdownError, void>(
        () => {
          return new Promise<void>((resolve, _reject) => {
            pipe(
              this.languageClient,
              O.map((client) => {
                client.stop();
                nova.subscriptions.remove(compositeDisposable);
                this.languageClient = O.none;
              }),
            );

            resolve();
          });
        },
        () => ({ tag: "shutdownError", reason: "Uh oh... Failed to deactivate plugin." }),
      ),
    );

    safeShutdown().then(
      E.fold(
        (err) => {
          match(err).with({ tag: "shutdownError" }, console.error).exhaustive();
        },
        () => console.log("Deactivated. Come back soon :)"),
      ),
    );
  }
}
