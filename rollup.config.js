import esbuild from "rollup-plugin-esbuild"
import dts from "rollup-plugin-dts"

const name = "index"
const isProd = process.env.NODE_ENV == 'production'

export default [
    {
        input: 'src/index.ts',
        plugins: [dts()],
    output: {
      file: `dist/lib/${name}.d.ts`,
      format: 'es',
    },
  },
    {
  input: 'src/index.ts',
  output: [
      {
        file: `dist/lib/${name}.js`,
        format: 'cjs',
        sourcemap: !isProd,
      },
      {
        file: `dist/lib/${name}.mjs`,
        format: 'es',
        sourcemap: !isProd,
      },
    ],
  plugins: [
    esbuild({
        minify: isProd,
        include: [
            "src/index.ts"
        ],
        loaders: {
            '.json': 'json',
        }
    }),
    ]
}, ]
