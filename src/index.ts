import * as O from "fp-ts/Option";
import { constVoid, pipe } from "fp-ts/function";

import { ElmLanguageServer } from "./lsp";

let languageServer: ElmLanguageServer | null = null;

export const activate = (): void => {
  languageServer = new ElmLanguageServer();
};

export const deactivate = (): void => {
  pipe(
    O.fromNullable(languageServer),
    O.fold(constVoid, (ls) => {
      ls.deactivate();
      languageServer = null;
    }),
  );
};
