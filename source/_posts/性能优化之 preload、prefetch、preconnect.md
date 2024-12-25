---
title: 性能优化之 preload、prefetch、preconnect
date: 2023-10-20 10:00:00
tags: 
- JS
- WebAPI
categories: 
- DOC
---

**请注意区分 dns-prefetch 和 prefetch 的区别，下文都会有讲到。**

先说结论：这几种方式都可以提高网站的浏览体验，减少用户等待资源加载的时间。

具体来说：

- preload、prefetch 都是为了提前加载资源，以减少用户后续浏览时的资源下载时间，两者选用一个即可；
  前者会令浏览器尽快加载资源，后者则是尝试在闲时自动后台下载；
  **Webpack 支持这两种优化手段，可以通过特定的代码注释来开启；**
- dns-prefetch、preconnect 都是只在 **资源和源站的 URL 不同的场景** 用于加速浏览器连接的，两者选用一个即可；
  前者预解析其他域名的 DNS，后者则更激进，还会对其他域名预先建立 TCP、TLS 握手等。

如果你读过 [《特殊的代码注释》](https://paperplane.cc/p/f5ed8e85faac/) 这一篇博文，你可能对 preload 和 prefetch 比较熟悉。



# preload 和 prefetch

`preload` 表示 “预加载”，`prefetch` 表示 “预获取”；
它们的用法很简单，都是写一个 `<link>` 标签放在 `<head>` 里面：

```html
<head>
  <link rel="preload" as="script" href="需要预加载的JS文件">
  <link rel="prefetch" as="script" href="需要预获取的JS文件">
</head>
```

“预加载 preload” 的作用是：
提示浏览器，用户 **很快** 就要用到某些资源，浏览器会以较高的优先级去加载这些资源（[MDN 文档说明](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)）。

“预获取 prefetch” 的作用是：
提示浏览器，用户 **将来可能** 需要某些资源，所以浏览器可以在网络空闲时，在后台默默加载好这些资源，并短时间缓存下来（[MDN 文档说明](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/prefetch)）。

如果你的网站是纯静态网站，你可以把大部分文件都写死在 HTML 里，直接享受它的提速效果；
但是，现在的 SPA 项目都是 Webpack 打包编译的，还会存在 “懒路由” 等异步加载的情况，不可能手工完成这个操作，所以 Webpack 提供了预加载和预获取的功能，且有一定的逻辑，这也是本文的主旨。



## 什么是 “懒路由”

SPA 站点的特点就是会代码打包，这样才能提供更好的体验。
但如果把全站的 JS、CSS 打包在一起，首屏加载会很久，所以我们会进行 “代码分割”，按照一定的模块划分来对代码进行拆分成多个 chunk（块），一部分页面是只有用户访问到时才会去加载，这样就可以大大减少首屏的加载时间。

例如，商店网站可以只把首页单独做成一个 chunk，而用户、订单、购物车页都分割出去，等到用户访问时再去加载；
这种加载方式，需要我们在代码的 “路由注册” 阶段设置好，所以也被称为 “懒路由”。

Webpack 默认不会分 chunk，需要通过 `import()`  来开启它的 chunk 功能。

以下我们假设存在一个 “商店” 的 React 网站，先来看看默认的不分 chunk 时某个 “关于 About” 页面的引入方式：

```typescript
import AboutPage from '@/pages/about'
```

这样做，“关于” 页面会和首页的主 chunk 打包在一起，影响首屏加载速度；
可以这样做：

```typescript
import loadable from '@loadable/component'

const AboutPage = loadable(() => import('@/pages/about'))
```

这里使用了 `import()` 动态导入函数，当然它不会发挥本身的作用，Webpack 检测到代码中用到这个函数，就会进行分块处理，在没用到被 `import()` 的模块的时候，这些代码就不会被加载，减小了主 chunk 的体积。

> 这里使用了一个工具 `@loadable/component`，实际上 `react-router` 最新版本已经提供了一些原生懒路由支持，建议尝试一下。
> 我写这篇博文的时候，`react-router` 原生的懒路由功能没法提供具体某个懒路由页面的 loading 状态，不够完善。



## Webpack 配置预加载和预获取

继续上面的例子：商店页面可以只把首页单独做成一个 chunk，而 “订单”、“购物车” 等页都分割出去作为单独的 chunk，等到用户访问时再去加载。

但是，用户点击这些页面后，还是要 loading，体验还是不够完美：**我们想要在用户浏览过程中，浏览器在后台把某些页面的资源加载完毕，用户后续点击链接便可以瞬间跳转过去，无需等待资源加载。**
这便是 “预加载” 或者 “预获取” 资源。显而易见，这个功能必须配合代码分割 chunk 来使用，否则没有意义。

此时，就可以用到 Webpack 给我们提供了的配置 preload 和 prefetch 的方式：
在 `import()` 函数括号中添加特定的注释即可。

开启某个 chunk 的 “预加载 proload”：

```typescript
const AboutPage = loadable(() => import(/* webpackPreload: true */ '@/pages/about'))
```

开启某个 chunk 的 “预获取 prefetch”：

```typescript
const AboutPage = loadable(() => import(/* webpackPrefetch: true */ '@/pages/about'))
```

通过这两个注释，就能开启 chunk 的预加载和预获取，Webpack 会在打包的产物中注入对应的代码，来实现这些功能，请继续查看下文。



## Webpack 处理 prefetch

先来讲 **prefetch 预获取**，因为 Webpack 处理它的逻辑比较简单：

假设页面 A 通过 `import(/* webpackPrefetch: true */ '...')` 这种方式引入了页面 B，那么 Webpack 会在页面 A 的代码中放置一段加载代码，作用是 **在 A 加载完之后**，自动往网页的 `<head>` 内加入以下内容：

```html
<head>
  <link rel="prefetch" as="script" href="页面B的文件.js">
</head>
```

概括为：Webpack 会在当前页面加载完毕后，才会放置 prefetch 的 HTML 标签。



## Webpack 处理 preload

然后就是 **preload 预加载**，注意 Webpack 对待它是存在区别的：

假设页面 A 通过 `import(/* webpackPreload: true */ '...')` 这种方式引入了页面 B，**那么在用户从前一个 chunk 的页面刚来到 A 时，此时 A 页面还刚开始被加载**，Webpack 注入的代码就会直接往网页的 `<head>` 内加入以下内容：

```html
<head>
  <link rel="preload" as="script" href="页面B的文件.js">
</head>
```

概括为：Webpack 会在更提前放置 preload 的 HTML 标签，你在当前页面刚开始加载的时候，需要 preload 的 HTML 标签已经被放置好了；放置 preload 标签的代码，可能写在更前面一个 chunk 里面了。

<br />

再举一个例子：页面 A 异步加载 B，B 异步加载 C，且都使用 preload 来加载；
**此时，你刚从 A 点击 B 的瞬间，B 可能还没加载好呢，C 的 preload 标签就被立即放置到网页上了，所以说这段放置 preload 标签的代码是写在 A 所在的 chunk 里面的。**

<br />

你有没有发现：假设页面 A 是主 chunk，那么 B 是没法被 preload 的，**主 chunk 里面所有的 preload 都没有作用**；
原因很简单：主 chunk 必定首先加载，没有比它更前的页面了，**那么实际上并没有一个时机来为 B 放置 preload 的标签**。

GitHub 上同样有很多人对此有疑问：[链接1](https://github.com/webpack/webpack/issues/8342)、[链接2](https://github.com/webpack/webpack/issues/7920)；
开发者也有回复：如果真想实现主 chunk 对其他 chunk 的 preload，则需要 Webpack 分析所有主 chunk 用到的 preload 加载的资源，并提前注入到 HTML 文件的 `<head>` 里，因为用 JS 来放置 preload 就太晚了，这也需要 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 插件来与之配合，通过 [插件作者的回复](https://github.com/jantimon/html-webpack-plugin/issues/1150) 来看，目前看来这个功能并没有任何计划提供支持。



## preload 和 prefetch 的 HTML 标签

使用这两个 HTML 标签时，需要注意：

- 浏览器对不同域名的缓存往往不能共通，所以 **不要** 给 prefetch 和 preload 提供跨域的资源；

- 被预加载或预获取的资源如果响应头的 Cache-Control 被设为 `no-store` 或 `no-cache`，那么也是没有效果的；
- 这个标签的 `as` 属性是必须的，它的值一般为 `"script"`，但也支持 `"style"`、`"font"`、`"image"` 等值；
  使用这个属性，会为浏览器的预加载或预获取请求添加 `Accept` 头。

值得一提的是，因为 CSS 自身有能力引入其它资源（使用 `@import()` 语法），可能会导致加载一大堆文件，所以 Webpack 没有计划为 CSS 文件提供预加载或预获取的功能。



# dns-prefetch（DNS 预解析）

**注意 dns-prefetch 和 prefetch 有巨大的区别，不可混为一谈。**

dns-prefetch 我们称为 “DNS 预解析”，**它只适用于存在 CDN 且 CDN 域名与主域名不同的情况**。
它的作用是让浏览器提前为其它的域名做 DNS 解析，提高后续访问的速度。

以知乎为例：

![](../images/image-20231023035258180.png)

这里知乎为自己的几个 CDN 域名都做了 dns-prefetch，这样后续浏览时便可以优化连接速度。
如果需要对 dns-prefetch 的优化进行指标化的度量，[这篇文章](https://www.cythilya.tw/2016/06/25/dns-prefetching/) 有提到各个浏览器查看 DNS 解析性能指标的方式。

可以看出，DNS 预解析是通过在 `<head>` 中放置标签的方式来实现的：

```html
<head>
  <link rel="dns-prefetch" href="域名">
</head>
```

因为网站打开后马上就会加载资源，所以 DNS 预解析生效的越早越好，一般是希望把标签直接放置在 HTML 中，并放在较提前的位置，而不是通过 JS 来放置。

<br />

**开发实践：**

因为 DNS 预解析通常是直接放在 HTML 的，所以我们需要使用 Webpack 插件来实现。

使用 [`html-webpack-tags-plugin`](https://www.npmjs.com/package/html-webpack-tags-plugin) 插件：

```javascript
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin')

// 放入 webpack 的 plugins 中：
new HtmlWebpackTagsPlugin({
  usePublicPath: false, // ← 如果不加这一行，href 前面会多出一个 "/"
  links: [
    { path: 'https://example.com', attributes: { rel: 'dns-prefetch' } },
  ],
})
```



# preconnect（预连接）

preconnect 我们称为 “预连接”，它同样适用于某些资源和主域名不同的场景，它会使浏览器提前发起 DNS 解析、TCP 握手，如果是 https 的网站还会提前进行 TLS 握手。

**推荐的做法是，只将最关键的域名进行 “预连接”，因为预连接的域名太多会导致占用很多网络带宽，可能会导致适得其反。**
以 bilibili 视频播放页为例：

![](../images/image-20231023043650740.png)

可以看到只有两个域名开启了预连接。

<br />

**开发实践：**

预连接也是推荐直接放在 HTML 的，方法和 DNS 预解析类似：

```javascript
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin')

// 放入 webpack 的 plugins 中：
new HtmlWebpackTagsPlugin({
  usePublicPath: false, // ← 如果不加这一行，href 前面会多出一个 "/"
  links: [
    { path: 'https://example.com', attributes: { rel: 'preconnect' } },
  ],
})
```

<br />

通常来说，preconnect 覆盖了 dns-prefetch 的功能，但是后者的兼容性更好，早期的浏览器也能良好的支持。
所以，很多网站只要使用了 preconnect，也会同时提供一个相同域名的 dns-prefetch（要写在 preconnect 之后），这样遇到低版本浏览器不支持 preconnect 时，也能让 dns-prefetch 兜底。

知乎上有一篇 [文章](https://zhuanlan.zhihu.com/p/358836730) 对 preconnect 和 dns-prefetch 做了测试，可以看出这两者都能明显提升性能，且 preconnect 更加明显。而且 preconnect 和 dns-prefetch 同时开启时，和只开启 preconnect 是没有区别的（2ms 区别应该是误差）。



# modulepreload

自 Chrome 66 开始，新增了 `<link rel="modulepreload">` 的支持，可以称之为 “模块预加载”。

它和 preload 类似，但是相比之下它除了下载和缓存资源之外，还对资源代码提供了原生 ES Module 的支持，会解析和编译它并把结果放入 module map 中，为后续的执行代码做好准备。
可以理解为：这是为 ES Module 提供的专用的 preload。

在本地开发时，Vite 利用了这个功能，使得本地开发调试 JS 的速度得到进一步加快。
