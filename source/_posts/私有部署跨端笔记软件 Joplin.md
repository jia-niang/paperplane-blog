---
title: 私有部署跨端笔记软件 Joplin
date: 2024-11-20 14:00:00
tags: 
- DOC
- DevOps
categories: 
- DOC
---

拖了接近一年的一篇文章，介绍我近期一直在使用的笔记软件——Joplin。
它可能不是最好的，下文讲到了很多缺点，但它确实有自身的独特之处，值得一试。



# 为什么选择 Jopin

对比 OneNote、印象笔记、Typora



# 服务端的安装和配置方式

部署、安装、跨平台、同步；



# 客户端安装、使用和定制

部署、安装、跨平台、同步；

快捷键和样式 bug



## 【必做】优化编辑器样式

默认情况下，尤其是对 Windows 用户而言，Joplin 的文本编辑器在文本字体和代码块方面都有些问题，例如默认是宋体字，代码块也不是等宽字体，甚至设置里的定制字体也不是很好用；不过好在 Joplin 提供了自定义样式的功能，我们来把它改的更好一些：

打开 “选项” > “外观” > “显示高级选项”，然后点击第一个 “适用于已渲染 Markdown 的自定义样式表” 按钮；
此时会打开一个 CSS 文件，填入：

```css
/* For styling the rendered Markdown */
code {
  font-family: Fira Code, Fira Code Light, Consolas, Microsoft YaHei, 'Courier New', monospace !important;
}
pre.hljs {
  padding: 0.2em 0.5em !important;
}
.mce-content-body .joplin-editable {
  margin: 0 0.25em !important;
}
```

我这里的 `Fira Code` 是我自己用的代码字体，你可以换成你自己喜欢用的，或者直接删掉，使用 `Consolas` 也不错；

保存此文件，我们继续；
点击第二个 “适用于 Joplin 全域应用样式的自定义样式表” 按钮，这也会打开一个 CSS 文件，填入：

```css
/* For styling the entire Joplin app (except the rendered Markdown, which is defined in `userstyle.css`) */
.CodeMirror.CodeMirror * {
  font-family: Fira Code, Fira Code Light, Consolas, Microsoft YaHei, 'Courier New', monospace !important;
}
.CodeMirror pre.CodeMirror-line, .CodeMirror pre.CodeMirror-line-like {
  padding-left: 0.5em !important;
  padding-right: 0.5em !important;
}
```

同理，代码字体可以改成你喜欢用的。

经过这样的定制，编辑器中不再会显示宋体字，代码字体也会变成常用的等宽字体，且代码块也不再会有遮挡问题。



# 特色功能：生成分享网页



# 特色功能：网页剪藏



# 扩展插件

