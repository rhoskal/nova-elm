import * as O from "fp-ts/Option";

import {
  selectElmPathWithDefault,
  selectElmFormatPathWithDefault,
  selectElmReviewPathWithDefault,
  selectLSReviewDiagnosticsWithDefault,
  selectElmTestPathWithDefault,
  selectLSDisableDiagnosticsWithDefault,
  selectLSTraceWithDefault,
} from "../selectors";
import { Behavior, UserPreferences } from "../types";

describe("[Selectors]", () => {
  describe("Elm Path", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmPathWithDefault(mockPreferences);
      const expected: string = "/extension/node_modules/.bin/elm";

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.some(globalPath),
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmPathWithDefault(mockPreferences);
      const expected: string = globalPath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspacePath: string = "path/to/workspace/elm";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.some(workspacePath),
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm";
      const workspacePath: string = "path/to/workspace/elm";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.some(workspacePath),
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.some(globalPath),
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("Elm Format Path", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmFormatPathWithDefault(mockPreferences);
      const expected: string = "/extension/node_modules/.bin/elm-format";

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm-format";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.some(globalPath),
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmFormatPathWithDefault(mockPreferences);
      const expected: string = globalPath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspacePath: string = "path/to/workspace/elm-format";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.some(workspacePath),
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmFormatPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm-format";
      const workspacePath: string = "path/to/workspace/elm-format";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.some(workspacePath),
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.some(globalPath),
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmFormatPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("Elm Review Path", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmReviewPathWithDefault(mockPreferences);
      const expected: string = "/extension/node_modules/.bin/elm-review";

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm-review";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.some(globalPath),
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmReviewPathWithDefault(mockPreferences);
      const expected: string = globalPath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspacePath: string = "path/to/workspace/elm-review";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.some(workspacePath),
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmReviewPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm-review";
      const workspacePath: string = "path/to/workspace/elm-review";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.some(workspacePath),
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.some(globalPath),
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmReviewPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("Elm Test Path", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmTestPathWithDefault(mockPreferences);
      const expected: string = "/extension/node_modules/.bin/elm-test";

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm-test";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.some(globalPath),
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmTestPathWithDefault(mockPreferences);
      const expected: string = globalPath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspacePath: string = "path/to/workspace/elm-test";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.some(workspacePath),
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmTestPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalPath: string = "path/to/global/elm-test";
      const workspacePath: string = "path/to/workspace/elm-test";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.some(workspacePath),
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.some(globalPath),
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: string = selectElmTestPathWithDefault(mockPreferences);
      const expected: string = workspacePath;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("LS Review Diagnostics", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: Behavior = selectLSReviewDiagnosticsWithDefault(mockPreferences);
      const expected: Behavior = "off";

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalBehavior: Behavior = "warning";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.some(globalBehavior),
          lsTrace: O.none,
        },
      };

      const actual: Behavior = selectLSReviewDiagnosticsWithDefault(mockPreferences);
      const expected: Behavior = globalBehavior;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspaceBehavior: Behavior = "error";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.some(workspaceBehavior),
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: Behavior = selectLSReviewDiagnosticsWithDefault(mockPreferences);
      const expected: Behavior = workspaceBehavior;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalBehavior: Behavior = "off";
      const workspaceBehavior: Behavior = "warning";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.some(workspaceBehavior),
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.some(globalBehavior),
          lsTrace: O.none,
        },
      };

      const actual: Behavior = selectLSReviewDiagnosticsWithDefault(mockPreferences);
      const expected: Behavior = workspaceBehavior;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("LS Disable Diagnostics", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: boolean = selectLSDisableDiagnosticsWithDefault(mockPreferences);
      const expected: boolean = false;

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalBehavior: boolean = true;

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.some(globalBehavior),
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: boolean = selectLSDisableDiagnosticsWithDefault(mockPreferences);
      const expected: boolean = globalBehavior;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspaceBehavior: boolean = true;

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.some(workspaceBehavior),
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: boolean = selectLSDisableDiagnosticsWithDefault(mockPreferences);
      const expected: boolean = workspaceBehavior;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalBehavior: boolean = false;
      const workspaceBehavior: boolean = true;

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.some(workspaceBehavior),
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.some(globalBehavior),
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: boolean = selectLSDisableDiagnosticsWithDefault(mockPreferences);
      const expected: boolean = workspaceBehavior;

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("LS Trace", () => {
    test("(N) Workspace & (N) Global", () => {
      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: Behavior = selectLSTraceWithDefault(mockPreferences);
      const expected: Behavior = "off";

      expect(actual).toStrictEqual(expected);
    });

    test("(N) Workspace & (Y) Global", () => {
      const globalBehavior: Behavior = "warning";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.some(globalBehavior),
        },
      };

      const actual: Behavior = selectLSTraceWithDefault(mockPreferences);
      const expected: Behavior = globalBehavior;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (N) Global", () => {
      const workspaceBehavior: Behavior = "error";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.some(workspaceBehavior),
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.none,
        },
      };

      const actual: Behavior = selectLSTraceWithDefault(mockPreferences);
      const expected: Behavior = workspaceBehavior;

      expect(actual).toStrictEqual(expected);
    });

    test("(Y) Workspace & (Y) Global", () => {
      const globalBehavior: Behavior = "off";
      const workspaceBehavior: Behavior = "warning";

      const mockPreferences: UserPreferences = {
        workspace: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.some(workspaceBehavior),
        },
        global: {
          elmPath: O.none,
          elmFormatPath: O.none,
          elmReviewPath: O.none,
          elmTestPath: O.none,
          formatOnSave: O.none,
          lsDisableDiagnostics: O.none,
          lsReviewDiagnostics: O.none,
          lsTrace: O.some(globalBehavior),
        },
      };

      const actual: Behavior = selectLSTraceWithDefault(mockPreferences);
      const expected: Behavior = workspaceBehavior;

      expect(actual).toStrictEqual(expected);
    });
  });
});
