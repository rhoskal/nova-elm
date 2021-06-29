# Elm support for Nova

This plugin provides **Elm** syntax highlighting, autocompletions, and language server support for the new [Nova editor from Panic](https://panic.com/nova/).

## Language Support

## Usage

![](https://nova.app/images/en/dark/editor.png)

### Using the default binaries

This extension will automatically find the workspace version of `elm-format` & `elm-language-server` installed under `node_modules` in your workspace root. If one isn't installed this plugin will use a recent, bundled version of either.

To customize this, you can specify the `elm-format` & `elm-language-server` binary location in workspace preferences (Extensions > Elm > Preferences > xxx) as an absolute or workspace-relative path.

## TODO

- [x] Syntax support
- [ ] Language server support
- [ ] Format on save
