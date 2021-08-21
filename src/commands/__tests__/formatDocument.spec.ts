import * as O from "fp-ts/Option";

import { formatDocument } from "../formatDocument";
import { UserPreferences } from "../../types";

class MockRange {
  constructor(readonly start: number, readonly end: number) {}
}
(global as any).Range = MockRange;

const mockEditor = {
  document: {
    getTextInRange() {
      return `Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Sed sodales lacus congue justo tempor rhoncus.
          Aenean ultrices tempor pulvinar. Donec arcu libero, lacinia
          eget malesuada vel, auctor ac sapien.`;
    },
    eol: "\n",
    path: "path/to/some/file",
  },
} as unknown;

describe("[Commands] Format Document", () => {
  test("Failure - General Error", async () => {
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

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await formatDocument(mockPreferences)(mockEditor as TextEditor);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith("Failed to format the document.");

    consoleSpy.mockRestore();
  });
});
