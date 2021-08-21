import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { Behavior, UserPreferences } from "./types";

const extensionDir: string = nova.inDevMode()
  ? nova.extension.path
  : nova.extension.globalStoragePath;

const mkExtensionDepsPath = (binary: string): string => {
  return nova.path.join(extensionDir, "node_modules", ".bin", binary);
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
export const selectElmPathWithDefault = (preferences: UserPreferences): string => {
  const { global, workspace } = preferences;

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
export const selectElmFormatPathWithDefault = (preferences: UserPreferences): string => {
  const { global, workspace } = preferences;

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
export const selectElmReviewPathWithDefault = (preferences: UserPreferences): string => {
  const { global, workspace } = preferences;

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
export const selectElmTestPathWithDefault = (preferences: UserPreferences): string => {
  const { global, workspace } = preferences;

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
export const selectFormatOnSaveWithDefault = (preferences: UserPreferences): boolean => {
  const { global, workspace } = preferences;

  return O.isSome(workspace.formatOnSave) || O.isSome(global.formatOnSave);
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
export const selectLSDisableDiagnosticsWithDefault = (preferences: UserPreferences): boolean => {
  const { global, workspace } = preferences;

  return O.isSome(workspace.lsDisableDiagnostics) || O.isSome(global.lsDisableDiagnostics);
};

/**
 * Gets a value giving precedence to workspace over global extension values.
 * @param {UserPreferences} preferences - user preferences
 */
export const selectLSReviewDiagnosticsWithDefault = (preferences: UserPreferences): Behavior => {
  const { global, workspace } = preferences;

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
export const selectLSTraceWithDefault = (preferences: UserPreferences): Behavior => {
  const { global, workspace } = preferences;

  return pipe(
    workspace.lsTrace,
    O.alt(() => global.lsTrace),
    O.getOrElseW(() => "off"),
  ) as Behavior;
};
