---
title: Web 项目常用的非源码文件模板
date: 2023-08-14 10:13:00
tags:
- Cheatsheet
- JS
- Scaffold
categories:
- DOC
---

记录 Web 开发和 Node.js 开发中一些常见的非源码模板，最常见的也就是各种配置文件模板。



# 完整项目模板

本文篇幅较长，如果你看不下去或者有较为急迫的需求，可以直接使用以下完整项目模板。

基于 Create-React-App 的模板：

- [`@paperplane/cra-template-mui`](https://www.npmjs.com/package/@paperplane/cra-template-mui)：基于 mui 的前端项目模板；
- [`@paperplane/cra-template-antd`](https://www.npmjs.com/package/@paperplane/cra-template-antd)：基于 antd 的前端项目模板；

基于 Vite 的模板和 Next.js 等模板尚未完工，已完成的会添加在此列表。



# `.editorconfig` 文件

[EditorConfig](https://editorconfig.org/) 被编辑器广泛支持、面向多种编程语言，所以它提供的配置项（[查看所有](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)）不是特别多。它使用 `.editorconfig` 文件作为配置文件，VSCode 需要先[安装插件](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)。

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

注意这里给 `.md` 文件的配置项 `trim_trailing_whitespace = false`，这个切勿遗漏，否则编辑器会自动移除 markdown 文档所有行尾的空格，这会导致解析显示 markdown 时换行显示失效（不过，行尾没有空格不会影响 hexo 博文的换行）。



# `LICENSE` 开源许可

对开源许可不了解、对开源许可的名称不熟悉？[开源许可介绍及简称一览](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。
如何选择许可？[点我查看](https://choosealicense.com/)。

**注意，下面给出的是 MIT 协议的模板。如果你使用其他协议，请勿直接复制。**

使用方式：

- 把其中的 `[year]` 替换成年份，例如 `2023-present`；
- 把其中的 `[fullname]` 替换成你的名字，也可以把邮箱接在后面，例如 `jia-niang <1@paperplane.cc>`。

```
MIT License

Copyright (c) [year], [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```



# `.gitignore` 模板

不同的项目可能会使用不同的 `.gitignore`，可以在 [这个网站](https://www.toptal.com/developers/gitignore/) 查询某种开发语言所对应的 `.gitignore` 配置。

**注意，使用之前请先阅读补充说明：**

- 下面的模板认为代码编译构建后输出到目录 `./dist`（第二行），但是 cra 创建的 React 项目会默认输出到 `./build` 目录，你可以把 `/dist` 改成 `/build`；
  如果想改 cra 默认的编译构建输出目录，以下方式二选一：项目根目录下新建一个 `.env` 文件并写入 `BUILD_PATH = dist`；或是在运行编译构建指令时添加 `--output-path=dist` 参数；
- 下面的模板中，没有包含 `package-lock.json`、`yarn.lock` 和 `pnpm-lock.yaml` 等版本锁定文件，因此它们会一并上传；这是推荐做法，这样做可以提高多人开发以及 CI/CD 场景下依赖包的一致性。

```
# compiled output
/dist
/node_modules
/.pnpm-store

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

.env.local
.env.development.local
.env.production.local
```

-----

这里顺带提一下 `.gitattributes` 配置。

```
# Set the default behavior for all files
* text=auto eol=lf

# Set specific behavior for files with certain extensions
*.svg binary

# Ignore files and directories
logs/ export-ignore
*.bak export-ignore
```

推荐使用上述的配置。它会使得换行符默认使用 LF，并且将 `.svg` 文件视同二进制文件，因为 `.svg` 的内容是 XML 格式，Git 把它们当做文本来进行版本管理并不合适。更多详细的配置可以参考 [官方文档](https://www.git-scm.com/docs/gitattributes)。



# `.npmrc`  模板

这个文件用于定义一些 npm 配置，具体配置可以参考 [.npmrc 文档](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc) 和 [npm 配置文档](https://docs.npmjs.com/cli/v9/commands/npm-config)。
使用说明：

- 除了 npm 之外，yarn、pnpm 等包管理工具也会读取这个配置，而且它们分别也有各自的配置文件 [.yarnrc](https://classic.yarnpkg.com/en/docs/yarnrc)、[.yarnrc.yml](https://yarnpkg.com/configuration/yarnrc/) 和 [.pnpmrc](https://pnpm.io/npmrc)，这些配置文件往往有额外的专有配置项。
- 请注意：第一行的 `registry=https://registry.npmmirror.com` 会修改默认的 `registry`，这会导致发布包时不会正确的发布到 npm 源。
  你可以在发布包时添加 `--registry=https://registry.npmjs.org/` 参数，这样便可以正确发布到 npm 上了。

```ini
registry=https://registry.npmmirror.com

sass_binary_site=https://npmmirror.com/mirrors/node-sass/
phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs/
electron_mirror=https://npmmirror.com/mirrors/electron/
sqlite3_binary_host_mirror=http://npmmirror.com/mirrors/
profiler_binary_host_mirror=http://npmmirror.com/mirrors/node-inspector/
chromedriver_cdnurl=https://npmmirror.com/mirrors/chromedriver
sentrycli_cdnurl=https://npmmirror.com/mirrors/sentry-cli/
canvas_binary_host_mirror=https://registry.npmmirror.com/-/binary/canvas
```

如果你使用私有 npm 或是要发布自己的包，可以添加一行（其中的网址 url 可能会换成你自己的私有 npm 库地址）：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

此时安装、发布包都将使用私有的 npm 账户信息，你需要提前将 Access Token 设置为环境变量 `NPM_TOKEN`，如果不提前设置，安装依赖时就会报错。
你也可以将上面的 `${NPM_TOKEN}` 直接替换成 Access Token 明文，但是这样提交到代码仓库，可能会导致泄露。

这里不仅支持使用 Access Token，还可以保存账号密码用来登录，甚至还可以保存多个认证信息，可以参考 [.npmrc 文档](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc) 上面的示例。



# `package.json` 模板

建议阅读另一篇博文 [《读懂 package.json》](https://paperplane.cc/p/e340866d6dca/)。

作为前端项目和 Node.js 而言，`package.json` 不需要特别配置，因为它只需要记录 `dependencies` 和 `devDependencies` 即可。

如果是 cra 创建的项目，建议你：

- 把 `eslintConfig` 字段的内容转移到 `.eslintrc` 中，不要写在 `package.json` 里；
- 但 `browserslist` 字段则无所谓，因为它不会被频繁修改；
- 如果你的网站部署在子目录上面，还需要一个 `homepage` 字段。

```json
{
  "name": "",
  "private": true,
  "homepage": "",
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "eject": "react-scripts eject"
  },
  "dependencies": {
  },
  "devDependencies": {
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```

-----

如果你的项目是要作为 npm 包发布，此时 `package.json` 就需要仔细配置。
具体而言：

- 包名 `name`、版本号 `version`、入口 `main`、`module` 的重要性无需多言。

- 作为 npm 包发布时，`package.json` 不应包含任何开发依赖，例如 `prettier`、`eslint` 等都不应该包含在其中，因为作为使用者而言是不需要安装这些东西的；这些工具的配置更不应出现在 `package.json` 中；
- 如果是前端使用的包，通常会对代码进行打包编译，此时依赖项的代码都被编译进你的包了，此时也不需要 `dependencies` 了；例如你的代码用到了 `lodash`，发布时要打包编译，`lodash` 的代码已经编进你的包了，所以发布时 `dependencies` 就不需要写 `lodash` 了；
- 如果是组件库，或者是基于某一个包二次开发，那么原始的依赖请放入 `peerDependencies` 字段，并给一个比较宽泛的版本号；例如如果你的包是 React 的组件库，那么应该把 `react` 放到 `peerDependencies` 里；
- 上传 npm 时，很可能只需要传一部分文件，其他的文件例如各种开发工具配置、构建配置、测试套件等都是不需要上传的，所以需要用到 `files` 字段来指定上传哪些文件。

```js
{
  "name": "",
  "version": "0.0.1",
  "description": "",
  "main": "",
  "module": "",
  "unpkg": "",
  "typings": "",
  "scripts": {
  },
  "keywords": [
  ],
  "bugs": {
    "url": ""
  },
  "repository": {
    "type": "git",
    "url": ""
  },
  "author": "",
  "license": "MIT",
  "peerDependencies": {
  },
  "files": [
  ]
}
```



# `tsconfig.json` 模板

给 TypeScript 提供配置，注意这个配置会直接影响到代码编译输出或者运行的结果，建议配合 [配置文档](https://www.typescriptlang.org/tsconfig) 进行定制。

适用于 Web 前端的配置：

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ],
    },
    "typeRoots": [
      "node_modules/@types",
      "src/types/*"
    ]
  },
  "include": [
    "src"
  ]
}
```

其中 `paths` 字段要和 webpack 的 `alias` 配置保持一致。

此外，此配置允许从 `/src/types` 中自动加载类型定义，可以在此目录下放置一些 .d.ts 文件，全局都可以使用这些类型。

如果使用 `emotion`，则需要在 `compilerOptions` 中添加一行：

```json
{
  "compilerOptions": {
    "jsxImportSource": "@emotion/react"
  }
}
```

-----

如果是 Node.js 项目，这些配置可以相应更改：

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

注意 `target` 需要根据 Node.js 版本来进行选择，如果 Node.js 版本比较旧而 `target` 选择的比较新，可能会导致运行报错。
这份配置也会开启修饰符的支持。

-----

如果是用于发布的 JS 包，这些配置可以相应更改：

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

这份配置会开启输出 `index.d.ts` 类型定义文件，记得把它填写到 `package.json` 中的 `typings` 字段中，这样别人使用你的包时可以加载到类型定义；这份配置同样也会输出 sourcemap，方便使用者 debug 问题。

**请注意：对于 npm 包项目而言，不推荐写 `module` 字段，而是要通过打包时候提供 `--module commonjs` 这种方式来指定输出哪种类型的模块。**
这里给一个示例：

```bash
# 输出 UMD 类型到 /dist 目录下
tsc --module umd --outDir dist

# 输出 CommonJS 类型到 /lib 目录下
tsc --module commonjs --outDir lib

# 输出 ES Module 类型到 /es 目录下
tsc --module esnext --outDir es
```

这样可以输出三种类型的模块，然后 `package.json` 可以这样写：

```json
{
  "main": "lib/index.js",
  "module": "es/index.js",
  "jsnext:main": "es/index.js",
  "unpkg": "dist/index.js",
  "typings": "lib/index.d.ts"
}
```

这样你的包便可以同时提供三种类型的模块，而且还会提供 .d.ts 文件来提供 TypeScript 支持。

注意，使用 `tsc` 打包功能较为基础，且对于 `paths` 之类的支持还需要额外插件；
推荐使用 `rollup` 之类的专用打包工具。



# `.prettierrc` 模板

给 prettier 使用的配置，具体配置项可参考 [官方文档](https://prettier.io/docs/en/options)，需要已安装 [prettier](https://prettier.io/) 和 [VSCode prettier 格式化插件](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)。

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "semi": false,
  "trailingComma": "es5",
  "tabWidth": 2,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

<br />

额外推荐：安装 `@trivago/prettier-plugin-sort-imports` 这个包（[文档](https://github.com/trivago/prettier-plugin-sort-imports#readme)），它可以为 prettier 提供 `import` 语句分组排序功能。
安装这个包之后，请在 `.prettierrc` 文件中添加以下内容：

```json
{
  "plugins": ["@trivago/prettier-plugin-sort-imports"],
  "importOrder": [
    "^@?[a-zA-Z]+.+",
    "^@/(?!.*\\.(css|scss|less)$)",
    "^\\.\\.?/(?!.*.(css|scss|less)$)",
    "^.(?!(css|scss|less)$)[^.]*$",
    "(.css|.scss|.less)$"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": false,
  "importOrderGroupNamespaceSpecifiers": false
}
```

**注意：如果你用的是 prettier v3，那么必须包含 `"plugins": ["@trivago/prettier-plugin-sort-imports"],` 这一行，v2 版本不需要。**

这个配置可以使你的 `import` 按照类型分组： 直接用包名导入的在最上面，随后是 `@/` 开头的导入，随后是 `./` 和 `../` 开头的导入，而样式表类文件会放在最后面。

-----

有时可能会用到 `.prettierignore` 配置，它也使用 glob 通配符的格式表示无需 prettier 参与格式化的文件后缀：
```
**/*.md
```

这可以让 prettier 忽略所有 .md 文件，避免移除 markdown 文档的行尾空格，导致换行失效。



#  `.eslintrc` 模板（v8）

2024 更新：
现在出了 v9 版本的 ESLint 规则，基于 JS 对象而不是这种纯字符串，本身是挺好的，但目前不支持向上递归目录，这导致在 monorepo 中如果想为每个包配置规则，需要统一在根目录配置；我认为 v9 有待官方完善，后续会补充 v9 版本的配置。

-----

提供给 ESLint 的配置文件，具体配置可以参考 [官网文档](https://eslint.org/docs/latest/use/configure/)。

对于 React Web 项目或组件库，这里有一套推荐配置，它会使你的代码符合 hooks 规范以及 prettier 的输出，需要安装 `eslint-config-prettier`、`eslint-plugin-prettier`、`eslint-config-react-app`，模板如下：

```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:prettier/recommended"
  ],
  "plugins": [
  ],
  "rules": {
  }
}
```

注意这里 `extends` 字段中，`"plugin:prettier/recommended"` 必须始终放在最后，也就是说它的配置需要覆盖其他预设的配置。

如果你的 `prettier` 版本大于 `^3.0.0`，那么请使用 `eslint-plugin-prettier` 的大于 `^5.0.0` 的版本，否则可能无法正常工作。

> 为什么 `"plugin:prettier/recommended"` 必须始终放在最后？
>
> 因为 prettier 并没有 eslint 那么多的配置项，它能输出的格式比 eslint 支持的要少很多，如果要和 prettier 一起使用必须以 prettier 能输出的格式为底线，否则代码永远没法格式化正确，所以把它放在最后让它的配置始终能生效。
> 可以查看 `eslint-config-prettier` 的 [源码](https://github.com/prettier/eslint-config-prettier/blob/main/index.js)，这里配置为 `"off"` 的配置项表示 prettier 没办法适配的，必须关掉错误；配置为 `0` 的配置项则是 prettier 不做处理或可通过配置调整的代码格式规范，可以后续修改。

-----

非 Web 项目或组件库的话，如果是 typescript 的项目，可以安装 `eslint-config-prettier`、`eslint-plugin-prettier`、`@typescript-eslint/parser`、`@typescript-eslint/eslint-plugin`，并使用以下配置：

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true  
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": [
  ],
  "ignorePatterns": [
    "dist/**",
    "es/**",
    "lib/**"
  ],
  "rules": {
  }
}
```

此外，还可以参考下面的配置，添加 `env` 配置项来获取特定的全局变量支持，添加 `parserOptions` 配置项来获取特定的语法支持。

-----

如果是 JS 包，只需要安装 `eslint-config-prettier`、`eslint-plugin-prettier`，并使用以下配置：

```json
{
  "env": {
    "es2021": true,
    "commonjs": true,

    // 按需选用（3选1），这会开启对应的全局变量支持
    "browser": true,
    "node": true,
    "shared-node-browser": true,

    // 测试工具，按需选用
    "mocha": true,
    "jest": true,
    "jasmine": true,
  },
  "parserOptions": {
    "ecmaVersion": 2021
  },
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": [
  ],
  "rules": {
  }
}
```

注意这里的 `env.es2021` 以及 `parserOptions.ecmaVersion` 默认是 2021，这两个数字请设置相同，具体使用请根据 Node.js 版本来调整，前者用于识别新加入的全局变量，后者用于识别新语法。具体配置可以参考 [官网文档](https://eslint.org/docs/latest/use/configure/language-options)。

-----

还有几种配置场合，这里给出示例：

```json
{
  "extends": [
    // 开发 react hooks 库，需要相关的代码规范
    // 安装 `eslint-plugin-react-hooks`
    "react-hooks",

    // 解决不导入 react 则 JSX 代码有红波浪线的问题
    // 安装 `eslint-plugin-react`
    "plugin:react/jsx-runtime",

    // 开发 JS 的 react 组件库，需要兼容 JSX
    // 安装 `eslint-plugin-react`
    "plugin:react/recommended",
      
    // 以上所有问题，只需要这一个即可全部解决
    // （推荐）安装 `eslint-config-react-app`
    "react-app"
  ]
}
```

-----

此外，还可以使用 `.eslintignore` 来指定哪些文件被 eslint 忽略掉。
**请注意：在 monorepo 的场景下，子包中的 `.eslintignore` 不生效，此时还是需要使用各个子包 `.eslintrc` 中的 `ignorePatterns` 字段。**

-----

> 可以看出，如果插件名以 `eslint-plugin-` 前缀开头，那么可以省略这个前缀，只写后面部分的名称；
> 而如果插件名为 `@xxx/eslint-plugin`，那么可以省略 `/eslint-pulgin` 这个后缀，只写斜杠 `/` 前面部分的名称。
>
> 而 eslint 预设也适用于以上规则，把等同于把单词 `plugin` 换成 `config`。
>
> 很多插件为了方便使用和解决冲突，也会提供一份预设，通过 `plugin:插件名/预设名` 来使用，预设名一般叫 `recommended`；
> 一般而言，插件提供的预设也会把插件自身写在 `plugins` 里，因此只要 `extends` 了某个插件自带的预设，那么你就不需要在 `plugins` 中把这个插件名再写一遍了。



# `eslint.config.mjs` 模板（v9）

2025 更新：
ESLint v9 不再能像以前一样在 Monorepo 的某个子包中单独配置并自动合并，而是必须在根目录统一配置，除非使用旧版的 `.eslintrc` 配置，或使用实验性功能。（参考 [官方文档](https://eslint.org/docs/latest/use/configure/configuration-files#experimental-configuration-file-resolution)，官方表示 v10 开始会提供这种方式）

以下提供的代码均使用 `.mjs` 后缀，因此可以使用 `import` 与 `export`；
如果不使用 `.mjs` 后缀，则需要修改为 `require` 和 `module.exports`。

**注意：ESLint 默认对目录下所有文件进行检查，使用时需要传参数来指定检查范围，例如在 `package.json` 中定义成 `"eslint src"` 或 `"eslint \"./{src,tests}\""` 这种格式；以下配置中的 `files` 仅表示针对某个目录的规则 ”覆盖“，并不是说 `files` 以外的文件就不检查了。**

-----

适用于 TypeScript + React 项目：

```js
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default tsEslint.config(
  // ↓ 需要忽略的目录和文件
  { ignores: ['**/dist'] },

  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,

  // ↓ 项目配置
  {
    files: ['./{src,tests}/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 自己的忽略规则 ...
    },
  },

  eslintPluginPrettierRecommended
)
```

这个规则带有 `prettier` 的格式化检测，以及 React Hooks 名称检测。
注意除了代码中用到的依赖之外，还需要安装 `eslint-config-prettier`。

-----

适用于 TypeScript 库的配置：

```js
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ↓ 需要忽略的目录和文件
  { ignores: ['**/dist'] },

  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,

  // ↓ 项目配置
  {
    files: ['./{src,tests}/**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      // 自己的忽略规则 ...
    },
  },

  eslintPluginPrettierRecommended,
]
```

同上，带有 `prettier` 的格式化检测。
注意除了代码中用到的依赖之外，还需要安装 `eslint-config-prettier`。

-----

适用于 Monorepo 库的配置：

```js
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ↓ 需要忽略的目录和文件
  { ignores: ['**/dist'] },

  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,

  // ↓ 各包通用配置
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // ↓ 以下规则适用于：packages/server
  {
    files: ['packages/server/{src,test}/**/*.ts'],
    plugins: {},
    rules: {
      // 自己的忽略规则 ...
    },
  },

  // ↓ 以下规则适用于：packages/web
  {
    files: ['packages/web/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 自己的忽略规则 ...
    },
  },

  // ↓ 全局忽略规则，如果每个包都要用，可以写在这里
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  eslintPluginPrettierRecommended,
]
```



# `.babelrc` 模板

提供给 babel 的配置，它也会影响最终的代码运行，具体配置项可参考 [官方文档](https://babeljs.io/docs/options)。
**注意：`create-react-app` 项目默认不会读取 `.babelrc`，它会使用自己内部的 babel 配置，除非将项目配置 eject 弹出。**

如果想在 cra 项目中使用自己的 `.babelrc`，建议用 `react-app-rewired` 并配合 `customize-cra` 的 `useBabelRc()` 方法，这样才能读取配置文件。以下模板都会在下文中提供对应的 `react-app-rewired` 的配置方法。

下面是一些常用的 `.babelrc` 配置模板：

对于 antd v4 的项目（**v5 版本不需要任何配置**），请安装 `babel-plugin-import` 后添加：

```json
{
  "plugins": [
    ["import", { "libraryName": "antd", "style": true }]
  ]
}
```

这会开启 antd 的样式按需引入，此时你便可以删掉 `import 'antd/dist/antd.css'` 这一句全局样式导入的代码了。

-----

对于 mui v5 项目，请安装 `babel-plugin-import`，然后添加：

```json
{
  "plugins": [
    ["import", {
      "libraryName": "@mui/material",
      "libraryDirectory": "",
      "camel2DashComponentName": false
    }],

    ["import", {
      "libraryName": "@mui/icons-material",
      "libraryDirectory": "",
      "camel2DashComponentName": false
    }]
  ]
}
```

如果是 v4 版本（也就是 material-ui），则改为：

```json
{
  "plugins": [
    ["import", {
      "libraryName": "@material-ui/core",
      "libraryDirectory": "esm",
      "camel2DashComponentName": false
    }],

    ["import", {
      "libraryName": "@material-ui/icons",
      "libraryDirectory": "esm",
      "camel2DashComponentName": false
    }]
  ]
}
```

-----

使用了 lodash，想要 “按需引入” 其中的函数，请安装 `babel-plugin-lodash`，然后添加：

```json
{
  "plugins": [
    ["lodash"]
  ]
}
```

或者，你也可以使用 `babel-plugin-import` 来配置：

```json
{
  "plugins": [
    ["import", {
      "libraryName": "lodash",
      "libraryDirectory": "",
      "camel2DashComponentName": false
    }]
  ]
}
```

-----

如果使用了 emotion，请安装 `@emotion/babel-plugin` 这个包（以前的版本叫 `babel-plugin-emotion`），然后添加：

```json
{
  "plugins": [
    ["@emotion"]
  ]
}
```

-----

常用配置：移除 `console.log()` 打印日志，请安装 `babel-plugin-transform-remove-console` 后添加：

```json
{
  "plugins": [
    ["transform-remove-console"]
  ]
}
```

-----

> 可以看出，如果插件名以 `babel-plugin-` 前缀开头，那么可以省略这个前缀，只写后面部分的名称；
> 而如果插件名为 `@xxx/babel-plugin`，那么可以省略 `/babel-pulgin` 这个后缀，只写斜杠 `/` 前面部分的名称。
>
> babel 的 preset 也适用于上面这套规则，等同于把单词 `plugin` 换成 `preset`。
>
> 这是因为，babel 内部有一套规则来处理包的名称，可以查看 [文档](https://babeljs.io/docs/options#name-normalization) 来进一步了解。



# `next.config.ts` 模板

基础配置：

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 推荐，生产环境下避免输出 SourceMap 导致泄露源代码
  // 也可以不在这里配置，而是通过 CI/CD 控制避免发布 .map 文件
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  // ...
}

export default nextConfig
```

-----

静态资源放置于 CDN：

```typescript
const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : undefined,
}
```

注意：Next.js 会针对图片来源进行限制，如果网站中存在使用 `Image` 组件且通过属性 `src="https://..."` 直接使用外部图片的情况，需要配置允许的图片来源：

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'https://cdn.example.com' },
      // ...
    ],
  },
}
```

如果用到了外部 `.svg` 图片，还需要进一步配置：

```typescript
const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
  },
}
```

<br />

Next.js 自身具备图片服务器，请求图片时，会根据 `<Image>` 组件的 `width` 和 `height` 属性调整返回的图片尺寸，还会调整图片质量以应对缩略图、懒加载等情况。可参考 [官方文档](https://nextjs.org/docs/app/api-reference/components/image)。

但是，图片如果放置于 CDN 上，此时 Next.js 便无法控制返回的图片。Next.js 提供了 “自定义图片 Loader” 的功能，允许我们提供一个 JS 函数，每当加载图片时，Next.js 会把路径、尺寸、质量作为参数传给函数，函数需返回一个 URL，可以只包含子目录和参数部分，Next.js 会使用这个 URL 来取代原来的 URL。

`next.config.ts` 配置：

```typescript
const nextConfig: NextConfig = {
  images: {
    // 只有在生产环境才生效
    loader: process.env.NODE_ENV === 'production' ? 'custom' : undefined,
    loaderFile: process.env.NODE_ENV === 'production' ? './image-loader.js' : undefined,
  },
}
```

然后是这个 `image-loader.js` 文件，Next.js 官方在 [说明文档](https://nextjs.org/docs/app/api-reference/config/next-config-js/images) 中给出了如 AWS S3、Cloudflare R2 等多种对象存储的配置样例代码，如果你用的是这些云服务提供商，直接复制即可。

此处给出腾讯云 COS 的配置代码：

```typescript
export default function imageLoader({ src, width, quality }) {
  return `${src}?thumbnail/${width}x/quality/${quality || 100}/ignore-error/1`
}
```

此处给出阿里云 OSS 的配置代码：

```typescript
export default function imageLoader({ src, width, quality }) {
  return `${src}?x-oss-process=image/resize,w_${width}/quality,Q_${quality || 100}`
}
```



# `vite.config.ts` 模板

Vite 本身开箱即用，且有非常优秀的中文文档。此处仅给出一些特定需求的配置。

React 项目最简版本：

```typescript
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
```

-----

添加 `@/...` 路径别名：

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

-----

添加开发服务器：

```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

