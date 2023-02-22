---
title: Emmet 用法备忘
date: 2019-07-19 15:41:41
tags: 
- HTML
categories: 
- HTML
---

Emmet 是内置于 VSCode 等编辑器中的代码速录自动补全工具，它允许你使用 CSS 选择器的写法快速生成对应结构的 HTML。

举个例子：你只要输入 `div.content#main`，就可以生成一个 `<div class="content" id="main"></div>` 这样的 HTML 片段，可以极大提高前端开发的效率。除了 HTML 代码片段的快速生成，Emmet 同样还支持 CSS 语法。



# 起步 
输入 `!` 或 `html:5` 可以生成 HTML5 基础结构，如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  
</body>
</html>
```
也可以输入 `!!!` 来只生成 `<!DOCTYPE html>`；
可以输入 `html:xt` 来生成 HTML4 过渡型或输入 `html:4s` 来生成 HTML4 严格型。



# DOM速写



## 速写 HTML 标签

这里的写法和 CSS 的 ID 选择器、class 选择器类似。
例如输入 `div#main.large.content`，生成的结果：

```html
<div id="main" class="large content"></div>
```

---

使用方括号 `[]` 定义属性，使用花括号 `{}` 定义文本。
例如输入 `td[span=4]{TEST}`，生成的结果：

```html
<td colspan="4">TEST</td>
```



## 速写 HTML 结构

语法也和 CSS 选择器的关系符类似，这里 `>` 表示子级标签。
例如输入 `ul>ul`，生成的结果：

```html
<ul>
  <li></li>
</ul>
```

---

`+` 表示同级兄弟标签。
例如输入 `thead+tbody`，生成的结果：

```html
<thead></thead>
<tbody></tbody>
```

---

`^` 表示向父级移动一次。
例如输入 `header>nav^main`，生成的结果：

```html
<header>
  <nav></nav>
</header>
<main></main>
```



## 速写重复结构

符号 `*` 后面接一个数值，即表示将星号前面的结构重复该数值次。
例如输入 `ul>li*5`，生成的结果：

```html
<ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>
```

这里的 `*5` 表示把前面的 `li` 重复 5 次，可以发现最前面的 `ul` 并没有跟着一起重复。

---

可以使用 `()` 小括号来给标签分组，`*` 符号将会把整个组里的内容重复多次生成；
例如输入 `dl>(dt+dd)*3`，生成的结果：

```html
<dl>
  <dt></dt>
  <dd></dd>
  <dt></dt>
  <dd></dd>
  <dt></dt>
  <dd></dd>
</dl>
```

---

生成重复结构的时候，还可以使用 `$` 符号来表示序号。
例如输入 `ul>li*5{item-$}`，生成的结果：

```html
<ul>
  <li>item-1</li>
  <li>item-2</li>
  <li>item-3</li>
  <li>item-4</li>
  <li>item-5</li>
</ul>
```
而 `$` 这是编号的占位符，编号从 1 开始。
使用多位的 `$` 可以生成多位的编号，例如 `$$$` 则会生成编号 `001`；
使用 `@` 来设置编号初值，例如 `$@4` 那么编号从 4 开始；
使用 `@-` 来生成倒序的编号。



## 默认标签、属性

默认的标签是 `<div>`，例如输入 `.item` 结果为 `<div class="item"></div>`；
如果当前在某些标签里面，Emmet 会自动使用对应的默认标签。举例：

- 在 `<ul>` 和 `<ol>` 里默认标签是 `<li>`；

- 在 `<table>`、`<thead>`、`<tbody>` 和 `<tfoot>` 里默认标签是 `<tr>`；

- 在 `<tr>` 里默认标签是 `<td>`；

- 在 `<select>` 和 `<optgroup>` 里默认标签是 `<option>`。



另外 Emmet 预设了一些元素的属性快速补全：

例如，`img:s` 可以生成带有 `src`、`alt` 和 `srcset` 属性的 `<img>` 标签；
而 `input:b` 可以生成 `type="button"` 的 `<input>` 元素。



