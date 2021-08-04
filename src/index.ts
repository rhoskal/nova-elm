import * as E from "fp-ts/Either";
import * as M from "fp-ts/Map";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import * as D from "io-ts/Decoder";
import { Lens } from "monocle-ts";
import { match } from "ts-pattern";

import { isFalse } from "./typeGuards";

/*
 * Types
 */

enum ExtensionConfigKeys {
  ElmPath = "hansjhoffman.elm.config.elmPath",
  ElmFormatPath = "hansjhoffman.elm.config.elmFormatPath",
  ElmReviewPath = "hansjhoffman.elm.config.elmReviewPath",
  ElmTestPath = "hansjhoffman.elm.config.elmTestPath",
  FormatDocument = "hansjhoffman.elm.commands.formatDocument",
  FormatOnSave = "hansjhoffman.elm.config.formatOnSave",
  LSDisableDiagnostics = "hansjhoffman.elm.config.disableDiagnostics",
  LSReviewDiagnostics = "hansjhoffman.elm.config.elmReviewDiagnostics",
  LSTrace = "hansjhoffman.elm.config.elmTrace",
  Reload = "hansjhoffman.elm.config.reload",
}

interface Preferences {
  elmPath: O.Option<string>;
  elmFormatPath: O.Option<string>;
  elmReviewPath: O.Option<string>;
  elmTestPath: O.Option<string>;
  formatOnSave: O.Option<boolean>;
  lsDisableDiagnostics: O.Option<boolean>;
  lsReviewDiagnostics: O.Option<Behavior>;
  lsTrace: O.Option<Behavior>;
}

interface UserPreferences {
  readonly workspace: Readonly<Preferences>;
  readonly global: Readonly<Preferences>;
}

interface InvokeFormatterError {
  readonly _tag: "invokeFormatterError";
  readonly reason: string;
}

interface InstallDepsError {
  readonly _tag: "installDepsError";
  readonly reason: string;
}

interface StartError {
  readonly _tag: "startError";
  readonly reason: string;
}

interface ShutdownError {
  readonly _tag: "shutdownError";
  readonly reason: string;
}

interface ServerOptions {
  readonly type: "stdio" | "socket" | "pipe";
  readonly path: string;
  readonly args?: Array<string>;
  readonly env?: Record<string, string>;
}

type Behavior = "error" | "off" | "warning";

interface ClientSettings {
  readonly elmLS: Readonly<{
    // The path to your `elm` binary.
    elmPath: string;
    // The path to your `elm-format` binary.
    elmFormatPath: string;
    // The path to your `elm-review` binary.
    elmReviewPath: string;
    // Set severity or disable linting diagnostics for `elm-review`.
    elmReviewDiagnostics: Behavior;
    // The path to your `elm-test` binary.
    elmTestPath: string;
    // Disable linting diagnostics from the language server.
    disableElmLSDiagnostics: boolean;
    // Traces the communication between Nova and the language server.
    trace: Readonly<{
      server: Behavior;
    }>;
    // Skip confirmation for the Install Package code action.
    skipInstallPackageConfirmation: boolean;
    // Only update compiler diagnostics on save, not on document change.
    onlyUpdateDiagnosticsOnSave: boolean;
  }>;
}

interface ClientOptions {
  readonly initializationOptions?: ClientSettings;
  readonly syntaxes: Array<string>;
}

/*
 * Helpers
 */

const showNotification = (body: string): void => {
  if (nova.inDevMode()) {
    const notification = new NotificationRequest("elm-nova-notification");

    notification.title = nova.extension.name;
    notification.body = body;

    nova.notifications.add(notification);
  }
};

const extensionDir: string = nova.inDevMode()
  ? nova.extension.path
  : nova.extension.globalStoragePath;

const mkExtensionDepsPath = (binary: string): string => {
  return nova.path.join(extensionDir, "node_modules", ".bin", binary);
};

const safeFormat = (
  unformattedText: string,
  formatterPath: string,
): TE.TaskEither<InvokeFormatterError, string> => {
  return TE.tryCatch<InvokeFormatterError, string>(
    () => {
      return new Promise<string>((resolve, reject) => {
        const process = new Process(formatterPath, {
          args: ["--stdin"],
          stdio: ["pipe", "pipe", "ignore"],
        });

        let stdout: string = "";
        process.onStdout((line: string) => (stdout += line));

        process.onDidExit((status) => (status === 0 ? resolve(stdout) : reject()));

        /* HH - 2 Aug 2021
         * Until Nova [Stream](https://bit.ly/2VrtInY) types are improved, I'm forced to do this 😞
         */
        const writer = (process.stdin as any).getWriter();
        writer.ready.then(() => {
          writer.write(unformattedText);
          writer.close();
        });

        process.start();
      });
    },
    () => ({
      _tag: "invokeFormatterError",
      reason: `${nova.localize("Failed to format the document")}.`,
    }),
  );
};

