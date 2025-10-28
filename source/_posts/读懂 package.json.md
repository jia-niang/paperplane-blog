---
title: 读懂 package.json
date: 2023-03-14 17:54:43
tags:
- Node
- npm
- Cheatsheet
categories: 
- JS
---

`package.json` 记录依赖项、运行脚本等信息；但是对于开发者而言，有两种情况：

- 前端或 Node.js 项目，此时 `package.json` 记录依赖项、运行脚本，并可能给其他工具（如 Prettier）提供配置；
- 发布到 npm 的包，此时 `packaage.json` 便变得非常重要，它需要记录依赖项、包名、版本号，还需要提供一系列描述以在 npm 上提供 SEO 优化，还可以标注开源许可、源码仓库、包作者等信息。

这里用 `antd@4.6.1` 来举例，我们分析这个库的 `package.json` 文件（原文件过于冗长，经过了一些删减）：

```json
{
  "name": "antd",
  "version": "4.6.1",
  "description": "An enterprise-class UI design language and React components implementation",
  "title": "Ant Design",
  "keywords": ["ant"],
  "homepage": "https://ant.design/",
  "bugs": {
    "url": "https://github.com/ant-design/ant-design/issues"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/ant-design/ant-design"
  },
  "license": "MIT",
  "contributors": ["ant"],
  "funding": {
    "type": "opencollective",
    "url": "https://opencollective.com/ant-design"
  },
  "files": ["dist", "lib", "es"],
  "sideEffects": ["dist/*", "es/**/style/*", "lib/**/style/*", "*.less"],
  "main": "lib/index.js",
  "module": "es/index.js",
  "unpkg": "dist/antd.min.js",
  "typings": "lib/index.d.ts",
  "scripts": {
    "build": "npm run compile && NODE_OPTIONS='--max-old-space-size=4096' npm run dist"
  },
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  },
  "browserslist": ["last 2 versions", "Firefox ESR", "> 1%", "ie >= 11"],
  "dependencies": {
    "moment": "^2.25.3"
  },
  "devDependencies": {
    "typescript": "~4.0.0"
  },
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```

其实这些字段大部分都是有用的。耐心看完本文，你对 `package.json` 的理解将更上一层楼。



# 包信息

这部分字段标识了包的名称、版本等信息。

其中包的名称、版本号可以认为是最重要的部分之一；而还有例如简介、关键词、主页等字段则是无关紧要，主要起到 SEO 和描述作用。

<br />

这里给出一个示例：

```json
{
  "name": "my-lib",
  "private": true,
  "version": "1.2.3",

  "title": "我是包的标题，可以随便写点啥",
  "description": "我是包的描述，可以随便写点啥",
  "keywords": ["关键词1", "关键词2"],
  "homepage": "https://paperplane.cc/",
  "bugs": {
    "url": "https://git.paperplane.cc/jia-niang/paperplane-blog/issues"
  },
  "repository": {
    "type": "git",
    "url": "https://git.paperplane.cc/jia-niang/paperplane-blog"
  },
  "license": "MIT",
  "contributors": ["Frank Pu <1@paperplane.cc> (https://paperplane.cc/)"]
}
```



## 元信息

**`name` 字段：**包的名称。

作为 npm 包来发布时，这个名字需要好好考虑避免重名或者歧义，重名的包是无法发布的；虽然包名允许下划线 `_` 、英文句点 `.`、大写字母，但是强烈不推荐使用这些符号，如果要分词请尽量只使用横杠 `-`。

-----

**`private` 字段：**包是否为私有，可以避免包被不小心发布出去。
如果项目不需作为 npm 库发布，直接设为 `true` 即可。

-----

**`version` 字段：**包的版本号。

npm 上的包一般使用语义化版本，版本号可以分为三段：`major`.`minor`.`patch`，可以这么理解：`主要版本.次要版本.补丁版本`；版本号后面还可以接上一些标签，例如 `1.2.3-alpha`。

这里简单介绍一下语义化版本：