这段配置会把网站的 `http://localhost:3000/api` 转发到 `http://localhost:4000`，并且 “吞掉” 开头的 `/api` 路径；
如果你需要保留 `/api` 路径，删去 `rewrite` 即可。

如果需要在 `0.0.0.0` 开放，在 `server` 下添加 `host: true` 即可。

-----

分析项目的各个模块文件大小：

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), visualizer()],
})
```

-----

启用 Sass（安装 `sass` 或 `sass-embedded`）：

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        // 如果需要给每个文件都加上 Sass 全局变量 ↓
        // additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
})
```

-----

启用 Less（安装 `less`）：

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
        relativeUrls: true,
        javascriptEnabled: true
      },
    },
  }
})
```

-----

在 `vite.config.ts` 中，`.env` 的变量还并没有被注入环境，通过 `process.env` 只能访问到操作系统的环境变量；
如果需要读取 `.env` 的变量，或是判断是开发还是生产，可以这样配置：

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode, command }) => {
  // 值为 "development" 或 "production"
  console.log(mode)
  
  // 值为 "serve" 或 "build"
  console.log(command)
  
  // 这个 env 包含了 .env 文件定义的 "VITE_" 开头的变量
  const env = loadEnv(mode, process.cwd())
  
  return {
    // 配置对象...
  }
})

```

