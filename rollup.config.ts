import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

const OUTPUT_DIR = "elm.novaextension/Scripts";

export default {
  input: "src/index.ts",
  plugins: [resolve(), typescript(), commonjs(), terser()],
  output: {
    file: `${OUTPUT_DIR}/main.cjs.min.js`,
    format: "cjs",
    sourcemap: true,
  },
};
