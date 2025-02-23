## Webpack Deadcode Plugin

Webpack plugin to detect unused files and unused exports in used files

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![licenses][licenses]][licenses-url]

### Installation

Via npm:

```bash
$ npm install @tfboys/webpack-deadcode-plugin --save-dev
```

Via yarn:

```bash
$ yarn add -D @tfboys/webpack-deadcode-plugin
```

![output](https://i.imgur.com/3Ll49Pj.png)


### New Feature

This plugin supports delete unused files and output path of unused files to a json file, then you can easily exclude files you want to ingore.

![prompt](screenshot/prompt.png)

### Usage

The plugin will report unused files and unused exports into your terminal but those are not part of your webpack build process, therefore, it will not fail your build (warning you). Simple add into your webpack config as follows:

✍️ If you use `babel-loader`, you have to set `modules: false` to make it works

```bash
# in .babelrc
{
  "presets": [
    ["env", { modules: false }]
  ]
}

# or in webpack.config.js -> module/rules
{
  loader: 'babel-loader',
  options: {
    presets: [
      ['env', { modules: false }
    ]
  }
}
```

**Webpack 3**

```js
const DeadCodePlugin = require('webpack-deadcode-plugin');

const webpackConfig = {
  ...
  plugins: [
    new DeadCodePlugin({
      patterns: [
        'src/**/*.(js|jsx|css)',
      ],
      exclude: [
        '**/*.(stories|spec).(js|jsx)',
      ],
    })
  ]
}
```

**Webpack 4**

```js
const DeadCodePlugin = require('webpack-deadcode-plugin');

const webpackConfig = {
  ...
  optimization: {
    usedExports: true,
  },
  plugins: [
    new DeadCodePlugin({
      patterns: [
        'src/**/*.(js|jsx|css)',
      ],
      exclude: [
        '**/*.(stories|spec).(js|jsx)',
      ],
    })
  ]
}
```

#### Using non-existent css class names

To detect using non-existent class names in your codebase, you have to use [`es6-css-loader`](https://github.com/MQuy/es6-css-loader) instead of `style-loader/mini-css-extract-plugin`. They are quite similiar in term of api except [`es6-css-loader`](https://github.com/MQuy/es6-css-loader) supports to detect non-existent css class names.

![non-existent css class names](https://i.imgur.com/amHZF5Q.png)

You can check `samples` folder, how to to config `webpack-deadcode-plugin` and `es6-css-loader`.

#### Typescript

Using with typescript loader ([ts-loader](https://github.com/TypeStrong/ts-loader), [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader)), if you enable `transpileOnly/happyPackMode`, output might be not correct due to [this issue](https://github.com/TypeStrong/ts-loader/issues/783). In case of incorrect output, the workaround solution is disabling `transpileOnly`, it will slow down webpack compiling time.

✍ Under some circumstances and production mode, if your output displays incorrect unused files, we encourage switching to [`awesome-typescript-loader`](https://github.com/s-panferov/awesome-typescript-loader).

### Configuration

```js
new DeadCodePlugin(options);
```

#### options.patterns (default: `["**/*.*"]`)

The array of patterns to look for unused files and unused export in used files. Directly pass to [`fast-glob`](https://github.com/mrmlnc/fast-glob)

#### options.exclude (default: `[]`)

The array of patterns to not look at.

#### options.outputFile

The path of file which contains unused files' path

#### options.context

Current working directoy for patterns above. If you don't set explicitly, your webpack context will be used.

#### options.failOnHint (default: `false`)

Deadcode does not interrupt the compilation by default. If you want to cancel the compilation, set it true, it throws a fatal error and stops the compilation.

#### options.detectUnusedFiles (default: `true`)

Whether to run unused files detection or not.

#### options.detectUnusedExport (default: `true`)

Whether to run unsed export detection or not.

[npm]: https://img.shields.io/npm/v/webpack-deadcode-plugin.svg
[npm-url]: https://npmjs.com/package/webpack-deadcode-plugin
[node]: https://img.shields.io/node/v/webpack-deadcode-plugin.svg
[node-url]: https://nodejs.org
[deps]: https://img.shields.io/david/MQuy/webpack-deadcode-plugin.svg
[deps-url]: https://david-dm.org/MQuy/webpack-deadcode-plugin
[licenses]: https://img.shields.io/github/license/MQuy/webpack-deadcode-plugin.svg
[licenses-url]: https://github.com/MQuy/webpack-deadcode-plugin/blob/master/LICENSE
