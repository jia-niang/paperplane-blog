---
title: Web 项目常用代码模板
date: 2023-08-14 10:13:00
tags:
- Cheatsheet
- JS
- Secure
categories:
- DOC
---

记录 Web 开发和 Node.js 开发中一些常见的代码模板。



# `.editorconfig` 文件

[EditorConfig](https://editorconfig.org/) 是一种被广泛支持的编辑器配置，因为面向所有编程语言，所以它提供的配置项（[查看所有配置项](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)）不是特别多。
它使用 `.editorconfig` 文件作为配置文件，VSCode 需要先[安装插件](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)。

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

[*.{js,jsx,ts,tsx}]
quote_type=single
```

注意这里给 `.md` 文件的配置项 `trim_trailing_whitespace = false`，这个切勿遗漏，否则编辑器会自动移除 markdown 文档所有行尾的空格，这会导致解析显示 markdown 时换行显示失效（不过，行尾没有空格不会影响 hexo 博文的换行）。



# `LICENSE` 开源许可

对开源许可不了解、对开源许可的名称不熟悉？[开源许可介绍及简称一览](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。
如何选择许可？[点我查看](https://choosealicense.com/)。

注意，下面给出的是 MIT 协议的模板。
在使用时你需要把其中的 `[year]` 替换成年份，例如 `2023-present`；然后把其中的 `[fullname]` 替换成你的名字，也可以把邮箱也写上，例如 `jia-niang <1@paperplane.cc>`。

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



# `.gitignore` 配置

我们经常能看到 `.gitignore` 这个文件，它用于标记哪些文件被 Git 忽略掉，不被提交到代码管理中去。
不同的项目可能会使用不同的 `.gitignore`，可以在 [这个网站](https://www.toptal.com/developers/gitignore/) 查询某种开发语言所对应的 `.gitignore` 配置。

通常来说不论是哪种开发语言，我们都会让 Git 忽略这几类内容：日志（例如 `yarn-error.log`）、IDE 配置（例如 `.vscode`）、项目依赖（例如 `node_modules`）；而有些项目存在一些包含敏感信息的配置文件，例如密钥，我们不希望这些敏感信息被提交上去，所以会使用 `.gitignore` 来指定忽略掉这些内容。

**请注意：不要直接复制并使用下面的模板！使用之前，请仔细阅读模板下面的补充说明。**

```
# compiled output
/dist
/node_modules

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

补充说明：

- 上面的示例认为代码编译构建后输出到目录 `./dist`（第二行），但是 cra 创建的 React 项目会默认输出到 `./build` 目录，你可以把 `/dist` 改成 `/build`；
  如果想改 cra 默认的编译构建输出目录，以下方式二选一：项目根目录下新建一个 `.env` 文件并写入 `BUILD_PATH = dist`；或是在运行编译构建指令时添加 `--output-path=dist` 参数；
- 上面的示例中，没有包含 `package-lock.json`、`yarn.lock` 和 `pnpm-lock.yaml` 等版本锁定文件，因此它们会一并上传；这是推荐做法，这样做可以提高多人开发以及 CI/CD 场景下依赖包的一致性。

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



# `.npmrc`  配置

TODO

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



# `.prettierrc` 配置

TODO

还有 .prettierignore



# `package.json` 配置

请参考本站的另一篇博文 [《读懂 package.json》](https://paperplane.cc/p/e340866d6dca/)。



# `tsconfig.json` 配置

TODO



# `.babelrc` 简单模板

TODO



#  `.eslintrc` 简单模板

TODO

还有 .eslintignore



# cra 配置文件

TODO

例子1：craco.config.js

例子2：config-overrides.js



# `.browserslistrc` 配置

TODO



# Docker 相关文件

TODO