-----

静态放置于 CDN：

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'development' ? '/' : 'https://cdn.example.com/',
  }
})
```

开发环境下和原来一样，生产环境时资源的开头路径全部会替换成 CDN 的网址；
如果网站部署于某个子目录而不是根目录 `/`，也是在这里修改。



# `rollup.config.js` 模板

此处给出的是 npm 包常用的打包编译 Rollup 配置。

适用于浏览器前端开发的打包配置：

```typescript
const terser = require('@rollup/plugin-terser')
const typescript = require('@rollup/plugin-typescript')
const del = require('rollup-plugin-delete')
const { dts } = require('rollup-plugin-dts')

/** @type {import('rollup').RollupOptions} */
module.exports = [
  // 通过 rollup-plugin-delete 工具先提前把 dist 目录清空
  // 通过 rollup-plugin-dts 输出 index.d.ts
  // 因为这个工具可以把所有类型定义合并成一个
  {
    input: 'src/index.ts',
    output: { file: './dist/index.d.ts', format: 'es' },
    plugins: [
      del({ targets: './dist/*' }),
      dts(),
    ],
  },

  // 分别输出 CommonJS 和 ES Module 两种格式的产物
  {
    input: ['src/index.ts'],
    output: [
      { format: 'cjs', file: './dist/index.cjs.js' },
      { format: 'es', file: './dist/index.esm.js' },
    ],
    plugins: [typescript({ declaration: false })],
  },

  // 输出 UMD 格式的产物
  // 注意 UMD 格式必须提供一个全局名称，例如 jQuery 或 $
  // 这样才能在浏览器 <script> 引入时把你的库导入到全局变量
  {
    input: ['src/index.ts'],
    output: {
      format: 'umd',
      file: './dist/index.umd.js',
      name: '<全局名>',
    },
    plugins: [
      typescript({ declaration: false }),
      // UMD 模块已经是最终产物了，打包时直接压缩
      terser(),
    ],
  },
]
```

每一项配置的解释请参考代码中的注释。

注意，如果你用到了某个 CommonJS 导出格式的依赖，那么你需要添加 `@rollup/plugin-commonjs` 插件，下面的代码示例中有这个插件的用法，请参考其中的部分。

> 如果 `rollup-plugin-dts` 在 monorepo 仓库中遇到问题，可以这样配置：
>
> ```typescript
> dts({ compilerOptions: { preserveSymlinks: false } })
> ```

-----

如果你正在为 Vue 开发组件库，而且需要导出 UMD 格式，此时代码中只能通过全局变量来访问 Vue 实例，所以代码必须把 Vue 配置为 “通过全局变量访问的外部依赖”，此时需要这样配置：

```typescript
module.exports = [
  {
    // 添加下面这两行
    external: ['vue'],
    globals: { vue: 'Vue' },

    // 其它配置项 ...
  },
]
```

-----

适用于 Node.js 库的打包配置：

```js
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const typescript = require('@rollup/plugin-typescript')
const { defineConfig } = require('rollup')
const del = require('rollup-plugin-delete')
const { dts } = require('rollup-plugin-dts')

