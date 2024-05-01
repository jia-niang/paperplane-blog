# PaperPlane Blog

# 简介

本博客基于 [Hexo](https://hexo.io/zh-cn/)，主题基于默认的 landscape 深度定制。

> Github 代码仓库为镜像。  
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

# 文章属性

每篇博文 md 文档最开头的一块内容即是文章属性。文章默认必须标题、日期、分类、标签这四个属性。

## 配置

目前支持以下配置项：
- `no_toc: true` 关闭此篇文章的目录功能

## 分类

分类 `categories` 只能单选。目前支持以下分类：
- `DOC` 纯技术文档分类
- `JS`
- `CSS`
- `HTML`
- `DevOps`
- `Docker`
- `React`

## 标签

标签 `tags` 可以多选。目前支持以下标签：
- 以上所有 `categories` 均可当做标签使用
- `TS`
- `Node`
- `npm`
- `Cheatsheet` 速查表
- `Scaffold` 代码样板
- `Secure` 安全性
- `WebAPI`
