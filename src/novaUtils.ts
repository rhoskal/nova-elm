import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/function";

import { isNil } from "./typeGuards";

export function wrapCommand(
  command: (...args: unknown[]) => void | Promise<void>,
): (...args: unknown[]) => void {
  return async function wrapped(...args: unknown[]) {
    try {
      await command(...args);
    } catch (err) {
      nova.workspace.showErrorMessage(err);
    }
  };
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/nova-editor-node/index.d.ts#L956
export const openFile = (uri: string, opts?: FileLocation) => {
  return pipe(
    TE.tryCatch(() => nova.workspace.openFile(uri, opts), constVoid),
    TE.fold(
      () => T.of(null),
      (newEditor) => T.of(newEditor),
    ),
  )();
};

export const showNotification = (body: string): void => {
  if (nova.inDevMode()) {
    const notification = new NotificationRequest("elm-nova-notification");
    notification.title = nova.localize("Elm extension");
    notification.body = nova.localize(body);
    nova.notifications.add(notification);
  }
};