/** @type {import('rollup').RollupOptions} */
module.exports = [
  {
    input: ['src/index.ts'],
    output: { dir: 'dist', format: 'cjs' },
    plugins: [
      del({ targets: './dist/*' }),
      typescript({ declaration: false }),

      // 对于 Node.js 库而言需要把 fs、path 等库排除在外
      // 所以需要 @rollup/plugin-node-resolve 插件
      nodeResolve(),

      // 因为部分包用到了 package.json 或者其他 json，所以配置了此插件
      // 打包 Node.js 库大概率需要用到此插件，但不是一定，你可以尝试去除此插件
      json(),

      // 处理 CommonJS 的导入，因为 Rollup 现在面向 ESM 导入
      // 打包 Node.js 库时这个插件和 @rollup/plugin-node-resolve 通常一同使用
      commonjs(),
    ],
  },

  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
  },
]
```





# Webpack 配置模板

Webpack 的配置较为复杂，我们不会从零开始，往往都是往已有的配置中合并/插入配置项。
具体是通过 Create-React-App 并 Eject 弹出配置，还是通过 CRARO 等工具定制，可以自行选用。

添加路径别名：

```js
module.exports = {
  resolve: {
    alias: {
      '@': 'src/', // 如果 webpack 配置文件在其他目录，可能要用 path.resolve() 来处理路径
    },
  },
}
```

-----

添加 sass 支持，请先安装 `sass` 和 `sass-loader`（这个 `sass` 其实就是 `dart-sass`，它比 `node-sass` 更好），然后添加配置：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        // 直接使用
        use: ['style-loader', 'css-loader', 'sass-loader'],
        
        // 或者，提供配置项
        use: ['style-loader', 'css-loader', {
          loader: 'sass-loader',
          options: {
            additionalData: '@import "~@/styles/global.scss";', // 主题、全局变量文件，注意结尾的分号
            sassOptions: {
              charset: false, // 推荐

              // sass 的配置见：https://sass-lang.com/documentation/js-api/interfaces/options/
              // node-sass 的配置见：https://github.com/sass/node-sass/#options
            }，

            // 默认是用 sass（dart-sass），如果你还是想用 node-sass，请安装它并取消下面一行注释：
            // implementation: require('node-sass'),
          },
            
          // 更多配置见：https://webpack.docschina.org/loaders/sass-loader/#options
        }],
      },
    ],
  },
}
```

