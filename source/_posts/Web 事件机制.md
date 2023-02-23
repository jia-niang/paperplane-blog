---
title: Web 事件机制
date: 2018-06-01 01:24:08
tags:
- JS
- WebAPI
categories:
- JS
---

我在看 cnblog 上的一篇 [有关前端面试的博文](https://www.cnblogs.com/hzg1981/p/5718157.html) 的时候，发现里面有一道很有研究价值的题目，是这样说的：
> 1、什么是浏览器事件模型？
>
> 2、请描述 JS 的事件冒泡和捕获？
>
> 3、如何停止事件冒泡？



这里博主给了我们回答：

- 浏览器事件模型是涉及到捕获、目标、冒泡三个阶段的事件模型；
- 捕获阶段是指事件从最外层元素一直向内直到触发事件的元素，冒泡阶段是反过来从触发事件的元素开始向外层元素传播；
- 停止冒泡使用事件对象的 `.stopPropagation()` 方法。（IE 中有所不同，是设置 `.cancelBubble` 属性）。



例如你有两个 `<div>` 元素是嵌套起来的，两者都有 `onClick` 事件处理函数，如果用户点击内层元素，那么两个 `<div>` 的 `onClick` 事件都会触发。

但是，具体是内层还是外层先触发？对于这一问题，早期 Netscape 和 IE 各有一套处理办法：

- Netscape 主张外层元素先触发，事件的触发顺序是由外往内，这样的事件模型称之为**捕获型**；
- IE 主张内层元素先触发，事件触发顺序是由内往外，这样的事件模型称之为**冒泡型**。



W3C 为了避免冲突，于是将事件分为3个阶段：**事件先是从捕获阶段开始，由外往内；到达触发事件的元素之后，在节点上触发事件，称之为目标阶段；最后再开始冒泡阶段，由内往外**。

如果你是 Web 开发人员，你可以选择在捕获阶段处理事件，或是在冒泡阶段处理事件，具体取决于你在绑定事件时使用的 `addEventListener` 函数的第三个参数。

当然，如果你在某个元素上绑定了监听器，那么**这个元素自身上触发的事件一定会触发这个监听器，无论它监听哪一个阶段**，因为这个元素为事件的目标，不存在冒泡还是捕获。

具体如何绑定监听器，可以向下继续阅读。另外，可以在 MDN 找到有关 [事件类别参考](https://developer.mozilla.org/zh-CN/docs/Web/Events) 以及 [事件对象的介绍](https://developer.mozilla.org/zh-CN/docs/Web/API/Event)，在阮一峰所编写的网道 Web 教程也有 [事件相关的介绍](http://wangdoc.com/javascript/events/eventtarget.html)。



# Web 事件简介
事件分为资源事件、网络事件、表单事件、鼠标键盘事件、媒体事件等多种类别，一部分事件被写入了 Web 规范当中，这些事件被称为标准事件。在 [MDN 事件参考](https://developer.mozilla.org/zh-CN/docs/Web/Events) 中可以查看所有事件以及标准事件。

所有事件对象都继承自 `Event` 类，具体还有几种类型，例如关系到鼠标点击的 `MouseEvent` 事件类型等，其他资源也有可能生成事件，例如视频播放暂停、网页动画的开始结束等。除了这些方式以外，JS 代码也可以创建、派发、捕获事件。

通常情况下，浏览器对一些事件有默认行为。例如：点击 `<input type="submit">` 这个按钮会自动提交表单。如果你给该 HTML 元素添加返回 `false` 的处理函数，或者是取消了该事件，那么自动提交表单这个行为便会被阻止。

Web 开发者要做的就是监听事件并对之做出处理，这就需要我们绑定对应的处理逻辑来处理事件，可以称之为事件监听器。



# 注册事件监听
注册事件有以下几种方式：



## HTML 属性

这是最初级的事件绑定方式，一般刚开始学 HTML 的时候就会学到。在 HTML 节点上添加一个 `on` 开头的属性，后面接上事件名；属性的值则是一段 JS 代码，它会被传入 JS 引擎直接执行。常见的使用方式如下：
``` html
<button onclick="alert('Hello world!')">
<body onload="handler()">
```
第一行代码给这个按钮绑定了 `click` 事件，用户点击后就会弹出提示框；第二行代码则会在页面加载的时候触发名为 `handler` 的方法。

这种方式存在一些问题：
- 首先，事件硬编码在 HTML 里面，因此事件的注册和事件处理的 JS 代码分离开来了，不利于维护，IDE 也会给出警告；
- 其次，无法为一个元素绑定多个事件；
- 这种事件处理方式固定在冒泡阶段处理。

因此，Web 开发中要避免这种通过 HTML 属性来绑定事件的方式。



## 节点的 JS 属性
执行以下 JS 代码：
``` js
button.onclick = function(e) {
  alert('Hi!')
}

// 也可以是一个函数名，例如：
// button.onclick = handler
```
这里在 `button` 这个元素上定义了一个名为 `onclick` 的方法，`on` 后面接的 `click` 便是监听的事件名，赋值的一个匿名函数则是事件处理函数。

**这种方法实际上是上面第一种方法的翻版**，因为所有 HTML 元素都继承了 `GlobalEventHandlers` 接口，因此支持这种在 HTML 元素上添加一个事件监听函数的方式；因此它也具备同样的问题：**事件名作为属性是硬编码的；无法添加多个事件监听器；固定在冒泡阶段处理事件**。



## 使用 `addEventListener` 方法

任何一个 HTML 元素都是继承了 `Element` 接口，而它继承了 `Node` 接口，而 `Node` 接口本身继承了 `EventTarget` 接口，因此任何 HTML 元素或是节点对象实际上都继承了 `EventTarget` 接口。

需要注意的是，很多对象（例如 `window` 和 `XMLHttpRequest`）也都实现了这个接口，这个接口可以看做是公共的事件处理接口。

`EventTarget` 接口有以下三个方法用于处理事件：

``` js
// 绑定事件监听器
target.addEventListener(type, listener, useCapture = false)

// 移除事件监听器
target.removeEventListener(type, listener, useCapture = false)

// 派发事件
target.dispatchEvent(event)
```
前两个方法的参数形式都相同，其中：

- `type` 表示你要监听/移除/触发的事件名；
- `listener` 表示事件处理函数；
- `useCapture` 默认为 `false` 的布尔值参数，表示在事件在**冒泡阶段**被触发，如果是 `true` 表示事件在**捕获阶段**被触发。此参数还可以传入一个对象，进行更具体的配置，下文会有详细的解释。

这种方式是最完备也是最规范的事件监听方式，它提供了绑定、移除、触发方法，可以在一个 HTML 元素或节点上定义多个事件，甚至可以控制事件在冒泡阶段还是捕获阶段处理。



# `EventTarget` 的事件 API
它提供以下几个方法：



## `addEventListener` 绑定事件监听器

使用 `addEventListener` 方法，即可为元素绑定事件处理器，它可以给一个元素绑定多个监听器，触发事件时，这些监听器会按照绑定的顺序依次被触发。

如何来使用，可以参考下面的例子：

``` js
function sayHello() {
  console.log('Hi!')
}

div.addEventListener('click', sayHello, false)
```
这里我们就给一个元素绑定了事件监听器，当触发 `click` 事件时，即用户点击了这个元素，就会调用事件的处理函数 `sayHello()`，从而在控制台打印了一串字符。

注意它的第三个参数为 `false`，表示在冒泡阶段处理事件，也就是说如果这个元素内部还有其他的绑定了点击事件监听器的元素，点击这个内部的元素时，内部元素的事件先触发，然后再冒泡到这个元素触发 `sayHello()` 函数。

将第三个参数改为 `true`，则会改为在捕获阶段处理事件，那么再点击内部的元素，先触发的就是这个 `sayHello()` 了。

-----

`addEventListener` 方法有以下几个特点：

**首先，多次添加同一阶段且同一处理函数的监听器是无效的：**

``` js
button.addEventListener('click', sayHello, false)
button.addEventListener('click', sayHello, false)
```
例如上面的代码，第二行实际上是无效的，因为同阶段同处理函数的监听器只能绑定一次。

但如果第二行的参数 `false` 改成 `true` 那么第二行代码就都有效了。

注意，如果将两行代码中的参数 `sayHello` 分别换成两个完全相同的匿名函数，例如都改成 `function() { }`，也是两行代码都有效的，因为匿名函数始终彼此不同，浏览器会把它们当成两个不同的处理函数，即使代码完全相同。



**其次，触发监听器的时候，会向处理函数中传入参数：**

将上面的 JS 代码改为：

``` js
function sayHello(e) {
  console.log(e)
  console.log(this)
}

div.addEventListener('click', sayHello, false)
```
当我们点击这个元素时，控制台会先打印出一个 `MouseEvent` 的对象，这是我们所触发的点击事件的一个**事件对象**，然后再打印出点击的这个元素，即 `this` 对象，这是点击事件触发的**原始目标**。

浏览器做了以下操作：

- 当事件触发的时候，浏览器会把这次事件触发的详细信息（例如如果是鼠标事件，则包含位鼠标的位置、点击的元素、是否按下了 Ctrl 和 Alt 这些按键等信息）包装成一个事件对象，作为第一个参数传给这个事件处理函数，例子里就是把事件对象传入 `sayHello(e)` 函数，作为其中的参数 `e`；
- 同时，事件处理函数内部的 `this` 会指向这个触发事件的元素。



**此外，该方法的第二和第三个参数都可以更详细的配置：**

第二个 `listener` 参数，除了可以是一个函数名、一个回调的定义之外，也可以是一个具备 `handleEvent` 函数属性的对象，事件将使用这个 `handleEvent` 函数属性来作为处理函数。

例如是这么一个对象：

``` js
const obj = {
  // 这个方法即为事件处理函数
  handleEvent(e) {
    console.log('Hi!')
  }
}

// 这样也是可以的，第二个参数是对象
div.addEventListener('click', obj, false)
```



第三个 `useCapture` 参数，除了可以是一个布尔值之外，还可以是一个对象，形式如下：

``` js
const option = {
  // 以下三个属性默认都是false
  
  // 表示是否在捕获阶段处理事件
  capture: true,
  
  // 事件是否只触发一次并自动移除
  once: true,
  
  // 浏览器将忽略监听函数调用 preventDefault 方法
  // 即：浏览器认为你放弃了 preventDefault 的权利
  passive: true,
}
```

这里的 `passive` 如果为 `true` 则表示此事件监听器无法通过调用 `preventDefault()` 来取消默认行为，开启此选项后也会使 `preventDefault()` 失效。

浏览器通常会认为滚动监听器中有可能取消滚动操作的默认行为，因此需要等到监听器函数执行完成后再决定滚动或是不滚动，这会产生延迟；开启 `passive` 选项后浏览器就不用等待滚动监听器执行返回了，直接滚动即可，因此它可以优化浏览器滚动。

目前很多浏览器会默认开启 `passive` 选项，或者根据用户交互情形自动开启它，具体可以参考 [这篇博客](https://www.cnblogs.com/ziyunfei/p/5545439.html)。

 

## `removeEventListener` 移除事件监听器

`removeEventListener` 的函数签名和 `addEventListener` 相同：

``` js
target.removeEventListener(type, listener, useCapture)
```
这里要注意的是，如果想移除某一个事件监听器，**该方法的三个参数必须与绑定时的三个参数相同**，因此不要使用匿名函数，因为 JS 引擎会将匿名函数判断为互不相同，即使它们的代码完全一样。

例如下面代码所示的情况：

``` js
button.addEventListener('click', function (e) {}, false)
button.removeEventListener('click', function (e) {}, false)
// 第二行代码无法移除前一行代码绑定的事件监听器
```
因此，如果你想在将来移除某个事件处理函数，那么定义它的时候尽量不要使用匿名函数，否则想移除它，会很麻烦。



> 实际上，第三个参数并不一定要和注册监听器时完全一样，只需要和注册事件监听器时的 `capture` 值一致即可。
>
> 例如注册事件监听器时第三个参数提供 `true`，那么移除监听器时第三个参数提供 `{ capture: true }` 也是可以的，提供 `{ capture: true, passive: true }` 这种也是可以，浏览器只考虑 `capture` 的状态。
>
> 不过不同的浏览器，实现方式可能有区别，因此建议第三个参数保持一致，可以避免出现兼容性问题。



## `dispatchEvent` 派发事件
`target.dispatchEvent(event)` 用于在当前节点上触发事件，其中 `event` 参数是一个 `Event` 类型的对象，这是一个**事件对象**，参数如果不符合则会直接报错。

它的使用方法如下：

``` js
button.addEventListener('click', sayHello, false)

// 下面定义一个事件对象，并用它触发事件
const e = new Event('click')
button.dispatchEvent(e)
```
上述代码在 `button` 这个节点上触发了 `click` 事件。

另外，`dispatchEvent()` 方法有一个返回值，表示事件是否被取消了，如果被事件取消了，它的返回值便是 `true`。



# `Event` 事件对象

简单介绍事件相关知识：



## 构造器

上面说了，当浏览器生成事件后，同时会产生一个事件对象作为参数传入事件处理函数中；我们使用 `dispatchEvent()` 方法来触发事件的时候也必须传入一个事件对象。

可以使用以下构造函数来创建事件对象：

``` js
new Event(type, option)
```
第一个参数 `type` 表示事件名称，例如 `'click'`、`'mouseover'` 等；

第二个参数是一个配置对象，它的形式如下：

``` js
const option = {
  // 以下属性均默认为 false
  
  // 表示事件对象是否冒泡
  bubbles: true,
  
  // 表示事件是否可取消
  cancelable: true,
}
```
**这里需要注意，只有将 `bubbles` 显示设置为 `true`，事件才会有冒泡阶段，否则生成的事件便只存在于捕获阶段**。

其中 `cancelable` 表示事件能否被 `preventDefault()` 取消，事件被取消就好像从未发生过，浏览器的默认行为也不会被触发。



## 事件实例的方法

事件对象具备以下方法：

`.preventDefault()`：取消浏览器的默认行为，例如点击链接后，浏览器会进行跳转，而使用该方法后浏览器就不会跳转了；**事件对象的 `cancelable` 如果不为 `true`，该方法无效**；

`.stopPropagation()`：阻止事件在 DOM 中继续传播，别的节点上定义的监听器均不会被触发了，不过当前节点上其他的监听器还是会触发；

`.stopImmediatePropagation()`：同上，并且令当前节点上其他监听器也不会触发了；

`.composedPath()`：返回一个数组，内容是从事件最内层节点依次至冒泡到的最外层，注意它会冒泡直到 `html`、`document` 最后到 `window`。



## 事件对象实例的属性

事件对象具备这些属性：

`.bubbles`：布尔值，只读，表示事件是否会冒泡；

`.eventPhase`：只读，表示事件处在何种阶段，意义如下：`0` 事件未发生，`1` 捕获阶段，`2` 目标阶段，`3` 冒泡阶段；

`.cancelable`：布尔值，只读，表示事件是否可被取消；浏览器生成的原生事件大都是可被取消的，**用户构造的则默认是不可被取消的，需要手动配置开启此属性**，不可被取消的事件，其 `preventDefault()` 方法无效；

`.cancelBubble`：布尔值，设置 `true` 时等同于调用 `stopPropagation()`，可以阻止事件传播；

`.defaultPrevented`：布尔值，只读，表示是否曾调用过该事件的 `preventDefault()` 方法；

`.currentTarget`、`.target `：表示事件传播到的当前节点、事件触发时的原始节点；

`.type`：事件类型名，例如 `'click'`，当然也有可能是用户构造时自行传入的名字；

`.timeStamp`：毫秒时间戳，表示事件发生的时间，自网页加载成功开始计算；

`.isTrusted`：布尔值，只读，表示事件是否用真实的用户行为产生而不是 JS 生成的；

`.detail`：事件的详情，表示用户操作的具体类型，例如点击为 `1` 双击为 `2` 等。



## 事件对象类型
事件类型有很多种，例如 `MouseEvent`、`KeyboardEvent`、`InputEvent` 等，它们都继承自 `Event`，用户也可以自行构造，例如：
``` js
new MouseEvent(type, initOption)
```
第二个可选参数可以配置该事件对象的初始属性。



以 `MouseEvent` 为例，这里列出几个常用的事件属性：

`screenX`、`screenY`、`clientX`、`clientY`：鼠标位置相对于屏幕/程序窗口的水平/垂直位置；

`ctrlKey`、`shiftKey`、`altKey`、`metaKey`：触发点击事件时是否按下了响应的快捷键；

`button`：表示按下的鼠标键：`0` 为左键，`1 ` 为中键，`2` 为右键；

`buttons`：是三个二进制比特位，从左往右依次表示中键、右键、左键；

`relatedTarget`：表示事件相关节点，默认为 `null`，如果是 `mouseenter` 或 `mouseover` 事件，表示鼠标离开的节点；如果是 `mouseout` 或 `mouseleave` 事件，表示鼠标将进入的节点。



如果要以 `KeyboardEvent` 事件为例，它具备表示按下按键的 `code` 和 `key` 属性。

-----

不同类型的事件具备不同的属性，具体可以查看 [网道 JS 事件教程](http://wangdoc.com/javascript/events/index.html)。

用户也可以自行生成对象，使用的类型为 `CustomEvent`，可以用它的构造函数直接创建，它的第二个参数只有一个 `detail` 属性，表示事件要携带的额外信息。

