## v0.5.0 - 2021-08-09

### Fixes

- `[language-server]` Don't use `node_modules/.bin` path for server. ([#29](https://github.com/hansjhoffman/nova-elm/pull/29))

## v0.4.0 - 2021-08-08

### Chore & Maintenance

- `[core]` Update extension and dev deps.
- `[syntax]` Lots of internal renaming for better maintenance.

### Features

- `[language-server]` Initial (partial) Language Server support. ([#26](https://github.com/hansjhoffman/nova-elm/pull/26))

### Fixes

- `[syntax]` Scoped name fixes for better support of different themes. ([#27](https://github.com/hansjhoffman/nova-elm/pull/27))
- `[syntax]` Make lists foldable. ([#25](https://github.com/hansjhoffman/nova-elm/pull/25))

## v0.3.0 - 2021-08-03

### Chore & Maintenance

- `[core]` Update extension and dev deps.

### Features

- `[formatter]` Listen for config changes to formatter. ([#22](https://github.com/hansjhoffman/nova-elm/pull/22))
- `[formatter]` Add formatter command and format on save. ([#21](https://github.com/hansjhoffman/nova-elm/pull/21))

## v0.2.0 - 2021-07-18

### Features

- `[syntax]` Effect and infix recognition. ([#9](https://github.com/hansjhoffman/nova-elm/pull/9))

### Fixes

- `[syntax]` fns, fn args, type annotations and ports recognition with only one char. ([#9](https://github.com/hansjhoffman/nova-elm/pull/9))
- `[syntax]` Integer & float detection. ([#9](https://github.com/hansjhoffman/nova-elm/pull/9))
- `[syntax]` Import recognition can now span multiple lines. ([#9](https://github.com/hansjhoffman/nova-elm/pull/9))

## v0.1.0 - 2021-07-15

### Initial release 🎉

- Basic syntax highlighting