## 生成 Lorem ipsum 填充文本
使用 `lorem` 或者 `lipsum` 来生成这些填充文本，内容如下：

```
Lorem ipsum dolor sit amet consectetur, adipisicing elit. Earum eaque molestiae laudantium similique harum sequi, modi labore, doloremque expedita illo exercitationem maxime quidem, incidunt optio consequuntur? Suscipit a fugit atque?
```
也可以使用例如 `lorem10` 这种后面接数字的方式来指定文字的数量。

> lorem 通常指的是一段无意义的文字，用于测试文字显示和排版效果。



# CSS输入辅助



## 常用属性

以下是几个常用 CSS 属性的速写：

`w`、`h` 表示 `width`、`height`；
`m`、`p` 表示 `margin`、`padding`，相应的例如 `mt` 表示 `margin-top`；
`c` 表示 `color`，`bg` 表示 `background`；
`fz` 表示 `font-size`，这个注意不要打成 `fs`，它表示 `font-style`；
`brs` 表示 `border-radius`，这个比较难想到；
`poa`、`por` 表示 `position: relative`、`position: absolute;`；
`dib`、`df` 表示 `display: inline-block`、`display: flex`。



如果记不住 CSS 属性，可以输入简称，Emmet 会自动帮你匹配最接近的语法；
例如输入 `ov:h`、`ov-h` 或 `ovh` 都会匹配 `overflow: hidden`。



生成 `!important` 只需要输入 `!` 感叹号即可。



## 常用单位

单位默认是 `px`，不写单位就是 `px`；
`p` 表示 `%`；
`e`、`r` 表示 `em`、`rem`；
`x` 表示 `ex`。



## 复杂属性写法

复杂属性快速补全：

- 因为 Emmet 不能使用空格，因此属性之间的空格用 `-` 来表示，例如：输入 `m30-40` 结果为 `margin: 30px 40px`；而输入 `m30--40` 结果为 `margin: 30px -40px`。

- 可以使用 `+` 加号来同时写多条 CSS，例如输入 `m20-30+p10` 会生成 `margin: 20px; padding: 10px;`。

- 颜色也可以快速补全，输入 `#` 井号开头后面接着输入颜色值，例如：`#1` 生成 `#11111`；`#e0` 生成 `#e0e0e0`；`#fc0` 生成 `#ffcc00`；

- 复合型属性，可以一次性设置多个子项，例如输入 `bd5#0s` 结果 `border: 5px #000 soild`。



## 自动添加浏览器前缀

只需添加 `-` 前缀，Emmet 便会按顺序自动生成 `-webkit-`、`-moz-`、`-ms-`、`-o-` 前缀的属性；
也可以手动控制生成的前缀以及顺序，例如输入`-wm`前缀，则只会生成 `-webkit-` 和 `-ms-` 两个前缀。



## 生成 `@` 开头的 CSS
使用 `@f` 可以生成 `@font-face`；
而输入 `@ff` 可以生成增强版 `@font-face` 属性，里面很多属性都已经预设好了，如下：

```css
@font-face {
  font-family: 'FontName';
  src: url('FileName.eot');
  src: url('FileName.eot?#iefix') format('embedded-opentype'),
      url('FileName.woff') format('woff'),
      url('FileName.ttf') format('truetype'),
      url('FileName.svg#FontName') format('svg');
  font-style: normal;
  font-weight: normal;
}
```



## 生成渐变

CSS 中可以使用 `linear-gradient` 来产生渐变效果，但是它的值比较复杂，有时还需要添加浏览器前缀才能生效；
使用 Emmet 时，可以使用 `lg()` 指令快速生成，例如输入 `lg(left, #fff 50%, #000)` 输出为：

```css
background-image: -webkit-gradient(linear, 0 0, 100% 0, color-stop(0.5, #fff), to(#000));
background-image: -webkit-linear-gradient(left, #fff 50%, #000);
background-image: -moz-linear-gradient(left, #fff 50%, #000);
background-image: -o-linear-gradient(left, #fff 50%, #000);
background-image: linear-gradient(left, #fff 50%, #000);
```