请注意：sass-loader 在以前有 `prependData` 配置项，后续在 [v9](https://github.com/webpack-contrib/sass-loader/blob/master/CHANGELOG.md#900-2020-07-02) 版本移除了，改为使用 `additionalData`。

不同于 less 的是，sass 会存在一个问题：它不会重写样式文件中的 `url()` 地址，所以除非你所有的 `url()` 都写死成绝对路径，如果使用相对路径，那么样式文件互相 `import` 或者用 `@mixin` 时便可能会找不到 `url()` 中的资源。

解决上述问题，请安装 `resolve-url-loader`（[文档](https://github.com/bholloway/resolve-url-loader/blob/v5/packages/resolve-url-loader/README.md)），然后修改 webpack 配置：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader', 
          'css-loader',
          // 新增这个 loader
          {
            loader: 'resolve-url-loader',
            options: {},
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true, // 注意，这一行必须有
            },
          }
        ],
      },
    ],
  },
}
```

-----

添加 less 支持，请先安装 `less` 和 `less-loader`，然后添加配置：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        // 直接使用
        use: ['style-loader', 'css-loader', 'less-loader'],

        // 或者，提供配置项：
        use: ['style-loader', 'css-loader', {
          loader: 'less-loader',
          options: {
            additionalData: '@import "~@/styles/global.less";', // 主题、全局变量文件，注意结尾的分号
            lessOptions: {
              globalVars: {}, // 全局变量，追加到每个文件开头位置
              modifyVars: {}, // 覆盖变量，追加到每个文件末尾位置

              // 更多配置见：https://lesscss.org/usage/#less-options
            },

            // 更多配置见：https://webpack.docschina.org/loaders/less-loader/#options
          },
        }]
      }
    ],
  },
}
```

