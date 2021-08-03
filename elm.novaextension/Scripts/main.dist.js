'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var elmFormat = function (inputText) {
    var setUpProcess = function (reject) {
        var identifier = nova.extension.identifier;
        var config = nova.workspace.config;
        var defaultProcess = new Process("elm-format");
        var configPath = config.get(identifier + ".elmFormatPath", "string");
        if (!configPath || configPath.trim() === "") {
            var message = "Please provide an elm-format executable in Project Settings to enable formatting.";
            reject(message);
            return defaultProcess;
        }
        var elmFormatPath = nova.path.expanduser(configPath);
        return new Process(elmFormatPath, { args: ["--stdin"], stdio: "pipe" });
    };
    var writeToStdin = function (process, inputText) {
        var writer = process.stdin.getWriter();
        writer.ready.then(function () {
            writer.write(inputText);
            writer.close();
        });
    };
    var collectOutputText = function (stdout, buffer) { return (buffer.stdout += stdout); };
    var collectErrorText = function (stderr, buffer) { return (buffer.stderr += stderr); };
    return new Promise(function (resolve, reject) {
        try {
            var process_1 = setUpProcess(reject);
            var buffer_1 = { stdout: "", stderr: "" };
            process_1.onStdout(function (stdout) { return collectOutputText(stdout, buffer_1); });
            process_1.onStderr(function (stderr) { return collectErrorText(stderr, buffer_1); });
            process_1.onDidExit(function (status) {
                if (status === 0) {
                    resolve(buffer_1.stdout);
                }
                else {
                    reject(buffer_1.stderr);
                }
            });
            writeToStdin(process_1, inputText);
            process_1.start();
        }
        catch (err) {
            reject(err);
        }
    });
};

var activate = function () {
    var replaceDocument = function (editor, text) {
        var documentSpan = new Range(0, editor.document.length);
        editor.edit(function (edit) {
            edit.replace(documentSpan, text);
        });
    };
    var notifyError = function (message) {
        var notification = new NotificationRequest("crystal-format-error");
        notification.title = nova.localize("Crystal Format Error");
        notification.body = nova.localize(message);
        notification.actions = [nova.localize("OK")];
        nova.notifications.add(notification);
        console.error(message);
    };
    var formatDocument = function (editor) {
        var documentSpan = new Range(0, editor.document.length);
        var documentText = editor.document.getTextInRange(documentSpan);
        return elmFormat(documentText)
            .then(function (formattedText) { return replaceDocument(editor, formattedText); })
            .catch(notifyError);
    };
    nova.workspace.onDidAddTextEditor(function (editor) {
        if (editor.document.syntax != "elm")
            return;
        editor.onWillSave(function (editor) {
            var identifier = nova.extension.identifier;
            var config = nova.workspace.config;
            var formatOnSave = config.get(identifier + ".formatOnSave", "boolean");
            if (formatOnSave === true) {
                return formatDocument(editor);
            }
        });
    });
    nova.commands.register("elm.format", formatDocument);
};
var deactivate = function () { };

exports.activate = activate;
exports.deactivate = deactivate;
//# sourceMappingURL=main.dist.js.map