- `patch` 版本号的变更应只包含 bug 修复；
- `minor` 版本号的变更可以包含功能的增加，但需做到向前兼容；
- `major` 版本号的变更可以包含破坏性的改动，可以不兼容以前的版本。

**此外，如果一个库认为自己未完成开发，功能暂不稳定，那么版本号会以 `0.` 开头，此时主版本号、次版本号等都要从 `0` 后面的数字开始算。**

例如版本号为 `0.1.2`，此时 `major` 版本号应该为 `1`（而不是 `0`），而 `minor` 版本号为 `2`。
简单来说就是 “开头的 `0` 不算”。

> 使用 `0.` 开头表示未正式完成的版本，这是约定成俗的做法。例如 `react` 的版本号，在过去的很多年，一直处于 “未完成” 的状态，最后一个版本号是 `0.14.8`，然后开发人员终于认为这个项目 “完成” 了，正式版第一个版本号就直接是 `15.0.0` 了。

另外如果你对项目里的版本号的对比、判断等操作有需求，这里推荐 [semver](https://www.npmjs.com/package/semver) 这个库。



## 模块化方式 `type` 字段

此字段标识当前项目或这个 npm 包的模块化系统。
`type` 字段的取值为 `"commonjs"` （默认）或 `"module"`，分别表示是 CommonJS 还是 ES Module 模块化系统。

对于前端或 Node.js 项目而言，如果你想**原生**使用 `import`、`export`，那么需要把 `package.json` 配置为 `"type": "module"`，否则代码会直接报错。

对于 npm 包而言，此字段表明此包使用的模块化方案，也就是 `main` 的入口文件的模块化方式。现在很多包都逐渐开始只提供 ES Module 了。
如果你的 npm 包仍然想兼容 CommonJS，那么建议像上一章节中 `antd` 的做法一样，打包时就提前准备好两种模块化文件，通过 `main` 和 `module` 字段分别对外暴露。

值得注意的是，`.mjs` 后缀的文件始终会被当做 ES Module 模块，而 `.cjs` 后缀的文件始终会被当做 CommonJS 模块。



## SEO 描述类信息

**其它字段：**用于 npm 上的 SEO 和展示信息。

例如 `bugs` 和 `repository` 一般指向代码仓库；`license` 标识包的开源许可；`contributors` 可以把作者姓名和联系方式展示出来。其他字段此处不做赘述。

> 虽然其它字段一般不会被程序化读取，可以写的比较自由一些，但有些工具还是可能会读取的。
>
> 比如 `create-react-app` 创建的项目，它会自动读取 `homepage` 字段中的子路径来作为网站的子路径（subpath），并注入到 `process.env.PUBLIC_URL` 这个环境变量里。
>
> 例如，设置了 `homepage: "https://example.com/subpath"`，那么 `process.env.PUBLIC_URL` 的值便等于 `/subpath`。



# 主文件/入口文件

npm 包提供了这个字段并指向一个代码文件，使用方才能导入代码并使用。前端网站或 Node.js 项目则不需要这个字段。

曾经，包的入口只需要一个 `main` 字段即可；但现在经过前端工具多年的进化迭代，包通常会提供多个入口，以供不同的工具按需使用。
以 `antd` 举例：

```json
{
  "main": "lib/index.js",
  "module": "es/index.js",
  "jsnext:main": "es/index.js",
  "unpkg": "dist/antd.min.js",
  "typings": "lib/index.d.ts",
  "sideEffects": ["dist/*", "es/**/style/*", "lib/**/style/*", "*.less"]
}
```

`antd` 提供的入口字段比较完整，以下是这些字段的介绍：

<br />

**`main` 字段：**
使用 CommonJS 方式加载包时入口文件的相对路径。

**`module` 字段：**
使用 ES Module 方式加载包时入口文件的相对路径；使用这种方式加载的包支持 [TreeShaking](https://webpack.docschina.org/guides/tree-shaking/)。

**`jsnext:main` 字段：**
曾经的 ES Module 方式加载包时入口文件的相对路径，现已被 `module` 字段取代；
如果你的包需要兼容老项目，建议还是保留此字段。

**`typings` 字段：**
如果这个包自身带有 TypeScript 类型定义，此字段为类型定义的 .d.ts 入口文件。

<br />

如果你的包发布到 npm 上，并提供了 UMD 格式的代码，可以使用以下字段：

**`unpkg` 字段、`jsdelivr` 字段：**
提供给第三方 CDN，他们会收录你的包并以这个字段指定的文件作为 UMD 入口文件。

我们以 [`ramda`](https://www.npmjs.com/package/ramda) 这个包举例，它的 `package.json` 是这样配置的：

```json
{
  "unpkg": "dist/ramda.min.js",
  "jsdelivr": "dist/ramda.min.js"
}
```

此时，我们可以使用 UNPKG CDN 来使用它：`https://unpkg.com/ramda`；
在浏览器输入这个 URL 后，会自动跳转为 `https://unpkg.com/ramda@<最新版本号>/dist/ramda.min.js`，与这个字段配置的路径一样。

同样的，JSDelivr 的 URL 是这样的：`https://cdn.jsdelivr.net/npm/ramda`，只不过它是直接显示 `dist/ramda.min.js` 文件的内容个，而不会发生跳转。

如果你的包提供 UMD 版本，建议配置这两个字段，这样方便其他用户使用 `<script>` 的方式直接使用 CDN 来加载。

<br />

**`sideEffects` 字段：**
只对 Webpack 之类的打包工具有用，此字段（支持布尔值、字符串、数组）用于指定有副作用的文件，这样在 TreeShaking 时就不会把这些带有副作用的文件给删掉了。

这个字段可以设置为以下值：

-  `true` （也是默认的情况） 表示所有文件都有副作用；
- `false` 表示所有文件都无副作用；
-  一个字符串数组，数组中列出了有副作用的文件列表，支持 glob 通配符；
   对于这些带有副作用的文件，TreeShaking 时不会从它们中删去任何代码。

我们还是以 `antd` 为例：

```json
{
  "sideEffects": ["dist/*", "es/**/style/*", "lib/**/style/*", "*.less"]
}
```

可以看到，它把 UMD 文件、所有样式文件都配置为了有副作用。

我们使用样式文件时通常会这么写：`import './index.css'`，这可能会导致样式文件被 TreeShaking 当做没有用到的模块而删掉，因为样式文件本身没有导出任何函数；

所以对于包含 CSS 文件的 UI 组件库而言，这些样式文件一定要包含在这个字段中，因为样式文件永远是 “有副作用的”。而对于使用 CSS-In-JS 的 UI 组件库而言就不需要这么写了，因为没有单独的 CSS 文件。

> 通过 `create-react-app` 创建的项目，其 Webpack 配置已经帮我们做了一些 `sideEffects` 的配置，所以我们在自己的代码中引入 CSS 文件都能正确生效。
>
> 你可以把配置 Eject 出来，搜索 `sideEffects` 字段便可以找到，可以自己测试一下。
>
> -----
>
> 思考一下：
> 如果某个 polyfill 库（例如 `core-js`）的 `package.json` 的 `sideEffects` 被设置为了 `false`，会发生什么情况？
>
> polyfill 库通常都是在项目入口处直接引入的，例如：
>
> ```js
> import 'core-js'
> ```
>
> 如果这类库的 `sideEffects` 被配置为了 `false`，那么 TreeShaking 会认为这个库未被使用，直接把这些代码删掉，导致功能失效。



# 现代化入口字段  `exports`

这个字段是 Node.js 提供的支持，所以 npm 文档中未提及。可以点击查看 [Node.js 相关文档](https://nodejs.org/api/packages.html#package-entry-points)，或在 [这篇文章](https://hirok.io/posts/package-json-exports) 进行进一步了解。

原本 npm 包只能通过 `main` 对外暴露一个导出，最多再加一个 `module`，这逐渐无法满足现在的需求；
而 `exports` 便是一个更先进的导出配置，它支持多个导出端点，可以为每个导出端点分别指定 CJS 和 ESM 甚至 UMD 入口文件，甚至还能根据开发/生产环境进行分别区分。

首先，只要 Node.js 版本支持，`exports` 的优先级会覆盖 `main`；尽管如此，还是建议提供一个用于 fallback 的 `main` 字段。

这里以 `vue` 的 `package.json` 举例（经过简化）：

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/vue.d.mts",
        "node": "./index.mjs",
        "default": "./dist/vue.runtime.esm-bundler.js"
      },
      "require": {
        "types": "./dist/vue.d.ts",
        "node": {
          "production": "./dist/vue.cjs.prod.js",
          "development": "./dist/vue.cjs.js",
          "default": "./index.js"
        },
        "default": "./index.js"
      }
    },
    "./compiler-sfc": {
      "import": {
        "types": "./compiler-sfc/index.d.mts",
        "browser": "./compiler-sfc/index.browser.mjs",
        "default": "./compiler-sfc/index.mjs"
      },
      "require": {
        "types": "./compiler-sfc/index.d.ts",
        "browser": "./compiler-sfc/index.browser.js",
        "default": "./compiler-sfc/index.js"
      }
    },
    "./jsx-runtime": {
      "types": "./jsx-runtime/index.d.ts",
      "import": "./jsx-runtime/index.mjs",
      "require": "./jsx-runtime/index.js"
    },
    "./jsx": "./jsx.d.ts",
    "./dist/*": "./dist/*",
    "./package.json": "./package.json"
  }
}
```

可以看出，这个 `exports` 字段的功能非常强大，对 npm 包的导出做出了非常精细的区分。

<br />

首先，这个 `exports` 字段的格式可以是对象或字符串；如果是对象，它的键名可以区分导入时候的子目录，以提供不同的文件入口。

例如，下面这两种导入方式：

```typescript
import lib1 from 'my-package'
import lib2 from 'my-package/sub-path'
```

分别匹配了 `exports` 对象中的字段：

```json
{
  "name": "my-package",
  "exports": {
    ".": "index.js",
    "./sub-path": "something.js" 
  }
}
```

这里包名本身就是 `.` 键，其它子路径的键必须写成 `./` 开头的相对路径，这是强制的。

使用 `exports` 字段的包，导入时子路径必须和其中的某个键匹配，如果没有任何键匹配，那么 Node.js 会直接报错；
不过，`exports` 也支持星号 `*` 作为通配符，所以如果你的包要导出大量子路径，可以直接使用通配符，而不是挨个加到 `exports` 字段，例如上述 Vue 例子中的 `./dist/*`。

> Node.js 在根据子目录选择键时，会命中最具体匹配的劲键，如果多项的具体程度相同，则优先命中最靠前的。

<br />

然后，每一项导出，除了直接用字符串指定为文件外，还支持配置成一个对象，让 Node.js 或工具链根据具体需求，选择应需要的入口文件。

这里列出几个常用的字段名（非全部）：

- `require`，表示 CommonJS 格式的导出，可看作是 `main` 字段；
- `import`，表示 ES Module 格式的导出，可看作是 `module` 字段；
- `node`，表示为 Node.js 准备的导出， 一般用不到这个字段；
- `default`，官方文档建议提供的备选导出，应放置在最末位。

以上字段是 Node.js 原生支持的，但 Vite、Webpack 等工具往往支持更多的字段，下面列出一些工具链常用的字段：

- `development` 和 `production`，特指开发或生产环境下生效；
- `browser`，浏览器可使用的格式，例如 IIFE 或 UMD 格式；
- `types`，为这个导出提供 `.d.ts` 类型定义。

上面的所有字段，都可以互相嵌套形成组合条件，工具会根据具体情形选择对应的文件，可以参考上面 Vue 的示例。



# 依赖项

这些字段也是我们熟悉的，每个项目都离不开这些配置，否则可能根本无法运行。
常见的依赖字段：

```json
{
  "dependencies": {
    "lodash": "^4.17.20",
    "typescript": "~4.0.0"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.139",
    "eslint": "^7.3.1"
  },
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0"
  }
}
```

这里可以看到版本规则有的是 `^` 开头，有的是 `~` 开头，甚至还有 `>=` 符号，这便是版本号的约束语法。



## 版本号约束

常见的版本号约束有以下几种格式：

- 完全指定版本，格式形如：`1.2.3` 或 `1.2.3-bete` 或 `tag-1.0.0`，固定安装依赖包的这个版本；
  一般来说，例如 `prettier`、编译构建插件、私有业务库之类的对版本极其敏感的依赖包推荐使用这种格式；
- “兼容版本”，用 `^` 前缀表示，它表示仅固定主要版本号，次要版本开始允许更高的版本；
  例如：`^1.2.3` 这种写法表示接受大于等于 `1.2.3` 的版本号，等同于 `>=1.2.3 <2.0.0`；
  这也是 npm 安装依赖时默认采取的版本锁定策略，安装某个包会把它的最新版本号用 `^` 开头记录在 `package.json` 中；
- “近似版本”，用 `~` 前缀表示，它会固定版本号的前两位，第三位允许更高的版本；
  例如 `~1.2.3` 这种写法等同于 `>=1.2.3 <1.3.0`，也可以看做是  `1.2.A` 而 `A>=3`；
  例如 `~1.2` 这种写法则等同于 `1.2.x`；
- 带有大于小于号的版本约束：
  例如 `>1.2.3` 或 `<=1.2.3`。

**上面的  “兼容版本” 和 “近似版本” 约束需要注意：如果某个依赖项版本号以 `0.` 开头，此时 `^` 便固定的是前两位，`~` 也是固定前两位。**

下面几种版本号约束也支持，但是不常用：

- 任意版本 `*`，接受任意版本；
- 带有 `x` 的版本号：
  例如 `1.2.x` 表示固定前两位，第三位任意；`1.x` 表示只固定第一位版本号，后面的任意；
- 带有横杠 `-` 的版本区间：
  例如 `1.2.3 - 1.2.5`。

以上的版本号写法支持联合：

- 用空格表示 “且”，例如 `>=1.2.3 <1.2.8` 或 `^1.2.3 <1.4.3`；
- 用 `||` 表示 “或”，例如 `<=1.0.0 || >=3.0.0` 或 `^1.0.0 || ^2.0.0`。

当然，有的依赖后面接的可能不是版本号约束，而是直接提供 URL，甚至本地文件链接，这种情况都表示依赖项不在 npm 上，此处就不做赘述了。



## 依赖字段

几个依赖字段，也是有区别的：

**`dependencies` 字段：**
运行期间所需的依赖包。

对于 npm 包而言，这些依赖是必要的，因此用户安装此包时，也会把这些依赖项一同安装。

<br />

**`devDependencies` 字段：**
开发期间所需的依赖包。

它的逻辑是这样的：

- 在当前项目中，通过 `npm add -D` 这种带有 `-D` 参数添加的依赖，会被放到这个字段下；
- 在当前项目中，运行 `npm i` 安装依赖时，`devDependencies` 的依赖项也会一同安装；
  如果不想安装这部分依赖，可以添加 `--only=prod` 参数；
- 这个包被发布到 npm 后，用户安装这个包时，不会自动安装 `devDependencies` 下的依赖。

可以看出，这个字段更多的情况下是为 npm 包而设计的；如果你正在开发前端或 Node.js 项目，其实区分 `dependencies` 和 `devDependencies` 的意义并不大，因为源码克隆到本地后运行 `npm i`，这两部分的依赖都会被安装。

<br />

如果你的项目是作为 npm 包发布的，推荐做法：

- 将项目中用到的依赖放到 `dependencies`；
  例如 `antd` 用到了 `moment` 和 `lodash`，所以必须有这两个依赖包，否则运行时会报错；
- 只在开发过程中需要用的依赖，例如 `eslint` 和 `prettier` 这种源码处理工具，以及 `@types/*` 这种 TypeScript 类型定义文件，以及 `typescript` 和 `rollup` 这种编译打包工具，都放在 `devDependencies`，因为只有包的开发维护人员需要用到这些，对使用者而言不需要这些依赖的。

<br />

如果你的项目是作为前端网站项目或 Node.js 项目，可以把所有依赖都放到 `dependencies`，这也是常见做法；
当然，也可以换一种思路，把 CI/CD 时不需要用到的包移出放置在 `devDependencies`，然后 CI/CD 的时候运行 `npm i --only=prod`，这样可以减小 CI/CD 期间的网络消耗，加快速度。

-----

**`peerDependencies` 字段：**
它表示 “对等依赖”，一般只有发布到 npm 包才用得到这个字段，而且往往是 “插件” 或者 “UI 组件库” 这种基于某个工具而开发的包。

对等依赖的含义是：
**例如我要为 `react` 开发一个组件库，那么我不能把 `react` 作为项目的依赖，而是要认为这个组件库的使用者已经安装好了 `react`，所以需要把 `react` 作为项目的 “对等依赖” 添加到 `peerDependencies` 字段。**

也正因如此，对等依赖项目的版本号会写成 `>` 或 `>=` 的格式，以最大限度宽限版本号，例如写成 `"react": ">=16.9.0"`。

包的使用者运行 `npm add` 安装这个包时，不会主动安装对等依赖项，但是在安装了所有依赖后判断 `peerDependencies`  中的对等依赖是否已满足，如果未满足（例如缺失或是版本号不符），那么 npm 会在控制台打印出警告。

> 有一种做法是这样：如果打包工具支持配置 `externals` 也就是 “外部依赖”（例如 `rollup` 就支持），那么可以将 `peerDependencies` 的依赖作为外部依赖。

<br />
**`peerDependenciesMeta` 字段：**
它是对 `peerDependencies` 的补充说明，一定要配合 `peerDependencies` 来使用，它的格式是这样：

```json
{
  "peerDependencies": {
    "mylib": "1.2"
  },
  "peerDependenciesMeta": {
    "mylib": {
      "optional": true
    }
  }
}
```

如果只提供 `peerDependencies`，那么当使用者安装依赖后本地找不到 `mylib`，则 npm 会打印警告，使用上述的配置加一个 `optional: true` 便标志了 `mylib` 这一项对等依赖是 “可选” 的，即使没有安装它，npm 也不会打印警告。



# 命令/脚本

继续以 `antd` 来举例，此处给出片段：

```json
{
  "scripts": {
    "build": "npm run compile && NODE_OPTIONS='--max-old-space-size=4096' npm run dist",
    "deploy": "bisheng gh-pages --push-only --dotfiles",
    "dist": "antd-tools run dist",
    "lint": "npm run tsc && npm run lint:script && npm run lint:demo && npm run lint:style && npm run lint:deps && npm run lint:md",
    "start": "antd-tools run clean && cross-env NODE_ENV=development concurrently \"npm run color-less\" \"bisheng start -c ./site/bisheng.config.js\"",
    "test": "jest --config .jest.js --no-cache"
  }
}
```

字段 `scripts` 中可以记录项目的各个脚本，例如启动项目、编译项目、运行单元测试等；
主要是方便我们快速运行，不用每次都打一长串命令。

<br />

注意，使用 `npm run` 运行脚本和直接在命令行打出脚本运行，还是有些区别的。

例如：`"dist": "antd-tools run dist"` 这一段，如果我们正确安装了所有依赖，那么执行 `yarn dist` 肯定可以开始编译，但是执行 `antd-tools run dist` 却可能报错 “找不到 `antd-tools`”，此时改为 `npm run antd-tools run dist` 或者 `npx antd-tools run dist` 即可正常运行；
因为如果 `antd-tools` 这个包不是全局安装的，那么操作系统是找不到它的启动位置的，而使用 `npm run` 或者 `npx` 运行指令则会尝试从当前目录中的 `node_modules` 中寻找。



## 脚本的 pre 和 post 逻辑

npm 运行脚本时，可能在运行之前/之后触发对应的脚本，具体规则如下：

- 在执行当前的脚本前，会尝试在这个脚本名前加 `pre` 前缀并查找这个脚本，如果有则会先执行；
- 当前脚本执行结束后，尝试在这个脚本名前加 `post` 前缀并查找这个脚本，如果有则会执行。

例如，你定义了某个脚本 `dosomething`，那么你输入 `npm run dosomething` 按下回车键，npm 会先尝试找到 `predosomething` 脚本去提前执行，然后执行你的 `dosomething`，最后再去尝试找到 `postdosomething` 脚本去执行。



## npm 生命周期脚本

一部分脚本名称比较特殊，它们会在包或者包的依赖项被安装、卸载或发布等动作时自动运行，可以用做预编译、清理等工作。

可以查看 [官方文档](https://docs.npmjs.com/cli/v8/using-npm/scripts) 来进一步了解这些 npm 脚本知识。
如果你觉得 npm 自身的这方面功能不够强大，可以使用 [`wireit`](https://www.npmjs.com/package/wireit) 这个工具，对其进行增强和扩展。

<br />

对于 本地 Node.js 项目 而言，在项目中运行一些命令时，会触发这些脚本（只列出常用的）：

**`prepare`：**
在执行 `npm i` 安装依赖、`npm publish` 发布、`npm ci`、`npm pack` 等大部分涉及到源码变动和上传的操作都会触发这个脚本；
最常见的 `prepare` 是 `husky` 初始化；

**`prepublishOnly`：**
仅会在执行 `npm publish` 之前运行，通常用于发布前进行一些编译、检查；
注意，因为历史错误原因，`prepublish` 并不会在 `npm publish` 时触发，而是在 `npm i` 和 `npm ci` 期间触发，所以它已被废弃；

**`install`、`preinstall` 和 `postinstall`：**
通过 `npm i` 安装依赖时会触发 `install`，这个脚本很少使用，更多用的是 `preinstall`；
最常见的 `preinstall` 是 `npx only-allow pnpm`，它可以在安装前检查当前工具，用来强制使用 pnpm；

**`prepack` 和 `postpack`：**
生成代码包前、后会触发，可以用于计算哈希值等操作，`npm pack` 和 `npm publish` 命令会生成代码包。

<br />

此外，部分 npm 命令也会触发一个或多个脚本：

- 例如 `npm ci` 会触发 `install` 和 `prepare` 脚本，以及这两个脚本对应的 `pre` 和 `post` 前缀版本；
- 而 `npm diff` 只会触发 `prepare` 脚本，而不会触发它的 `pre` 和 `post` 前缀版本；
- 还有更多命令，也会触发这些脚本，建议参考 [官方文档](https://docs.npmjs.com/cli/v7/using-npm/scripts#life-cycle-operation-order)。

-----

如果你的项目要作为 npm 包发布，那么 **对于安装这个包的用户而言**，用户在安装时，会触发这些脚本：

**`postinstall`：**
包被用户安装后，会在用户的电脑上运行。

例如 `puppeteer`、`node-sass` 这类需要在用户电脑上安装二进制文件的包，会配置这个脚本，用户安装包之后，运行其中的代码下载一些文件。



# 发布 npm 包需要的字段

如果你的项目是要发布到 npm 上的包，那么这些字段你可能需要用到：

<br />

**`files` 字段：**
标识哪些文件会被打包上传，避免无关紧要的文件也被上传上去，格式为字符串或字符串数组，使用 glob 通配符。

这里给出一个示例：

```json
{
  "files": [
    "dist/",
    "es/",
    "lib/",
    "index.d.ts"
  ]
}
```

注意，即使没有列出，`package.json`、`README`、`LICENSE` 以及 `main` 字段指定的文件等一定会被上传；
而 `.git` 目录、`.DS_Store`、`.npmrc` 以及其它一些文件则一定不会被上传。

你可以理解为 npm 内置了一套优先级最高的黑白名单。

-----

**`bin` 字段：**
如果你发布的包是一个 CLI 工具，那么需要通过 `bin` 字段指定命令行运行时的入口文件。

我们以 `create-react-app` 这个 CLI 工具举例，它的配置如下：

```json
{
  "bin": {
    "create-react-app": "./index.js"
  }
}
```

这里的 `bin` 字段就指定了命令行工具的名称，并给出了运行时的文件。
值得注意的是，这个字段支持对象格式，也就是说一个包可以注册多个命令，只需要给这个对象添加几个键值对即可。

如果这个包注册的命令名称和包名完全一样，那么 `bin` 字段可以直接简化成字符串；
例如上面这个 `create-react-app` 就可以简化为：

```json
{
  "bin": "./index.js"
}
```

用户如果全局安装这个包，npm 会在用户系统的 `PATH` 环境变量中注册 `create-react-app` 这个命令，这样在任何地方都可以通过这个命令来调用这个工具。

<br />

注意 `bin` 指向的 JS 文件，第一行必须是以下内容：

```bash
#!/usr/bin/env node
```

如果没有这一行，那么这个 JS 将不会被 Node.js 运行而是直接被操作系统当做 Shell 运行，肯定会报错。

-----

**`publishConfig` 字段：**
是一个对象，在开发阶段它不起任何作用，只有在发布 npm 包时，这里面的字段才会生效（优先级比命令行参数低）。

这里给出一些示例：

```json
{
  "publishConfig": {
    "tag": "next",
    "registry": "https://npm.paperplane.cc"
  }
}
```

上述示例可在发布时指定默认的源，并始终指定 `next` 版本标签。



# monorepo 支持

npm 现在原生支持 monorepo，它提供了一个 `workspaces` 字段用于定义 monorepo 的 “工作区”。查看 [官方文档](https://docs.npmjs.com/cli/v9/using-npm/workspaces)。
这个字段的格式如下：

```json
{
  "workspaces": [
    "./packages/my-package-a",
    "./packages/my-package-b",
  ]
}
```

也可以支持 glob 通配符：

```json
{
  "workspaces": [
    "./packages/*"
  ]
}
```

使用 monorepo 时，我们可以把多个仓库放在 `./packages/` 目录下，并指定正确的 `workspaces` 字段，这样只需要运行 `npm i` 便可以自动为每个子包安装所有依赖，并自动建立符号连接。



# 运行平台

通常 Node.js 项目或是需本地编译的项目，会需求这些字段。举例：

```json
{
  "engines": {
    "node": ">=0.10.3 <15",
    "npm": "~1.0.20"
  },
  "os": [
    "darwin",
    "linux",
    "!win32"
  ],
  "cpu": [
    "x64",
    "!ia32"
  ]
}
```

其中：

**`engines` 字段：**
表示项目运行时或此 npm 包需求的 Node.js 和 npm 版本号，格式支持上面的锁定依赖版本号格式或者是大于小于号的格式，执行 npm 命令时，如果 Node.js 和 npm 版本号不符合这里规定的版本，那么会直接报错；

**`os` 字段：**
表示运行时候的操作系统要求；以 `!` 感叹号开头的项目表示除外的；

**`cpu` 字段：**
表示支持的处理器类型；以 `!` 感叹号开头的项目表示除外的。



# 给其他工具准备的字段

很多工具支持从 `package.json` 中读取配置字段，此处给出常见的。



pnpm

Prettier

ESLint

browserslist

lint-staged

commitizen



例如，`prettier` 可以读取项目根目录的 `.prettierrc` 文件，但也支持读取 `package.json` 中的 `prettier` 字段。具体要看工具的支持情况。

一般来说，`babel`、`eslint`、`prettier` 这类工具并不推荐把配置放在 `package.json` 中，原因是这些配置可能会使用 JS 代码来控制，或者是供给编辑器读取，如果放在 `package.json` 中可能会导致配置不便；而且这些配置的变更不应该反馈到 `package.json` 文件的变更时间线。

相对来说，更推荐把 `husky`、`browserslist` 这些配置放在 `package.json` 中，因为它们本身就带有一定的 “描述性”，且不会频繁更改。