注意：less-loader 在以前有 `prependData`、`appendData` 这两个配置项，后续在 [v7](https://github.com/webpack-contrib/less-loader/blob/master/CHANGELOG.md#700-2020-08-25) 版本移除了，改为使用 `additionalData`。

-----

如果使用 antd v4，可以安装 `antd-dayjs-webpack-plugin` 插件，它可以把 moment.js 替换成 day.js，添加：

```js
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

module.exports = {
  plugins: [
    new AntdDayjsWebpackPlugin()
  ],
};
```

如果不想换 dayjs，也可以安装 `moment-locales-webpack-plugin` 插件，它可以减少 moment.js 的代码包体积，添加：

```js
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')

module.exports = {
  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn']
    })
  ],
};
```

-----

如果想分析 webpack 打包出的代码包的体积，安装 `webpack-bundle-analyzer` 插件后添加以下配置：

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin(),
    // 也可以传入一个对象作为配置项
  ],
};
```

-----

配置 devServer：

```js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://paperplane.cc/api',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  }
};
```

-----

如果有些包不需要在项目中引入，而是使用外部的（例如百度地图 SDK，或者用了 CDN），可以配置外部资源：

```js
module.exports = {
  externals: {
    // 举例：将自外部引入的变量 jQuery 当做新全局变量 $ 来使用
    jQuery: '$',
  },
};
```

-----

有时候需要从项目目录中复制文件到输出的目录，此时需要安装 `copy-webpack-plugin`，添加配置：

```js
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "other", to: "public" },
      ],
    }),
  ],
}
```



# CRA 配置模板

因为 CRA 项目自带了一套 webpack 和 babel 配置，启动指令会使用 `react-scripts`，自带的配置就集成在这个包里面，所以必须使用例如 `react-app-rewired` 或 `craco` 这类工具来替换掉启动指令里面的 `react-scripts`，并提供一份它们约定的配置文件，这样能对 webpack 和 babel 进行定制。

使用 `react-app-rewired` 时，还可以配合 `customize-cra` 一同使用，极大程度减少配置代码量。
**但是需要注意的是，这两个包已经很久没有维护了，现在比较推荐 `craco`。**

-----

使用 `react-app-rewired` 的方法：

- 安装 `react-app-rewired`；

- 首先把 package.json 中 `scripts` 字段里面的 `react-scripts` 替换成 `react-app-rewired`；
- 然后在项目根目录新建一个 `config-overrides.js`，这个文件的导出会用于对项目进行 webpack、babel 的定制。

空模板 `config-overrides.js`（不推荐直接基于此模板）：

```js
module.exports = {
  webpack: function(config, env) {
    return config
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost)
      return config
    };
  },
  paths: function(paths, env) {
    return paths
  },
  jest: function(config) {
    return config
  },
}
```

-----

更推荐的方式是，配合 `customize-cra` 使用，它提供了一系列 API，可以更加方便的对各个配置进行定制。可以查阅 [官方文档](https://github.com/arackaf/customize-cra/blob/master/api.md) 来了解。

这里给出一个空模板 `config-overrides.js`：

```js
const { override, overrideDevServer } = require('customize-cra')

