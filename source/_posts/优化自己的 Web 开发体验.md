---
title: 优化自己的 Web 开发体验
date: 2024-02-21 21:40:00
tags: 
- JS
- DOC
categories: 
- JS
---

持续更新，记录 Web 和 Node.js 开发中经验技巧，优化开发体验。



# 避开 JS 标准库中的坑

**`encodeURIComponent()` 不符合 RFC 3986 规范，它转码的字符不全：**

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

-----

**在中国时区，传仅含日期的字符串调用 `new Date()`，时间是早 8 点而不是 0 点：**

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

-----

**不能用 `number.toFixed()` 来四舍五入：**

老生常谈的问题了，它既不是四舍五入，也不是银行家算法四舍六入。
实际开发中建议用 `lodash` 的 `_.round()`。

-----

**JS 的按位运算是基于 32 位有符号整数来取结果的：**

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

-----

**`Number.isNaN()` 和全局的 `isNaN()` 存在区别；`isFinite()` 也是：**

如下：

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

-----

（本章节部分节选自我之前写的博文 [《Javascript 标准库备忘》](http://localhost:4000/p/460edd6d8f27/)。）



# 尝试 `void` 关键字

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



# 组件参数把 `string` 全改为 `ReactNode` 类型

开发常见场景：
开发一个组件，例如卡片，用户名等信息作为组件参数，开始使用 `string` 类型接收参数，满足需求：

```tsx
interface CardProps {
  // 这里的 string 类型换成 ReactNode 是不是更好？
  name: string
}

/** 用户卡片组件 */
function Card(props: CardProps) {
  const { name } = props

  return <div>用户名：{name}</div>
}
```

后续产品经理要求，部分用户名可能会标红、标绿，甚至前面带个 Icon；
这时我们还需要去修改卡片的参数类型，从 `string` 改为 `ReactNode`，使得用户名可以展示复杂内容。

所以我们可以养成这样的习惯：
**所有需要在组件中显示的字段，都使用 `ReactNode` 类型，而不是 `string`。**



# 对象存储都使用 S3 API

对于 Node.js 开发者而言，开发中肯定会接触到对象存储。
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
import AWS from 'aws-sdk'

// 初始化实例
const s3 = new AWS.S3({
  accessKeyId: '密钥 ID',
  secretAccessKey: '密钥 Key',
  region: '区域',
  // 入口，因为是非亚马逊自家的存储服务，所以要提供这个参数
  endpoint: 'https://cos.ap-shanghai.myqcloud.com',
  apiVersion: '2006-03-01',
})

// 上传文件
s3.upload(
  { Bucket: '存储桶名', Key: '文件云端路径', Body: '文件内容' },
  function (err, data) {}
)
```

这样写，即使以后换了存储服务的厂商，只需要修改这里面的密钥等参数即可，不需要大幅改写代码。



# 多写 `function`，少写 `const`

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
- 如果使用 Typescript，只有使用 `function` 关键字声明的函数支持函数重载（这时也正好会需要用到 `arguments` 参数）；
- `function` 写法可以把方法返回值类型也放在开头；对于异步函数而言，通过 `async function` 可以一眼认出这是异步函数；`const` 写法的函数没有这么直观；
- `function` 可以被 JS 引擎自动 “提升”，对代码放置的先后位置不敏感，比如我们可以把工具类的函数放到文件最尾部，避免影响业务代码的阅读。
