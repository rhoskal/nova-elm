import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { match } from "ts-pattern";

import { selectElmFormatPathWithDefault } from "../selectors";
import { UserPreferences } from "../types";

/*
 * Types
 */

interface InvokeFormatterError {
  readonly _tag: "invokeFormatterError";
  readonly reason: string;
}

/*
 * Helpers
 */

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

/*
 * Main
 */

export const formatDocument =
  (preferences: UserPreferences) =>
  (editor: TextEditor): Promise<void> => {
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