// 完整配置
module.exports = {
  webpack: override(),
  devServer: overrideDevServer(config => {
    return config
  }),
}

// 如果只需要配置 webpack，可以简化为：
module.exports = override()
```

可以理解为，这个 `override()` 方法用于整合用户定制的配置。
实际上，`customize-cra` 提供了大量的 API 用来修改 webpack、babel 等配置。下面会给出各种定制需求的样板代码。

> 这里提一句，`customize-cra` 提供的 API，格式类似于：
>
> ```js
> pluginConfig => ((config: WebpackConfig) => WebpackConfig)
> ```
>
> 这里的 `pluginConfig` 是提供给 API 的配置，返回了一个类似于 “管道” 或者 “tap 操作” 的函数；
> 外层的 `override()` 函数依次把 Webpack 配置应用这些函数进行 “加工”，并使用最终的结果。
>
> 我们也可以自行编写 `customize-cra` 的插件，代码类似于：
>
> ```js
> function myPlugin(pluginConfig) {
>   return config => {
>     // 这个 config 参数就是 webpack 的配置
>     // 可以自行对它进行一些定制操作
> 
>     // ...
>     return config
>   },
> }
> 
> module.exports = {
>   webpack: override(
>     myPlugin,
>     // ... 其他插件
>   ),
> }
> ```
>
> 这里面函数返回一个对 Webpack 配置进行定制的函数即可。

-----

使 `.babelrc` 文件生效，直接使用 `useBabelRc` 这个 API 即可：

```js
const { override, useBabelRc } = require('customize-cra')

module.exports = {
  webpack: override(
    useBabelRc(),
  ),
}
```

-----

使用 `fixBabelImports()` 可以快速配置 `babel-plugin-import` 插件，记得提前安装它。下面是示例：

对于 antd v4 的项目配置样式的按需引入：

```js
const { override, fixBabelImports } = require('customize-cra')

module.exports = {
  webpack: override(
    fixBabelImports('import', { libraryName: 'antd', style: true }),
  ),
}
```

对于 mui 项目，配置样式的按需引入：

```js
const { override, fixBabelImports } = require('customize-cra')