const safeStart = (): TE.TaskEither<InstallDepsError | StartError, ReadonlyArray<void>> => {
  return TE.sequenceSeqArray<void, InstallDepsError | StartError>([
    TE.tryCatch<InstallDepsError, void>(
      () => {
        return new Promise<void>((resolve, reject) => {
          const process = new Process("/usr/bin/env", {
            args: ["npm", "install", "--only=prod", "--no-audit"],
            cwd: extensionDir,
          });

          process.onDidExit((status) => (status === 0 ? resolve() : reject()));

          process.start();
        });
      },
      () => ({ _tag: "installDepsError", reason: "Failed to install extension deps." }),
    ),
    TE.tryCatch<StartError, void>(
      () => {
        return new Promise<void>((resolve, _reject) => {
          pipe(
            languageClient,
            O.map((oldClient) => {
              oldClient.stop();
              nova.subscriptions.remove(compositeDisposable);
              languageClient = O.none;
            }),
          );

          const serverOptions: ServerOptions = {
            path: nova.path.join(nova.extension.path, "elm-ls", "out", "index.js"),
            type: "stdio",
          };

          const clientOptions: ClientOptions = {
            initializationOptions: {
              elmLS: {
                elmPath: selectElmPathWithDefault(preferences),
                elmFormatPath: selectElmFormatPathWithDefault(preferences),
                elmReviewPath: selectElmReviewPathWithDefault(preferences),
                elmReviewDiagnostics: selectLSReviewDiagnosticsWithDefault(preferences),
                elmTestPath: selectElmTestPathWithDefault(preferences),
                disableElmLSDiagnostics: selectLSDisableDiagnosticsWithDefault(preferences),
                trace: {
                  server: selectLSTraceWithDefault(preferences),
                },
                skipInstallPackageConfirmation: false,
                onlyUpdateDiagnosticsOnSave: false,
              },
            },
            syntaxes: ["elm"],
          };

          const client = new LanguageClient(
            "elmLS",
            nova.extension.name,
            serverOptions,
            clientOptions,
          );

          compositeDisposable.add(
            client.onDidStop((err) => {
              let message = nova.localize("Elm Language Server stopped unexpectedly");
              if (err) {
                message += `:\n\n${err.toString()}`;
              } else {
                message += ".";
              }
              message += `\n\n${nova.localize(
                "Please report this, along with any output in the Extension Console.",
              )}`;

              nova.workspace.showActionPanel(
                message,
                { buttons: [nova.localize("Restart"), nova.localize("Ignore")] },
                (idx) => {
                  if (idx == 0) {
                    nova.commands.invoke(ExtensionConfigKeys.Reload);
                  }
                },
              );
            }),
          );

          nova.subscriptions.add(compositeDisposable);
          client.start();
          languageClient = O.some(client);

          resolve();
        });
      },
      () => ({ _tag: "startError", reason: "Failed to start language server." }),
    ),
  ]);
};

const safeShutdown = (): TE.TaskEither<ShutdownError, void> => {
  return TE.tryCatch<ShutdownError, void>(
    () => {
      return new Promise<void>((resolve, _reject) => {
        pipe(
          languageClient,
          O.map((client) => {
            client.stop();
            nova.subscriptions.remove(compositeDisposable);
            compositeDisposable.dispose();
            languageClient = O.none;
          }),
        );

        resolve();
      });
    },
    () => ({ _tag: "shutdownError", reason: "Uh oh... Failed to deactivate plugin." }),
  );
};

/*
 * Main
 */

