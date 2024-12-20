# PaperPlane Blog

# 简介

本博客基于 [Hexo](https://hexo.io/zh-cn/)，主题基于默认的 landscape 深度定制。

> GitHub 代码仓库为镜像。  
> 原始代码仓库：https://git.paperplane.cc/jia-niang/paperplane-blog

# 开发指南

```bash
# 安装
yarn

# 本地调试（端口号默认 4000）
yarn dev

# 编译构建（输出到 /public 目录）
yarn build
```

# 撰写指南

Hexo 博文的渲染与普通 Markdown 略有不同，目前有以下区别：

- Hexo 支持单回车符换行，普通 md 文档单回车符换行是无效的，必须在后面加上至少两个空格；
- Hexo 的代码高亮在编译阶段就完成了，它的支持程度有限；React 相关代码请使用 `jsx` 作为代码块，而不是 `react`；
- 已知 bug：`**强调**` 强调符号包裹的内容请避免以代码块开头。

推荐使用 [Typora](https://typora.io/) 来书写博文，不推荐 VSCode。  
配置方式：

- 偏好设置 → 图像 → “插入图片时…” 选择 “复制到指定路径”，并在输入框中输入 `../images`；
- 勾选 “对本地位置的图片应用上述规则” ；
- “图片语法偏好” 勾选 “优先使用相对路径”。

此后，便可以直接向文档中粘贴图片，图片会自动变成 Markdown 标记，文件会被自动放到 /sorce/images 里。

# 二次开发指南

因为模板中用到了 ejs、stylus，所以需要安装对应的 VSCode 插件。

使用 `Ctrl` + `P` 快捷键（macOS 则是 `Command` + `P`），依次输入以下命令安装插件：

```bash
ext install sysoev.language-stylus
ext install j69.ejs-beautify
ext install digitalbrainstem.javascript-ejs-support
```

# 文章属性

每篇博文 md 文档最开头的一块内容即是 [文章属性](https://hexo.io/zh-cn/docs/front-matter)。文章必须具有标题、日期、分类、标签这四个属性。

## 配置

除了官方文档默认的属性外，本博客系统额外扩展了以下配置项：

- `no_toc: true` 关闭此篇文章的目录功能，默认 `false`
- `history: -1` 文章修订记录显示个数，默认 `-1` 表示不限，设为 `0` 可以关闭此文章的修订记录

## 分类

分类 `categories` 一般是单选的；提供多个值时会变为父子关系，例如提供 `- A` 和 `- B` 会变为 `A/B`；如果一定要多选，格式需要形如 `- [A]` 和 `- [B]`。

目前支持以下分类：

- `DOC` 纯技术文档分类
- `JS`
- `CSS`
- `HTML`
- `DevOps`
- `Docker`
- `React`

## 标签

标签 `tags` 可以多选，且它没有顺序和层次性。目前支持以下标签：

- 以上所有 `categories` 均可当做标签使用
- `TS`
- `Node`
- `npm`
- `Cheatsheet` 速查表
- `Scaffold` 代码样板
- `Secure` 安全性
- `WebAPI`
