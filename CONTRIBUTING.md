# Contributing

Hello! 👋

Thanks for checking out the contributing guide for nova-elm! Here are some tips and guidelines to make things as smooth as possible.

This project relies heavily on Typescript and the [fp-ts](https://gcanti.github.io/fp-ts/) ecosystem. FP for the win! 💪

### Running (and making changes) locally

You can take advantage of [Nix](https://nix.dev/) by running `nix-shell` in your terminal to setup your environment with the appropriate dependencies. Then you'll have access to node & yarn so you can install npm deps with `yarn install`.

The code for the Language Server integration lives in `src/` and syntax highlighting code lives in `elm.novaextension/Syntaxes/`.

### References

- [Extension API docs](https://docs.nova.app/)
- Other Nova [extensions](https://extensions.panic.com/)
- Regex [builder](https://regex101.com/)

### Making pull requests

I really appreciate pull requests, especially since it's a lot of work to maintain an editor plugin. You can ping me on the Elm slack channel or start a GitHub issue to discuss contributions.