module.exports = {
  webpack: override(
    fixBabelImports('mui-core', {
      libraryName: '@mui/material',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),

    fixBabelImports('mui-icons', {
      libraryName: '@mui/icons-material',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),
  ),
}
```

-----

使用 `addBabelPlugins()` 可以快速添加 babel 插件。下面是示例：

```js
const { override, addBabelPlugins } = require('customize-cra')

module.exports = {
  webpack: override(
    // 已安装 @emotion/babel-plugin
    addBabelPlugins(['@emotion']),
      
    // 已安装 lodash-babel-plugin
    addBabelPlugin(['lodash']),
  ),
}
```

-----

可以使用 `addWebpackAlias()` 来快速添加 webpack 的别名：

```js
const { override, addWebpackAlias } = require('customize-cra')

module.exports = {
  webpack: override(
    addWebpackAlias({ 
      '@': 'src/',
    }),
  ),
}
```

-----

可以使用 `addWebpackModuleRule()` 来配置 webpack 的 loader：

这是 sass 的配置模板：

```js
const { override, addWebpackModuleRule } = require('customize-cra')

module.exports = {
  webpack: override(
    addWebpackModuleRule({
      test: /\.s[ac]ss$/i,
      use: ['style-loader', 'css-loader', {
          loader: 'sass-loader',
          options: {
            additionalData: '@import "~@/styles/global.scss";',
          },
      }],
    })
  ),
}
```

这是 less 的配置模板：

```js
const { override, addWebpackModuleRule } = require('customize-cra')

module.exports = {
  webpack: override(
    addWebpackModuleRule({
      test: /\.less$/i,
      use: ['style-loader', 'less-loader', {
          loader: 'less-loader',
          options: {
            additionalData: '@import "~@/styles/global.less";',
          },
      }],
    })
  ),
}
```

> 如果是**早期**的 `less-loader` 版本，还可以使用 `addLessLoader()` 这个 API 来快速配置 less：
>
> ```js
> const { override, addLessLoader } = require('customize-cra')
> 
> module.exports = {
>   webpack: override(
>     addLessLoader({
>       additionalData: '@import "~@/styles/global.less";',
>       lessOptions: {
>         globalVars: {},
>         modifyVars: {},
>       },
>     }),
>   ),
> }
> ```
>
> **注意，这个 API 内部做了一些配置，和近期版本的 less-loader 不兼容，新版本已经无法使用了，因此不推荐这个 API。**

-----

可以使用 `addWebpackPlugin()` 来快速配置 webpack 插件。

这里给出 `antd-dayjs-webpack-plugin` 和 `copy-webpack-plugin` 两个插件的配置方式作为示例，记得事先安装它们：

```js
const { override, addWebpackPlugin } = require('customize-cra')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  webpack: override(
    addWebpackPlugin(new AntdDayjsWebpackPlugin()),

    addWebpackPlugin(new CopyPlugin({
      patterns: [
        { from: "other", to: "public" },
      ],
    })),
  ),
}
```

如果是 `webpack-bundle-analyzer` 插件，可以使用 `addBundleVisualizer` 来快速配置：

```js
const { override, addBundleVisualizer } = require('customize-cra')

module.exports = {
  webpack: override(
    addBundleVisualizer({
      // 这里的配置会直接传给 webpack-bundle-analyzer 的构造函数
    }),
  ),
}
```

-----

可以使用 `overrideDevServer()` 来快速配置 devServer，注意写法有所不同：

```js
const { override, overrideDevServer } = require('customize-cra')

module.exports = {
  devServer: overrideDevServer(devServerConfig => ({
    ...devServerConfig,
    proxy: {
      '/api': {
        target: 'https://paperplane.cc/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  })),
}
```

-----

可以使用 `addWebpackExternals()` 来快速配置外部依赖：

```js
const { override, addWebpackExternals } = require('customize-cra')

module.exports = {
  webpack: override(
    addWebpackExternals({
      jQuery: '$',
    }),
  ),
}
```



# `tailwind.config.js` 模版

**注意：TailwindCSS 从 v4 版本开始已经默认不再自动读取配置文件，即使提供此文件，也可能不会生效；如果你仍想使用配置文件，请参考 [官方文档](https://tailwindcss.com/docs/functions-and-directives#config-directive)，使用 `@config` 字段开启配置文件。**

v4 版本开启配置文件的语法：

```css
@config "../../tailwind.config.js";
```

-----

v4 版本请安装 `tailwindcss`、`@tailwindcss/postcss` 和 `postcss`；
v3 版本则安装 `tailwindcss`、`postcss` 和 `autoprefixer`；
建议先参考下一章节的内容，配置好 `postcss`，然后再来配置 `tailwindcss`。

创建文件 `tailwind.config.js`，写入以下内容：

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

然后，在 CSS 目录中创建一个 `tailwind.css` 文件（不推荐用 `.less` 或 `.scss` 后缀）；
**v3 版本** 写入以下内容：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**v4 版本** 写入以下内容：

```css
@import "tailwindcss";
```

或者，可以更精细地 “分层” 引入，这样可以使用自定义主题并调整优先级：

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
```

然后，在项目中导入这个 CSS 文件即可。

-----

此外，推荐安装 `prettier-plugin-tailwindcss` 插件，它可以在格式化代码时，自动对类名进行排序。
安装后，请修改 `prettier` 的配置文件，添加：

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
}
```

-----

注意，Tailwindcss 自带了一套 CSS 重置规则。如果你使用类似 `mui` 等自带全局 CSS 的工具，则可以关闭这一套默认规则：

**v3 版本** 在 `tailwindcss.config.js` 中配置：

```js
module.exports = {
  // ...
  corePlugins: {
    preflight: false,
  },
}
```

**v4 版本** 则需要修改 `tailwind.css` 文件：

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

这里删掉了 `@import "tailwindcss/preflight.css" layer(base);` 这一行。



# `postcss.config.js` 模板

根据安装的工具插件不同，添加键进行配置即可。

```js
/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    autoprefixer: {},
    // 其它插件 ...
  },
}
```

-----

集成 TailwindCSS 配置： 

```js
/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // tailwindcss v4 
    '@tailwindcss/postcss': {},
    // tailwindcss v3
    tailwindcss: {},

    // 其它插件 ...
  },
}
```

代码中给出了 v4 和 v3 两种配置，根据你使用的版本来选择一个。



# monorepo 配置模板

本 monorepo 配置模板基于 `pnpm` 和 `lerna` 这两个工具。

首先，对 `package.json` 进行配置，只允许使用 `pnpm` ，并且开启 `workspace` 工作区支持：

```json
{
  "packageManager": "pnpm@<版本号>",
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  },
  "workspaces": [
    "./packages/*"
  ]
}
```

然后，项目根目录新建一个 `pnpm-workspace.yaml` 文件，配置 `pnpm` 的工作区：

```yaml
packages:
  - 'packages/*'
```

最后，项目根目录新建一个 `lerna.json` 文件，提供 `lerna` 的配置：

```json
{
  "lerna": "2.2.0",
  "version": "independent",
  "packages": ["packages/*"],
  "npmClient": "pnpm"
}
```

这里的 `version` 可以设置成 `"independent"`，也可以设置成一个固定的版本号。
如果设定成固定的版本号，使用 `lerna publish` 发布包时会交互式询问新版本号是多少，然后 `lerna` 会自动更新这里的 `version`，并进行提交代码、打 git 标签、发布 npm 等一系列操作。