let preferences: UserPreferences = {
  workspace: {
    elmPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    elmFormatPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmFormatPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    elmReviewPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmReviewPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    elmTestPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmTestPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    formatOnSave: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.FormatOnSave)),
      O.chain((value: unknown) => O.fromEither(D.boolean.decode(value))),
    ),
    lsDisableDiagnostics: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSDisableDiagnostics)),
      O.chain((value: unknown) => O.fromEither(D.boolean.decode(value))),
    ),
    lsReviewDiagnostics: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSReviewDiagnostics)),
      O.chain((value: unknown) =>
        O.fromEither(
          D.union(D.literal("error"), D.literal("off"), D.literal("warning")).decode(value),
        ),
      ),
    ),
    lsTrace: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSTrace)),
      O.chain((value: unknown) =>
        O.fromEither(
          D.union(D.literal("error"), D.literal("off"), D.literal("warning")).decode(value),
        ),
      ),
    ),
  },
  global: {
    elmPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    elmFormatPath: pipe(
      O.fromNullable(nova.config.get(ExtensionConfigKeys.ElmFormatPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    elmReviewPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmReviewPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    elmTestPath: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.ElmTestPath)),
      O.chain((path: unknown) => O.fromEither(D.string.decode(path))),
      O.chain(O.fromPredicate((path) => isFalse(Str.isEmpty(path)))),
    ),
    formatOnSave: pipe(
      O.fromNullable(nova.config.get(ExtensionConfigKeys.FormatOnSave)),
      O.chain((value: unknown) => O.fromEither(D.boolean.decode(value))),
    ),
    lsDisableDiagnostics: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSDisableDiagnostics)),
      O.chain((value: unknown) => O.fromEither(D.boolean.decode(value))),
    ),
    lsReviewDiagnostics: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSReviewDiagnostics)),
      O.chain((value: unknown) =>
        O.fromEither(
          D.union(D.literal("error"), D.literal("off"), D.literal("warning")).decode(value),
        ),
      ),
    ),
    lsTrace: pipe(
      O.fromNullable(nova.workspace.config.get(ExtensionConfigKeys.LSTrace)),
      O.chain((value: unknown) =>
        O.fromEither(
          D.union(D.literal("error"), D.literal("off"), D.literal("warning")).decode(value),
        ),
      ),
    ),
  },
};

const workspaceConfigsLens = Lens.fromPath<UserPreferences>()(["workspace"]);
const globalConfigsLens = Lens.fromPath<UserPreferences>()(["global"]);

const compositeDisposable: CompositeDisposable = new CompositeDisposable();
let saveListeners: Map<string, Disposable> = new Map();
let languageClient: O.Option<LanguageClient> = O.none;

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectElmPathWithDefault = (preferences: UserPreferences): string => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return pipe(
    workspace.elmPath,
    O.alt(() => global.elmPath),
    O.getOrElse(() => mkExtensionDepsPath("elm")),
  );
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectElmFormatPathWithDefault = (preferences: UserPreferences): string => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return pipe(
    workspace.elmFormatPath,
    O.alt(() => global.elmFormatPath),
    O.getOrElse(() => mkExtensionDepsPath("elm-format")),
  );
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectElmReviewPathWithDefault = (preferences: UserPreferences): string => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return pipe(
    workspace.elmReviewPath,
    O.alt(() => global.elmReviewPath),
    O.getOrElse(() => mkExtensionDepsPath("elm-review")),
  );
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectElmTestPathWithDefault = (preferences: UserPreferences): string => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return pipe(
    workspace.elmTestPath,
    O.alt(() => global.elmTestPath),
    O.getOrElse(() => mkExtensionDepsPath("elm-test")),
  );
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectFormatOnSaveWithDefault = (preferences: UserPreferences): boolean => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return O.isSome(workspace.formatOnSave) || O.isSome(global.formatOnSave);
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectLSDisableDiagnosticsWithDefault = (preferences: UserPreferences): boolean => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return O.isSome(workspace.lsDisableDiagnostics) || O.isSome(global.lsDisableDiagnostics);
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectLSReviewDiagnosticsWithDefault = (preferences: UserPreferences): Behavior => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return pipe(
    workspace.lsReviewDiagnostics,
    O.alt(() => global.lsReviewDiagnostics),
    O.getOrElseW(() => "off"),
  ) as Behavior;
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
const selectLSTraceWithDefault = (preferences: UserPreferences): Behavior => {
  const workspace = workspaceConfigsLens.get(preferences);
  const global = globalConfigsLens.get(preferences);

  return pipe(
    workspace.lsTrace,
    O.alt(() => global.lsTrace),
    O.getOrElseW(() => "off"),
  ) as Behavior;
};

const addSaveListener = (editor: TextEditor): void => {
  pipe(
    O.fromNullable(editor.document.syntax),
    O.chain(O.fromPredicate((syntax) => Str.Eq.equals(syntax, "elm"))),
    O.fold(constVoid, (_) => {
      saveListeners = M.upsertAt(Str.Eq)(editor.document.uri, editor.onWillSave(formatDocument))(
        saveListeners,
      );
    }),
  );
};

const clearSaveListeners = (): void => {
  pipe(
    saveListeners,
    M.map((disposable) => disposable.dispose()),
  );

  saveListeners = new Map();
};

