(global as any).nova = {
  extension: {
    path: "/extension",
  },
  inDevMode: jest.fn(() => true),
  localize: jest.fn((x: string) => x),
  path: {
    join(...args: Array<string>) {
      return args.join("/");
    },
  },
};
