---
title: JS 中的 Bitmask 使用
date: 2023-02-06 10:00:00
tags:
- JS
- WebAPI
- Node
categories:
- JS
---

Bitmask （中文可以叫掩码）是一种通过按位运算来使用一个数值来表示多个二进制位的方式，现在已经不提倡使用了，但是老的 API 以及早期的编程语言、操作系统等提供的 API 中还是有使用的。

Bitmask 主要用于提供多个开关选项的 API 中，但是因为其语义不明确且传参方式需要用到**按位或**运算符（`|`），所以现在大都是直接使用一个对象来传参。

不使用 Bitmask 的 API 设计，举个例子：

```js
// 给某个元素注册事件监听
button.addEventListener('click', eventHandler, {
  capture: true,
  once: false,
  passive: true,
})
```

注册事件监听时有三个可选项，现在都是使用这种键值对方式来开关选项的，语义很明确，如果涉及到条件判断等逻辑也很容易组织代码。如果使用 Bitmask 的方式来传参，可能会变成这个样子：

```js
// 注意，下面这段代码是虚构的，用于模拟 Bitmask 的传参方式

// 三个二进制位，从右往左依次表示 capture、once、passive 的开关
const EVENT_LISTENER_OPTION_CAPTURE = 0b001
const EVENT_LISTENER_OPTION_ONCE =    0b010
const EVENT_LISTENER_OPTION_PASSIVE = 0b100

// 以下传参方式同 { capture: true }
button.addEventListener('click', eventHandler, EVENT_LISTENER_OPTION_CAPTURE)

// 以下传参方式同 { capture: true, once: true }
// 这里使用按位或运算符，因为 (0b001 | 0b010) === 0b011
button.addEventListener('click', eventHandler, EVENT_LISTENER_OPTION_CAPTURE | EVENT_LISTENER_OPTION_ONCE)

// 以下传参方式同 { capture: true, once: true, passive: true }
// 这里使用按位或运算符，因为 (0b001 | 0b010 | 0b100) === 0b111
button.addEventListener(
  'click',
  eventHandler,
  EVENT_LISTENER_OPTION_CAPTURE | EVENT_LISTENER_OPTION_ONCE | EVENT_LISTENER_OPTION_PASSIVE
)
```

可以看到，这样传参很啰嗦，而且如果想通过代码判断逻辑来开关特定的选项也会很难写，因此 Bitmask 这种方式已经不再提倡了。

-----

目前 WebAPI 中还是存在一些使用 Bitmask 的 API 的，例如 [document.createNodeIterator(...)](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createNodeIterator)：

```js
// 下面是 DOM 中预定义好的参数，此处只是列举一下
const NodeFilter = {
  SHOW_ALL:                    0xffffffff, // 可以写作 -1，因为 ~0 === -1，等于说每一位都是 1
  
  SHOW_ELEMENT:                1 << 0,  // 1，   可以写成 0x00000001
  SHOW_ATTRIBUTE:              1 << 1,  // 2，   可以写成 0x00000002
  SHOW_TEXT:                   1 << 2,  // 4，   可以写成 0x00000004
  SHOW_CDATA_SECTION:          1 << 3,  // 8，   可以写成 0x00000008
  SHOW_ENTITY_REFERENCE:       1 << 4,  // 16，  可以写成 0x00000010
  SHOW_ENTITY:                 1 << 5,  // 32，  可以写成 0x00000020
  SHOW_PROCESSING_INSTRUCTION: 1 << 6,  // 64，  可以写成 0x00000040
  SHOW_COMMENT:                1 << 7,  // 128， 可以写成 0x00000080
  SHOW_DOCUMENT:               1 << 8,  // 256， 可以写成 0x00000100
  SHOW_DOCUMENT_TYPE:          1 << 9,  // 512， 可以写成 0x00000200
  SHOW_DOCUMENT_FRAGMENT:      1 << 10, // 1024，可以写成 0x00000400
  SHOW_NOTATION:               1 << 11, // 2048，可以写成 0x00000800
}

// 具体使用示例:
// 创建迭代器以遍历元素
document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT)

// 创建迭代器以遍历元素和文本
document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
```

因为 `document.createNodeIterator` 有多达12种的筛选模式，使用时有可能需要同时指定多种筛选模式，所以此 API 设计成使用 Bitmask 来传参；为了明确参数的语义，DOM 专门定义了 `NodeFilter` 对象来给这些选项赋予变量名。



上面的 `document.createNodeIterator` 是将 Bitmask 形式的值作为参数来使用的。WebAPI 中还有一些地方使用 Bitmask 形式作为返回值的，例如 `mousedown` 事件：

```js
div.addEventListener('mousedown', e => {
  console.log(e.buttons)
  // 此 e.buttons 即为使用 Bitmask 形式的值，表示按下了哪些按键
  // 它有三个二进制位
  // 0b001 表示左键按下
  // 0b010 表示右键按下
  // 0b100 表示中键按下
  
  // 例如： e.buttons === 3 也就是 0b011，即表示左键、右键同时按下
  // 例如： e.buttons === 5 也就是 0b101，即表示左键、中键同时按下
})
```

-----

Node.js 中同样有 API 应用到了 Bitmask。举例：

```js
const fs = require('fs')

// fs.access 方法的第二个参数是 Bitmask 形式

// 验证文件是否存在
fs.access('package.json', fs.constants.F_OK, err => { })
// 验证是否可读
fs.access('package.json', fs.constants.R_OK, err => { })
// 验证是否可读+可写
fs.access('package.json', fs.constants.R_OK | fs.constants.W_OK, err => { })

```



-----

如果想自行设计一个 Bitmask 参数的 API，可以使用以下方式来接收参数：

```js
// 这里的参数 bitmask 是一个 Bitmask 方式传入的参数
// 假设 Bitmask 有三个选项，因此有三位

function testBitmask(bitmask) {
  // 判断是否开启 0b001 位
  if (bitmask & 0b001) { }
  
  // 判断是否开启 0b010 位
  if (bitmask & 0b010) { }
  
  // 判断是否开启了 0b001 或 b010 其中任一个，可以当做“或”操作
  if (bitmask & (0b001 | 0b010)) { }
  if (bitmask & 0b011) { }
  
  // 判断是否同时开启了 0b001 和 0b010，可以当做“且”操作
  if ((bitmask & 0b001) && (bitmask & 0b010)) { }
  if ((bitmask & 0b011) === 0b011) { }
}

// 如果想开启所有位，可以直接这么传
testBitmask(-1)

// 开启 0b001
testBitmask(0b001)

// 开启 0b100 和 0b001
testBitmask(0b001 | 0b100)
testBitmask(0b101)
```

调试的时候，可以通过 `.toString(2)` 来得到数值的二进制表示。

-----

如果想熟练的使用 Bitmask，必须了解位运算。这里给出常用的位运算方法：

```js
let bitmask = 0

// 开启第四位
bitmask |= 1 << 3
// bitmask = 00001000

// 关闭第四位
bitmask &= ~(1 << 3)

// 翻转第四位
bitmask ^= 1 << 3
```