const formatDocument = (editor: TextEditor): Promise<void> => {
  const formatterPath = selectElmFormatPathWithDefault(preferences);

  const documentRange: Range = new Range(0, editor.document.length);
  const documentText: string = editor.document.getTextInRange(documentRange);

  return safeFormat(documentText, formatterPath)().then(
    E.fold(
      (err) => {
        return match(err)
          .with({ _tag: "invokeFormatterError" }, ({ reason }) => console.error(reason))
          .exhaustive();
      },
      (formattedText: string) => {
        editor
          .edit((edit: TextEditorEdit) => {
            edit.replace(documentRange, formattedText);
          })
          .then(() => {
            console.log(`${nova.localize("Formatted")} ${editor.document.path}`);
          })
          .catch(() => {
            console.error(`${nova.localize("Failed to replace editor text in-memory")}`);
          });
      },
    ),
  );
};

export const activate = (): void => {
  console.log(`${nova.localize("Activating")}...`);
  showNotification(`${nova.localize("Starting extension")}...`);

  compositeDisposable.add(
    nova.workspace.onDidAddTextEditor((editor: TextEditor): void => {
      const shouldFormatOnSave = selectFormatOnSaveWithDefault(preferences);

      if (shouldFormatOnSave) {
        addSaveListener(editor);
      }
    }),
  );

  compositeDisposable.add(
    nova.commands.register(ExtensionConfigKeys.FormatDocument, formatDocument),
  );

  compositeDisposable.add(
    nova.workspace.config.onDidChange<unknown>(
      ExtensionConfigKeys.ElmFormatPath,
      (newValue, _oldValue): void => {
        preferences = workspaceConfigsLens.modify((prevWorkspace) => ({
          ...prevWorkspace,
          formatterPath: O.fromEither(D.string.decode(newValue)),
        }))(preferences);

        const shouldFormatOnSave = selectFormatOnSaveWithDefault(preferences);

        if (shouldFormatOnSave) {
          clearSaveListeners();
          nova.workspace.textEditors.forEach(addSaveListener);
        }
      },
    ),
  );

  compositeDisposable.add(
    nova.workspace.config.onDidChange<unknown>(
      ExtensionConfigKeys.FormatOnSave,
      (newValue, _oldValue): void => {
        preferences = workspaceConfigsLens.modify((prevWorkspace) => ({
          ...prevWorkspace,
          formatOnSave: O.fromEither(D.boolean.decode(newValue)),
        }))(preferences);

        const shouldFormatOnSave = selectFormatOnSaveWithDefault(preferences);

        clearSaveListeners();

        if (shouldFormatOnSave) {
          nova.workspace.textEditors.forEach(addSaveListener);
        }
      },
    ),
  );

  compositeDisposable.add(
    nova.config.onDidChange<unknown>(
      ExtensionConfigKeys.ElmFormatPath,
      (newValue, _oldValue): void => {
        preferences = globalConfigsLens.modify((prevGlobal) => ({
          ...prevGlobal,
          formatterPath: O.fromEither(D.string.decode(newValue)),
        }))(preferences);

        const shouldFormatOnSave = selectFormatOnSaveWithDefault(preferences);

        if (shouldFormatOnSave) {
          clearSaveListeners();
          nova.workspace.textEditors.forEach(addSaveListener);
        }
      },
    ),
  );

  compositeDisposable.add(
    nova.config.onDidChange<unknown>(
      ExtensionConfigKeys.FormatOnSave,
      (newValue, _oldValue): void => {
        preferences = globalConfigsLens.modify((prevGlobal) => ({
          ...prevGlobal,
          formatOnSave: O.fromEither(D.boolean.decode(newValue)),
        }))(preferences);

        const shouldFormatOnSave = selectFormatOnSaveWithDefault(preferences);

        clearSaveListeners();

        if (shouldFormatOnSave) {
          nova.workspace.textEditors.forEach(addSaveListener);
        }
      },
    ),
  );

  if (isFalse(nova.workspace.contains(nova.path.join(nova.workspace.path ?? "", "elm.json"))))
    return;

  safeStart()().then(
    E.fold(
      (err) => {
        match(err)
          .with({ _tag: "installDepsError" }, ({ reason }) => console.error(reason))
          .with({ _tag: "startError" }, ({ reason }) => console.error(reason))
          .exhaustive();
      },
      () => console.log("Activated 🎉. Happy Elm-ing :)"),
    ),
  );
};

export const deactivate = (): void => {
  console.log(`${nova.localize("Deactivating")}...`);

  pipe(
    languageClient,
    O.fold(constVoid, (client) => {
      client.stop();
      languageClient = O.none;
    }),
  );

  safeShutdown()().then(
    E.fold(
      (err) => {
        match(err)
          .with({ _tag: "shutdownError" }, ({ reason }) => console.error(reason))
          .exhaustive();
      },
      () => console.log("Deactivated. Come back soon :)"),
    ),
  );

  clearSaveListeners();
  compositeDisposable.dispose();
};
