---
title: JS 开发的优良习惯、技巧与避坑
date: 2024-02-21 21:40:00
tags: 
- JS
- DOC
- WebAPI
- Scaffold
categories: 
- JS
---

持续更新，记录 Web 和 Node.js 开发中经验技巧，优化开发体验，避免踩坑。



# 做好工具选型

不同的工具之间往往存在不同的利弊，要根据项目的需求和特征，来选择合适的工具取长补短；甚至是在需要的时候不使用工具直接编码解决问题，或是投入成本自行开发和维护一套工具。

工具选型甚至还涉及到非技术因素，例如，某些工具的开源许可存在限制，不允许在商业软件中使用，或是允许使用但不允许分发。

------

举个例子，假设现在项目中有编码和解码 url 参数的需求，作为开发者我们有几个选择：

- 自行开发工具函数；

- 使用原生 [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) 对象，为了避免环境不支持可以考虑引入 polyfill；
- 使用 [qs](https://www.npmjs.com/package/qs) 和 [query-string](https://www.npmjs.com/package/query-string) 这类工具。

此时面临选型，首先排除自行开发，因为性价比太低；然后经过分析，原生的 `URLSearchParams` 支持功能太少，例如不支持数组、不支持快捷解析出布尔值或数值，还需要做一次类型转换等。
如果你的需求比较简单，可以直接使用  `URLSearchParams`，担心用户浏览器太旧的话还可以加入 polyfill。

如果选用第三方库，此时就要在 `qs` 和 `query-string` 中选择，它们的利弊如下：

- `qs` 的功能强大，支持数组、自动转类型等功能，对嵌套对象格式、特殊字符集编码等都有良好的支持，提供了 ESM、CJS、UMD 的引入方式；但是它的代码体积很大，UMD 文件也有 46KB 大小；
- `query-string` 功能有限，但是数组、自动转类型等常用功能也都有，它特意被设计成不支持嵌套对象的格式，它只有 CJS 引入方式；它的代码体积小，未压缩版本也只有 12KB 大小。

如果是小程序类项目，对代码包体积大小敏感，此时可能就要选用 `query-string` 了；
而如果项目极其依赖 url 传参，需要传各种对象格式的复杂参数，甚至包含了特殊字符集，那么 `qs` 则更适合。

-----

此外，npm 上有很多包仅仅有一字之差，但是区别却很大，例如：`querystring` 和 `query-string`，前者早已被废弃，后者还在持续维护。
这一点在安装使用时也需要注意。



# 明确环境变量的来源

开发中几乎都是使用第三方库，可能会让我们产生很多刻板印象。
实际上：

- `process.env.NODE_ENV` 并不是凭空就有的，它的值是由工具或运行环境来配置的；
- `process.env` 只来自于操作系统，Node.js 默认不会自动从 `.env` 中读取它；
- 前端项目代码运行在用户的浏览器中，不可能运行 `process.env` 来访问用户电脑上的变量，实际上前端源码中的这些写法都会被 Webpack 等打包工具会提前处理，在编译时直接替换成对应的值。

-----

**Node.js 中的 `process.env` 可以获取环境变量，但这并不意味着它会自动读取 `.env` 文件。**
实现了类似功能的库，往往都带有一系列代码或依赖用来读取 `.env` 文件并解析。

最常用的就是 [dotenv](https://www.npmjs.com/package/dotenv)，只要运行以下代码，它就会自动读取 `.env` 文件，并把其中所有的键值对设置到 `process.env`。
示例：

```js
require('dotenv').config()
```

如果你的应用需要读取 `.env` 文件，建议使用这个包。

以 `create-react-app` 举例，它的依赖项 `react-scripts` 中有 [一系列代码](https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/env.js) 用来读取 `.env` 文件并解析，其中也用到了 `dotenv`，因此 cra 项目可以读取 `.env` 中的变量，并在 `process.env` 中访问；在 `vue-cli` 中也能找到 [类似的代码](https://github.com/vuejs/vue-cli/blob/master/packages/%40vue/cli-service/lib/Service.js)。

此外，`dotenv` 默认只读取 `.env` 文件，如果需要添加 `.development` 或 `.local` 这一类后缀，需要传参数。
代码示例：

```js
// 指定文件名，从 .env.local 读取变量
require('dotenv').config({ path: './.env.local' })

// 支持多个文件，此时较左侧的文件中的的变量优先生效
require('dotenv').config({ path: ['.env.local', '.env'] })

// 配置 override 后，较右侧的文件中的变量优先生效
require('dotenv').config({ 
  path: ['.env-aa', '.env-xx'],
  override: true
})
// override 还有使得自定义环境变量能覆盖系统环境变量的功能
```

如果不希望将读到的环境变量混入 `process.env`，则可以这样：

```js
const variablesInEnv = {}
require('dotenv').config({ processEnv: variablesInEnv })

// 此时 .env 中的变量键值对仅会写入到对象 variablesInEnv
console.log(variablesInEnv)
```

> 如果应用开发者并没有使用 `dotenv`，使用者想使用 `.env` 文件来向应用的源码中的 `process.env` 中注入值，则可以安装 `dotenv-cli`，并使用 `dotenv` 作为启动指令（注意没有 “-cli” 后缀），这样也可以让 `.env` 文件被应用中的 `process.env` 读取。
>
> `dotenv-cli` 还支持添加 `-v KEY=VALUE` 参数来手动注入变量，也支持 `-e .env.local` 参数来手动指定文件名。
>
> 如果你使用 Node.js 的 20 或以上版本，它原生支持读取 `.env` 这类文件，可以参考这篇 [文档](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)。

-----

`process.env.NODE_ENV` 这个值被我们广泛使用，用来判断当前运行环境。
实际上，这个值并不是凭空而来的，如果没有任何工具或者库来设置这个变量，系统也没有设置，那么这个值始终是空的。

**一般来说，各个库的 CLI 工具都会在例如 `serve`、`start`、`dev` 等启动指令时注入 `NODE_ENV = development` 的变量；**
**而在 `build`、`dist`、`prod` 等启动指令时注入 `NODE_ENV = production` 变量。**

例如，在 `create-react-app` 的 `build` 指令的代码中，开头就是 [这些代码](https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/scripts/build.js)：

```js
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// ...
```

如果你的 Node.js 应用没有类似的代码，也没有使用类似的工具，那么获取到的 `process.env.NODE_ENV` 为空。此时，可以根据启动指令手动设置变量，或使用 `dotenv`、`cross-env` 等工具来配置。

Node.js 的 [文档](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production#nodejs-the-difference-between-development-and-production) 中说了总是假定运行在开发环境，用户手动设置 `NODE_ENV = production` 才会使 Node.js 转入生产模式运行；对于 Node.js 本身而言，这两种模式的区别仅仅在日志大小和缓存级别上，没有其他影响。

Docker 的官方镜像的 [README 文件](https://github.com/nodejs/docker-node/blob/main/README.md) 中，也提供了一个带有 `NODE_ENV=production` 的 Docker compose 配置示例文件。

-----

前端项目运行在用户的浏览器中，此时不可能有 `process.env`，因此，前端项目中这些写法都会被打包工具处理掉。
在 Webpack 中，内部有 [EnvironmentPlugin](https://webpack.js.org/plugins/environment-plugin/) 插件用于处理所有用到 `process.env` 的代码，把这些值通过 [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) 替换成静态的值。

在 `create-react-app` 的 [源码](https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/env.js) 中，使用正则表达式匹配只读取 `REACT_APP_` 开头的变量，以及这个库自身提供的一些变量，把这些传给 Webpack 的 `DefinePlugin`。因此用户在 `.env` 中定义的变量只有使用这个前缀，才能在代码中被访问到。
这么做的目的，可能是避免意外暴露编译项目的用户电脑上的一些环境变量。

> 如果用户在前端代码中直接使用 `process.env`，会导致出错。
> 但是 `create-react-app` 会把这段代码替换为一个所有可用的环境变量合成的对象，使得这段代码可以正常工作（但是会暴露这些变量）。参考上面链接中的代码的大约 102 行开始的内容。



# 对象存储都使用 S3 API 并带上 MIME

对于 Node.js 开发者而言，开发中肯定会接触到对象存储；对前端开发者而言，也会有上传 CDN 等操作，可能也会用到对象存储。
一般来说，我们会使用供应商提供的对象存储 SDK 来进行文件上传、下载等操作。

目前，亚马逊云对象存储 S3 的 API 已经成为各家厂商普遍兼容的标准，国内几乎所有的云服务供应商都兼容 S3 API 来访问他们的对象存储服务。

**所以，我们可以不使用供应商的对象存储 SDK，而是使用 S3 API。**
**这样，以后更换供应商时，仅需要修改一些地址、密钥参数就可以，不需要修改任何代码。**

这里以我自己的项目 [paperplane-api](https://git.paperplane.cc/jia-niang/paperplane-api) 为例，我使用的是腾讯云对象存储 COS：
之前的代码：

```ts
import COS from 'cos-nodejs-sdk-v5'

// 初始化实例
const cos = new COS({
  SecretId: '密钥 ID',
  SecretKey: '密钥 Key',
})

// 上传文件
cos.uploadFile(
  {
    Bucket: '存储桶名',
    Region: '地区',
    Key: '文件云端路径',
    FilePath: '本地文件',
  },
  function (err, data) {}
)
```

这样写，深度绑定的云服务供应商。以后如果换成阿里云或者其他家的云服务，那么这段代码可能要大幅改写。

现在换成了 S3 API 的写法：

```ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import mime from 'mime'

// 初始化实例
const s3Client = new S3Client({
  accessKeyId: '密钥 ID',
  secretAccessKey: '密钥 Key',
  region: '区域',
  endpoint: 'https://cos.区域.myqcloud.com',
})

// 上传文件操作
const uploadCommand = new PutObjectCommand({
  Bucket: '存储桶名',
  Body: '文件内容',
  Key: '文件云端路径',

  // ↓ 下面这行很重要，见下文
  ContentType: mime.getType('文件名或文件扩展名'),
})

// 上传文件
await s3Client.send(uploadCommand)
```

这样写，即使以后换了存储服务的厂商，只需要修改这里面的密钥等参数即可，不需要大幅改写代码。

-----

使用这类对象存储上传文件时，要注意尽量带上文件的 [MIME 类型](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_Types)。
可以看到 MIME 有 [很多种](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)，一般可以根据文件扩展名来判断，直接使用类似于 `mime` 这类包即可。

不提供 MIME 类型时，对象存储服务有可能会赋予默认的 MIME 类型 `application/octet-stream`，它表示是二进制数据。

如果把对象存储服务对接 CDN，浏览器在加载文件时，会根据响应的 `Content-Type` 的值来判断资源的 MIME 类型（浏览器也带有 MIME 嗅探功能）。**需要特别注意的是，CSS 的 MIME 类型是 `text/plain` 或是 `text/css` 等文本类型，如果服务端返回的响应其 `Content-Type` 是 `application/octet-stream`，那么浏览器很可能直接拒绝加载和应用这个 CSS 文件，此时没有任何报错提示；JS 文件也同理。**



# 写死的对象类参数放置在组件以外

先来看两段 antd 的栅格组件代码：
第一种用法：

```tsx
function MyComponent() {
  return <Row gutter={[16, 16]}></Row>
}

// 或者

function MyComponent() {
  const gutter = [16, 16]
  return <Row gutter={gutter}></Row>
}
```

第二种用法：

```tsx
const gutter = [16, 16]

function MyComponent() {
  return <Row gutter={gutter}></Row>
}
```

可以明显看出，第一种用法因为传递给 `<Row>` 组件的参数是一个数组（换成对象类型也一样），无论数组通过字面量传递还是通过变量传递，组件每次被创建时这个参数的引用都和上次不相同，所以会导致 `<Row>` 组件被重新创建，即使 `<Row>` 组件是被 `React.memo()` 创建出的。

而第二种用法，把数组或对象类型的参数放置在方法组件以外，它的引用被 “固定” 住，不会变化，因此 React 得以优化组件的渲染。

因此，如果组件接受对象/数组/方法类型的参数，如果参数无需修改，最好将参数变量抽取到方法组件代码的外部；如果参数可能被修改，也最好使用 `useState()` 或 `useMemo()` 固定住，从而避免每次方法组件执行导致子组件接收到的参数引用发生变化。

-----

此外，使用数组或对象类型的参数，还会涉及到解构的用法。请看下一个小节。



# 组件中的参数解构更好的用法

组件代码中，一般存在两种解构方式：解构 `props` 取出参数，以及解构参数中的对象类型。

解构 `props` 时，如果要设置默认值，需要注意入参的 `null` 值问题。
这里给出一段示例代码：

```tsx
const emptyFriendList = []

// 此组件接受一个参数 friendList，渲染好友列表
function MyFriends(props: { friendList?: string[] }) {
  const { friendList = emptyFriendList } = props

  return (
    <ul>
      {friendList.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
```

上述代码中，参数 `friendList` 为可选参数，如果不提供参数，那么将使用默认的空数组作为参数。
通常情况下，这段代码可以正常运行，即使 `friendList` 留空，也可以正常渲染，不会出错。但是，考虑到一种场景：**参数来源于 HTTP 请求的结果，此时如果后端返回一个 `null`，那么这段代码会直接报错。**

原因很好得出，因为 `const { friendList = emptyFriendList } = props` 这种解构方式，赋默认值的行为只在参数为 `undefined` 的情况生效，很容易遗漏 `null` 的情况，而后端返回的结果保不准就会有个 `null`。

因此，对于解构赋默认值的场合，可能需要考虑意外传入 `null` 值的场景，为此我们可能需要专门调整代码。

-----

第二种情况，通过解构取出对象或数组类型的参数，以此可以达成优化的效果。

设想一个移动端日期选择器组件，参数形如 `[2023, 10, 15]` 这种年-月-日的数组格式。
假设我们需要根据当前的 `year` 和 `month` 来生成选择 `date` 的列表：根据年份判断是否闰年，根据月份判断当月有多少天，此时组件内代码可能是这样的：

```tsx
function DatePicker(props: { value: [number, number, number] }) {
  const { value } = props
  const [year, month, date] = value

  const dateList = useMemo(() => {
  	return calcDateList(year, month)
    // ↓ 注意这里
	}, [year, month])

  // ...
}
```

我们对 `value` 进行解构，取出其中的年、月、日参数，此后就可以使用这些数值类型的参数，而不是使用对象格式的 `value`。
上面这种写法，使得 `date` 的列表仅依赖 `year` 和 `month` 两个数字。这两个数字不变时，不会重新计算 `date` 列表。

如果使用下面的写法，那么性能便会较差：

```tsx
function DatePicker(props: { value: [number, number, number] }) {
  const { value } = props

  const dateList = useMemo(() => {
  	return calcDateList(value[0], value[1])
    // ↓ 注意这里
	}, [value])

  // ...
}
```

这样使得 `date` 列表依据于 `value`，而它是一个对象，我们难以保证这个对象的引用不发生变化，所以这种写法的优化非常有限。



# 组件外显字段用 `ReactNode` 类型

开发常见场景：
开发一个组件，例如卡片，用户名等信息作为组件参数用于外显，开始使用 `string` 类型接收参数，满足需求：

```tsx
/** 用户卡片组件 */
function Card(props: { name: string }) {
  const { name } = props

  return <div>用户名：{name}</div>
}
```

后续产品经理要求，部分用户名可能会标红、标绿，甚至前面带个 Icon。
例如产品要求用户名前面加上 VIP 标记，此时我们可能会这样写：

```tsx
<Card name={<span><VipIcon />王小明</span>} />
```

但是 `name` 参数只接受字符串，所以这里要么使用 `// @ts-ignore` 之类的注释，要么就去修改组件源码。
如果一开始这个组件的 `name` 字段的类型就定为 `ReactNode`，使得用户名可以展示复杂内容，那么在后续开发中就不需要再来改一次了。

所以我们可以养成这样的习惯：
**所有需要在组件中仅用于外显的字段，尽量使用 `ReactNode` 类型，而不是 `string`。**



# 培养良好的语法习惯

开发时养成习惯，利好团队，一劳永逸。



## 方法类参数改为支持异步方法

原因也和上一条类似，提前做好兼容，避免以后这样的需求来临了，再回来改代码。

举个例子：
`vue-router` 的 [导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html) 有一个 `router.beforeEach()` 方法，传入一个回调函数，每次路由变化时都会调用这个函数，这个函数可以返回 `false` 来阻止这次路由操作。

这个函数就支持传入一个异步函数，导航的时候会等待该异步函数返回。这便给了我们开发时很多便利，例如可以发送一个请求来判断用户权限等。开发类似功能时，可以参考 `vue-router` 的这个设计，接受函数参数时兼容异步函数。



## 多写 `function`，少写 `const`

直接给出结论：方法能使用 `function` 声明的，尽量都使用这个写法，而不是用 `const` 后面接箭头函数。

例如：

```js
function someFunc() {}
// ↑ 上面的写法更为推荐
const someFunc = () => {}
```

当然，如果你的函数要作为构造函数，则必须使用 `function`；而如果你的函数代码中需要访问外部 `this`，则必须写成 `const` 和箭头函数。
这些场合是必须用特定的写法，没得商量。

推荐使用 `function` 原因有很多：

- `function` 声明的函数是有 “名字” 的函数，`const` 定义的是一个箭头函数，打印输出时是没有名字的；在特定的调试场合，`function` 函数更容易定位到位置；
- 只有 `function` 写法的函数可以使用 `arguments` 参数；
- 如果使用 TypeScript，只有使用 `function` 关键字声明的函数支持函数重载（这时也正好会需要用到 `arguments` 参数）；
- `function` 写法可以把方法返回值类型也放在开头；对于异步函数而言，通过 `async function` 可以一眼认出这是异步函数；`const` 写法的函数没有这么直观；
- `function` 可以被 JS 引擎自动 “提升”，对代码放置的先后位置不敏感，比如我们可以把工具类的函数放到文件最尾部，避免影响业务代码的阅读。



## 尝试 `void` 关键字

这个关键字很少见，甚至很多人从业多年几乎一次都没用过。

**最常见的是用在超链接里：**

```html
<a href="javascript:void(0);">超链接</a>
```

点击链接后不会跳转，有时用 JS 来实现超链接的功能。
当然 `href` 留空也可以，但部分浏览器可能会有默认行为，比如跳到页面顶端。

-----

**`void` 可以减少代码行数：**

下面示例中的函数，它只有一行代码，但是写成箭头函数形式时却要占用 3 行：

```js
const someFunc = () => {
  doSomething()
}
```

如果简写成这样，可能不太好：

```js
const someFunc = () => doSomething()
```

**这种写法，会导致 `someFunc()` 是一个带有返回值的函数，别人很可能会误用。**
此时，便可以使用 `void` 关键字：

```js
const someFunc = () => void doSomething()
```

这样的效果便和第一个示例一样了。

这个用法也适用于 React 组件：

```react
<Button onClick={() => void doSomething()}>按钮</Button>
```

还可以用在 IIFE 的场景：

```js
// IIFE 直接这样写，会报语法错误，一般都是用括号包起来：
function () { console.log('hello') }()

// 前面加上 void 关键字就能正常运行了
void function () { console.log('hello') }()

// 还可以用更简短的波浪符号（按位取反符号）
~ function () { console.log('hello') }()
```

这个用法在实际生产中不推荐，建议还是套上括号运行。

-----

早期 JS 规范不完善的浏览器版本中，`undefined` 是一个 `window` 上的全局变量，可以被改写。
此时，使用 `void 0` 关键字便可以得到 “原始” 的真正的 `undefined` 值。





# 避开 JS 标准库中的坑

开发时养成习惯，避免撞到这些坑。
本章节部分节选自我之前写的博文 [《JavaScript 标准库备忘》](https://paperplane.cc/p/460edd6d8f27/)。



## `encodeURIComponent()` 不符合规范，它转码的字符不全

JS 的 `encodeURIComponent()` 函数不会对 `!'*()` 这五个字符转码；不符合规范。示例：

```js
encodeURIComponent("!'()*") 
// 结果："!'()*"
// 这五个字符完全没有转码
```

可以用下面这个函数修复：

```js
function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
```

运行测试：

```js
fixedEncodeURIComponent("!'()*")
// 结果："%21%27%28%29%2a"

decodeURIComponent('%21%27%28%29%2a')
// 结果："!'()*"
// 可以正常解码
```

可以看到 `decodeURIComponent()` 可以正常解码，不需要修复。



## 在中国时区，传仅含日期的字符串调用 `new Date()`，时间是早 8 点而不是 0 点

如果使用的日期字符串仅包含日期不包含时间，那么创建出的 `Date` 对象是相对于世界时 0 时的地区时。
例如，中国是 GMT+8 时区，所以时间就是早上 8 点。

示例：

```js
new Date('2024-01-01')
// 结果：Mon Jan 01 2024 08:00:00 GMT+0800 (中国标准时间)
// 在中国时区，创建出的对象时间是早上 8 点
```

如果想避免这个问题，创建出 0 点时间，建议：

```js
new Date('2024-01-01 0:')
// 结果：Mon Jan 01 2024 00:00:00 GMT+0800 (中国标准时间)

new Date(2024, 0, 1)
// 这种调用方式月份从 0 开始
// 结果：Mon Jan 01 2024 00:00:00 GMT+0800 (中国标准时间)
```

或者使用 `dayjs` 等库，它们不会有这个问题。



## 不能用 `number.toFixed()` 来四舍五入

老生常谈的问题了，它既不是四舍五入，也不是银行家算法四舍六入。
实际开发中建议用 `lodash` 的 `_.round()`。



## JS 的按位运算是基于 32 位有符号整数来取结果的

举例：

```js
0b1 << 30 // 结果：1073741824

0b1 << 31 // 结果：-2147483648
// 此时补码最高位为 1，所以变成负数了

0b1 << 32 // 结果：1
// 溢出了
```

但是 JS 的数值类型本身支持的位数是很大的，位数远不止 32 位：

```js
2 ** 31 // 结果：2147483648
2 ** 32 // 结果：4294967296
2 ** 33 // 结果：8589934592
```



## `Number.isNaN()` 和全局的 `isNaN()` 存在区别

具体关系如下：

```js
isNaN === Number.isNaN       // false
isFinite === Number.isFinite // false

parseInt === Number.parseInt     // true
parseFloat === Number.parseFloat // true
```

两个 “is” 开头的函数是不一样的，两个 “parse” 开头的函数是全等的。

这里给出前者的区别：

- 全局 `isNaN()`，如果传入的值本身是数值，或者能转化为数值，那么返回 `false`，否则返回 `true`；
- `Number.isNaN()` 只在传入 `±NaN` 时返回 `true`，除此之外一切输入均返回 `false`。

对于 `isFinite()` 而言也一样，全局的会尝试把输入转化为数值，而 `Number` 上的方法只要输入的不是数值，统一返回 `false`。

