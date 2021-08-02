import { elmFormat } from "./elmFormatter";

export const activate = (): void => {
  const replaceDocument = (editor: TextEditor, text: string) => {
    const documentSpan = new Range(0, editor.document.length);
    editor.edit((edit) => {
      edit.replace(documentSpan, text);
    });
  };

  const notifyError = (message: string): void => {
    let notification = new NotificationRequest("crystal-format-error");
    notification.title = nova.localize("Crystal Format Error");
    notification.body = nova.localize(message);
    notification.actions = [nova.localize("OK")];
    nova.notifications.add(notification);
    console.error(message);
  };

  const formatDocument = (editor: TextEditor) => {
    const documentSpan = new Range(0, editor.document.length);
    const documentText = editor.document.getTextInRange(documentSpan);
    return elmFormat(documentText)
      .then((formattedText: string) => replaceDocument(editor, formattedText))
      .catch(notifyError);
  };

  nova.workspace.onDidAddTextEditor((editor) => {
    if (editor.document.syntax != "elm") return;

    editor.onWillSave((editor: TextEditor) => {
      const identifier = nova.extension.identifier;
      const config = nova.workspace.config;
      const formatOnSave = config.get(`${identifier}.formatOnSave`, "boolean");
      if (formatOnSave === true) {
        return formatDocument(editor);
      }
    });
  });

  nova.commands.register("elm.format", formatDocument);
};

export const deactivate = (): void => {};
