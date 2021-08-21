import * as O from "fp-ts/Option";

export enum ExtensionConfigKeys {
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

export interface Preferences {
  readonly elmPath: O.Option<string>;
  readonly elmFormatPath: O.Option<string>;
  readonly elmReviewPath: O.Option<string>;
  readonly elmTestPath: O.Option<string>;
  readonly formatOnSave: O.Option<boolean>;
  readonly lsDisableDiagnostics: O.Option<boolean>;
  readonly lsReviewDiagnostics: O.Option<Behavior>;
  readonly lsTrace: O.Option<Behavior>;
}

export interface UserPreferences {
  readonly workspace: Readonly<Preferences>;
  readonly global: Readonly<Preferences>;
}

export type Behavior = "error" | "off" | "warning";
