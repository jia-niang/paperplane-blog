---
title: jQuery API 备忘
date: 2019-02-02 10:00:00
tags:
- JS
- Cheatsheet
categories:
- JS
---

jQuery 现在已经几乎不再用了，但是它的 API 设计值得学习。本文仅做备忘用，方便日后维护老项目时的查询需求。
本文于 2023 年更新，现在基于 jQuery 版本 3+。注意 jQuery 在 v3 后废弃了大量 API，本文不记录被废弃的 API，如果查不到，建议看官网原文档。

相关链接：[jQuery 官网 API 文档](https://api.jquery.com/)，[jQuery 源码分析](https://www.cnblogs.com/aaronjs/p/3279314.html)，[国人做的 API 速查表](https://jquery.cuishifeng.cn/)。

<script src="https://code.jquery.com/jquery-3.7.1.js" async integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>

本文页面已部署 jQuery v3.7.1，你可以在 F12 控制台通过 `$` 或 `jQuery` 来访问它。



# 选择器语法

**选择器语法：**

- jQuery 选择器接受第二个参数作为搜寻范围，默认为 `document`

- `$('div.userinfo')` 查询选择器
- `$.escapeSelector(n)` 将选择器专用字符转义，例如 `#a` 会转为 `\#a`

**jQuery 扩展的选择器伪类（原生不支持）：**

- `:text` / ` :password` / ` :radio` / ` :checkbox` / ` :file` / `:reset` / `:submit`
  对应类型的表单元素
- `:visible` / `:hidden` 选择可见/隐藏元素
- `:image` / `:input` 图片/输入控件元素
- `:enable` / `:disable`  可用/禁用的表单元素
- `:checked` 已勾选的复选框、单选框，以及被选中的 `<option>`
- `:selected` 被选中的 `<option>`
- `:animated` 处于动画状态的元素
- `:contains(t)` 内容文本包含 `t` 的元素，大小写需严格匹配
- `:has(a)` 选择带有符合 `a` 选择器的元素的元素
- `:parent` 选择含有任意子元素或内容的元素

 

# DOM 集合

**返回原生 DOM 元素的方法：**

- `.get(2)` 获取集合中的第 3 个元素，也可以写成 `[2]`，但它还支持负数
  `.get()` 获取集合中所有元素
- `.first()` / `.last()`
  返回集合中第一个/最后一个元素，等同于 `.get(0)` / `.get(-1)`
- `.toArray()` 将所有 DOM 以数组形式返回

-----

以下方法返回新的 jQuery 对象，且不会对原 DOM 集合进行任何修改

**集合相关：**

- `.length` 获取集合的元素数量，和已废弃的 `a.size()` 作用相同
- `.clone([e][, d])` 克隆元素，`e` 表示是否复制事件和数据，`d` 表示是否递归到所以子元素
- `.index(selector | el)` 获取选择器/元素在 DOM 集合中的索引位置，不存在则返回 `-1` 
  `.index()` 返回集合中首个元素在其同级元素中的索引位置
- `.each(cb)`，回调参数 `function(index, el)`
  同数组的 `forEach`，回调中可以通过 `this` 获取当前元素，回调返回 `false` 则会停止迭代
- `.map(cb)`，回调参数 `function(index, el)`
  同数组的 `map` 操作，但此方法最终返回一个新的 jQuery 对象
- `.is(selector | cb)` 判断集合中是否有任意元素匹配选择器/回调

**过滤方法：**

- `.eq(4)` / `.eq(-5)` 
  返回集合中正数第 5 个/倒数第 5 个元素；正数从 `0` 开始，倒数从 `-1` 开始
- `.even()` / `.odd()`
  滤出集合中偶数/奇数的元素
- `.filter(selector | cb)` / `.not(selector | cb)` 
  同筛选/反向筛选，返回一个筛选后的结果
- `.find(selector)` 从集合中所有元素的子元素中应用选择器，返回这些新元素的集合
- `.has(selector | el)` 返回集合中含有指定子元素的元素
- `.slice(start [, end])` 同数组的 `slice` 操作



# DOM 相对选择

这些方法返回 jQuery 对象后，可以一直调用方法来链式筛选、移动、增加元素

**链式操作：**

- `.add(el | selector)` 将新的元素加入 DOM 集合
- `.addBack()` 使用了 `.next()` 之类的方法选择其他 DOM 时，可以把之前的元素加入集合
- `.end()` 回退到上一次调整 DOM 集合内容之前的内容

-----

以下所有的 `filter` 参数，均为可选，表示提供一个选择器字符串，用于进一步筛选

**后代元素：**

- `.children([filter])` 返回 DOM 集合元素的所有**直接**子级元素
- `.contents()` 返回 DOM 集合元素的所有子节点，包含文本节点

**祖先元素：**

- `.parent([filter])` 返回**直接**父级元素
- `.parents([filter])` 类似于 `parent`，但它返回所有父级元素
- `.parentsUntil([el] [, filter])` 类似于 `parent`，但会返回满足条件的前一层
- `.closest(filter)` 从元素自身向父级开始，返回匹配的第一个元素
- `.offsetParent()` 返回可用于定位的第一个父级元素，可定位元素的 `position` 为 `relative` 或 `absolute`

**同级元素：**

- `.next([filter])` / `.prev()`
  选择当前元素后面/前面的第一个元素
- `.nextAll([filter])` / `.prevAll()`
  类似上一个方法，但会选择后面/前面的所有元素
- `.nextUntil(selector [, filter])` / `.prevUntil()`
  从当前元素开始向后/向前，一直选中直到找到匹配选择器的元素，但不包含匹配选择器的元素
- `.siblings([filter])` 选择当前元素的其他所有同级元素



# DOM 移动和修改

**创建元素：**

- `$(html [, props])` 创建 DOM 元素，`html` 为标签字符串，`props` 为属性和事件监听器

-----

以下方法未特别说明的，返回值均为原 jQuery 对象

**以下方法的 `el` 参数：**

- 可以是字符串、HTML 字符串，注意不支持选择器字符串
- 可以是 jQuery 对象、元素，**这些元素会被移走**
- 也可以是一个返回上述内容的方法，此时会针对 DOM 集合中的元素依次执行此方法；方法签名 `function(index, htmlString)`，参数分别表示当前元素在 DOM 集合中的索引、当前元素的 HTML 字符串，在方法中使用 `this` 来访问当前元素

**元素内部：**

- `.append(el)` 向当前元素内部的**末尾**追加内容
- `.appendTo(el)` 将当前元素追加到 `el` 内部的**末尾**
- `.prepend(el)` 向当前元素内部的**开头**追加内容
- `.prependTo(el)` 将当前元素追加到 `el` 内部的**开头**

**元素外部：**

- `.after(el)` 向当前元素外部**后面**追加内容
- `.insertAfter(el)` 将当前元素插入到 `el` 的**后面**
- `.before(el)` 向当前元素外部**前面**追加内容
- `.insertBefore(el)` 将当前元素插入到 `el` 的**前面**

**包裹：**

- `.wrap(el)` 使用 `el` 来依次包裹当前 DOM 集合中的每个元素，返回值不变
- `.unwrap([selector])` 移除当前元素外层元素，返回被移除掉的元素空标签
- `.wrapAll(el)` 使用 `el` 来包裹当前 DOM 集合内的所有元素，返回包裹后的整体
- `.wrapInner(el)` 当前元素的**内部**生成 `el` 包裹原本元素内部的内容，返回值不变

**增删改：**

- `.replaceWith(el)` 使用 `el` 取代当前元素，返回被取代掉的元素
- `.replaceAll(el)` 使用当前元素依次取代 `el` 集合的所有元素，返回被取代掉的元素
- `.empty()` 将当前元素所有子节点清空，返回值不变
- `.remove([selector])` 删除当前元素，返回值不变
- `.detch([selector])` 同上条，但是此方法会保留元素的数据和事件监听，返回值不变

**排序：**

- `.uniqueSort()` 对 DOM 集合中的元素按照文档顺序排序并去重，返回新的结果



# DOM 属性

如果 DOM 集合包含多个元素，以下方法仅对首个元素起效；设置值类方法均返回原对象

**标签属性：**

- `.attr(key)` / `attr(key, value | cb)` 
  获取/设置属性，参数也可以是一个对象以设置所有键值对
- `.prop(key)` / `.prop(key, value | cb)`
  同上一条，但可用于获取和设置 `checked`、`disable` 等属性，可以取到 `true` 和 `false`
- `.removeAttr(key)` 移除属性
- `.removeProp(key)` 对应 `prop` 用于移除属性

**类操纵：**

- `.hasClass(name)` 是否含有类名

- `.addClass(name)` 给元素添加类名，多个类名用空格分开
- `.removeClass(name)` 移除元素的类名，多个类名用空格分开
- `.toggleClass(name [, trueToAdd])` 添加/移除类名，第二个参数可以是布尔值或回调

**内容操纵：**

- `.html()` / `.html(text| cb)` 获取或设置 `innerHTML`
- `.text()` / `.text(text | cb)` 获取或设置 `textContent`
- `.val()` / `.val(value)` 获取或设置表单元素的值

**数据值属性：**

- `.data(key)` / `.data()`
  获取元素特定键的数据值/所有数据值键值对，可以获取到 HTML 中的 `data-` 标签的内容，特性：
  - 会自动转换键名，API 中的 `lastName` 在 HTML 中为 `last-name`，反之同理
  - 会自动解析类型，可以从 HTML 属性中直接解析出 `null`、对象、数组、数值、布尔值
  - 初始值可以从 HTML 标签的 `data-*` 属性中获取，**但获取一次后即被记住，修改标签属性后无法获取最新值**
- `.data(key, value)`
  设置元素的数据值，由 jQuery 管理，注意它**不会**在元素的 HTML 标签上放置 `data-*` 属性
- `.removeData(key)` / `.removeData()`
  移除元素特定键的数据值/移除元素所有数据值，它也**不会**修改 HTML 标签的 `data-*` 属性
- `$.hasData(el)` 判断目标元素是否曾被 jQuery 附加过数据对象，返回布尔值
  `el` 是 DOM 元素，不同于 `.data(key)`，此方法没有任何副作用



# 样式与尺寸

如果 DOM 集合包含多个元素，以下方法仅对首个元素起效

**样式控制：**

- `.css(key)` / `.css(key, value)`
  设置/获取 CSS 属性值，会自动添加诸如 `-webkit-` 的前缀，尺寸会自动添加 `px` 后缀
- `$.cssHooks` 
  用于自定义特定 CSS 规则的设置和获取逻辑；使用时需要在此对象上挂载键值对：
  - 键形如 `"borderRadius"`，此时它也会自动对 `"border-radius"` 生效
  - 值形如 `{ get(el, computed, extra) {}, set(el, value) {}}`
- `$.cssNumber`
  例如设置 `$.cssNumber.width = false`，用 `.css()` 设置宽度就不再自动加上 `px` 后缀了

**位置偏移：**

以下方法中 “偏移” 指的是是一个带有 `top` 和 `left` 属性且值均为数值的对象

- `.offset()` / `.offset(obj | cb)` 获取/设置元素相对于文档位置的偏移
- `.position()` 获取元素相对于父元素的偏移，它不能用于设定偏移
- `.scrollTop()` / `.scrollTop(num)` 获取/设置元素的垂直滚动位置
- `.scrollLeft()` / `.scrollLeft(num)` 获取/设置元素的水平滚动位置

**尺寸操控：**

以下方法返回值或参数均不带单位

- `.height()` / `.height(num | cb)` 获取或设置元素**内容**的计算高度
- `.width()` / `.width(num | cb)` 获取或设置元素**内容**的计算宽度
- `.innerHeight()` / `.innerHeight(num | cb)` 获取或设置元素的**边框内**计算高度
- `.innerWidth()` / `.innerWidth(num | cb)` 获取或设置元素的**边框内**计算宽度
- `.outerHeight([includeMargin])` / `.outerHeight(num | cb [, includeMargin])`
  获取或设置元素的最外层计算高度，`includeMargin` 开启则还会包含外边距
- `.outerWidth([includeMargin])` / `.outerWidth(num | cb [, includeMargin])`
  获取或设置元素的最外层计算宽度，`includeMargin` 开启则还会包含外边距



# 效果和动画

**全局：**

- `$.fx.off` 设置为 `true` 将立即完成当前所有动画，且后续的动画也不再生效

下文中所以动画方法均支持使用一个对象来传递完整参数，具体请参考 [官方文档](https://api.jquery.com/)
如果使用参数来传递，参数统一定义如下：

- `d` 为持续时间，是一个表示毫秒数的数值，默认 `400`
- `e` 为缓动，定义动画的过渡速率，默认 `'swing'` 先快后慢，可改为 `'linear'` 表示线性
- `cb` 为动画完成后的回调，被 `.stop()` 的动画不会调用它，但 `.finish()` 会调用

**缩放显隐：**

- `.show([d] [, e] [, cb])` / `.hide([d] [, e] [, cb])`
  缩放显示/隐藏元素，**如果不传任何参数，将立即显示/隐藏元素，没有动画**
- `.toggle([d] [, e] [, cb])`
  在缩放显示/隐藏元素之间切换，**也可以传布尔值表示显示/隐藏，此时也没有动画**

**滑动显隐：**

- `.slideDown([d] [, e] [, cb])` / `.slideUp([d] [, e] [, cb])`
  通过向下展开/向上收起来展示/隐藏元素
- `.slideToggle([d] [, e] [, cb])` 
  切换滑动隐藏和显示

**淡入淡出：**

- `.fadeIn([d] [, e] [, cb])` / `.fadeOut([d] [, e] [, cb])`
  淡入显示/淡出隐藏元素
- `.fadeToggle([d] [, e] [, cb])`
  切换淡入淡出显示隐藏元素
- `.fadeTo(d, o [, e] [, cb])`
  将透明度淡入淡出到参数 `o` 的值，`o` 是一个 0 到 1 之间的数字

**自定义动画：**

- `.animate(p [, d] [, e] [, cb])`
  给出目标 CSS 键值对对象 `p`，jQuery 会使元素过渡到这个状态，关于这个对象：
  - 只支持一些可以过渡的属性，且组合属性建议拆开来写，属性值需要带单位
  - 键名自动转换驼峰式写法，且还支持 `scrollTop`、`scrollLeft` 等非 CSS 属性
  - 值可以使用特殊值 `'show'`、`'hide'`、`'toggle'`，jQuery 会记住原始值并切换
  - 值如果是数值类型，还可以使用例如 `+=50px` / `-=30px` 这种写法


**动画控制：**

以下函数还支持在开头加一个参数 `qn`，表示队列的名字，动画队列名字默认为 `'fx'`

- `.stop([clear] [, end])`
  停止当前活动中的动画效果，`clear` 为是否清空排队中的动画，`end` 为是否立即完成当前动画
- `.delay(d)` 推迟等待一段时间
- `.finish()` 立即完成当前活动中和排队中的所有动画



# 事件

**管理事件：**

- `.on(e, fn)` / `.on(e [, data], fn)` 绑定事件监听器，参数如下：
  - `e` 是不带 `on` 开头的事件名，多个用空格分隔；可以在事件名后面加 `.` 然后接命名空间名，例如 `click.testMode`
  - `data` 会成为事件回调的 `event.data` 的值
  - `fn` 是事件监听器，也可以传 `false` 表示一个简单的返回 `false` 的函数
- `.off(e [, fn])` 移除事件，参数和用法同上；不提供任何参数调用会移除所有时间监听器
- `.one(e [, data] , fn)` 设置触发一次后就移除的事件，参数同 `.on()`
- `.trigger(e [, params])` 触发事件，可用 `params` 数组给事件监听器传递更多 REST 参数
- `.triggerHandle(e [, data])` 仅触发元素的事件监听器，但存在以下区别：
  只对集合中首个元素生效；不触发元素的默认行为；不冒泡；返回对象监听器运行后的返回值

**事件监听器速记：**

从 jQuery 3.3 开始，几乎所有速记方法均被废弃，建议自行使用 `.on()` 来绑定

- `$(cb)`
  文档准备完成后触发回调，这也是官方推荐的写法，jQuery 自身会作为回调的第一个参数
  此回调中出错时错误会传给 `$.readyException` 方法，你可以将一个异常处理函数赋值给它 

**jQuery 事件对象：**

jQuery 所有事件都有 `target`、`relatedTarget`、`pageX`、`pageY`、`which`、`metaKey` 属性；此外，jQuery 还会从原始事件对象上拷贝部分属性；可以通过 `.originalEvent` 访问原始对象

- `$.Event(name [, props])` 构造一个 jQuery 事件，也可以使用 `new`
- `.originalEvent` 访问原始事件对象
- `.namespace` 事件的命名空间
- `.delegateTarget` 附加当前监听器的元素，对非委托场合而言等于 `.currentTarget`
- `.which` 规范化鼠标和键盘事件，数字 1-3 表示鼠标左/中/右键，其他表示按键 `charCode`
- `.data` 使用 `.trigger()` 触发事件时可提供一个参数
- `.result` 元素所有监听器中最后一个非 `undefined` 的返回值



# AJAX

**请求方法：**

- `$.get(url [, data] [, success] [, dataType])` /
  `$.post(url [, data] [, success] [, dataType])`
  它们的参数相似，且都返回 jQuery XHR 对象，特性：
  - 可以只使用一个对象作为参数，使用上面对应的键名作为对象的键名即可
  - `url` 是请求地址，`data` 是发送的数据，`success` 是回调，`dataType` 是期望的返回类型

- `$.getJSON(url [, data] [, success])`
  使用 GET 请求加载 JSON 数据，它也会自动判断并应用 JSONP
- `$.getScript(url [, success])`
  加载一个 JS 文件并执行
- `$.ajax(url [, setting])` / `$.ajax(setting)`
  使用键值对配置发起请求，可用 `$.ajaxSetup()` 来设置全局 AJAX 参数
- `.load(url [, data] [, success])` **此方法应用于 jQuery DOM 对象**
  - 默认 `GET` 请求，但如果有 `data` 对象则使用 POST 请求
  - 请求成功后，会把结果当做 HTML 来替换掉当前的 DOM 内容
  - `url` 参数尾部加个空格后，可以提供一个选择器字符串，用于提取结果 DOM 的一部分

**常用参数：**

- `url` / `type` / `headers` / `timeout` / `async`
  请求地址/方法/附加请求头/超时毫秒（默认 `0`）/是否异步（默认 `true`）
- `data` 
  请求提交的数据，GET 请求时会自动调用 `$.param()` 序列化为 URL 查询参数
- `dataType`  取值 `'json'`、`'html'`、`'script'`、`'xml'`、`'text'` 和 `'jsonp'`
  预期返回的数据类型，如果不指定，jQuery 会根据响应的 MIME 来自动计算

- `xhrFields` 向 XHR 中追加的键值对
  例如，追加 `{ withCredentials : true }` 可以发带 Cookie 的 CORS 请求

**回调函数：**

以下回调函数中，可使用 `this` 获取 AJAX 方法的配置参数对象

- `success` 请求成功，签名 `function(result, textStatus, jqHXR)`
- `error` 请求失败，签名 `function(jqXHR, textStatus, errString)`
- `complete`：请求完成触发，无论成功或失败，签名 `function(jqXHR, textStatus)`

- `beforeSend` 发送前触发，签名 `function(jqXHR, setting)`
  此回调返回 `false` 可以取消本次请求
- `dataFilter` 预处理响应的数据，签名 `function(data, dataType)`
  此回调的返回值会成为响应数据
- `statusCode` 处理各种状态码的键值对集合，例如 `{ '404': function() {} }`

**不常用的参数：**

- `accepts` 
  配合 `dataType` 使用，一个键值对，键为自定义数据类型，值为映射到的 MIME 类型

- `cache` 默认 `true`
  表示是否缓存请求，但 `dataType` 为 `'script'` 或 `'jsonp'` 时默认为 `false`
- `contents`
  由字符串-正则组成的键值对，指定 jQuery 解析返回的数据时依据的模式
- `context` 默认为请求配置对象
  设置该值，可以修改回调函数中的 `this` 的值
- `converters`
  由字符串-函数组成的键值对，用于让 jQuery 对 `dataType` 进行转换
- `crossDomain` 同域默认为 `false`，跨域默认为 `true`
  当前请求是否跨域，注意如果同域的地址有跳转，则需要显式设为 `true`
- `global` 默认 `true`
  是否触发全局 AJAX 事件
- `ifModified` 默认 `false`
  是否仅在服务器数据更改时才使请求成功，这用到了 `Last-Modified` 响应头
- `isLocal` 默认值取决于当前协议
  是否允许当前的位置被认定为本地
- `jsonp`
  在发出 JSONP 请求时，指定 URL 查询参数 `callback=` 参数的值
  可设为 `false` 来禁用 JSONP
- `jsonpCallback`
  在发出 JSONP 请求时，指定响应中回调函数的函数名，一般必须要和上一个参数相同
- `mimeType`
  用于覆盖原 XHR 的 MIME 类型
- `username` / `password`
  设定 HTTP 认证的用户名和密码
- `processData` 默认 `true`
  如果 `data` 参数是对象，是否自动处理它
- `scriptCharset`
  在 `dataType` 为 `'script'` 时可用，修改 `<script>` 标签的 `charset` 属性
- `scriptAttrs`
  为 `'script'`、`'jsonp'` 请求的 `<script>` 标签附加属性，例如 `nonce`、`integrity` 属性
- `traditional`
  使用 `$.param()` 序列化参数时，第二个参数是否指定为 `true`

**AJAX 全局配置项：**

- `$.ajaxPrefilter([dataType,] handler)` 在每个 AJAX 发出前会触发该 `handler` 回调修改请求配置参数
  - `dataType` 是包含一个或空格分隔的多个表示 `dataType` 类型所组成的字符串
  - `handler` 是回调函数，签名 `function(options, originalOptions, jqXHR )`
    分别为请求配置、给 `$.ajax()` 配置的默认请求配置、请求的 jQuery XHR
- `$.ajaxTransport([dataType,] handler)` 处理请求的发送和中断，详情见 [官方文档](https://api.jquery.com/jQuery.ajaxTransport/)
- `$.ajaxSetup(options)` 接受一个对象，为所有 AJAX 设置默认参数，此方法不推荐使用
- `$.param(obj [, trad])` 将表单、数组、对象序列化为 URL 查询参数
  参数 `trad` 设为 `true` 将使用传统方式浅层序列化，值为对象时将序列化为 `'[object+Object]'`
- `.serialize()` 将表单 DOM 序列化为字 URL 查询参数
- `.serializeArray()` 将表单 DOM 序列化为数组，其中每个对象包含 `.name` 和 `.value` 属性



# 核心与工具方法

**扩展：**

- `$.noConflict([restore])`
  让出当前 jQuery 占用的全局变量，用于在 `$` 变量名冲突时使用，传入 `true` 时会还原
- `$.extend(p)` 在 jQuery 的**全局**上挂载方法或属性（还能用来拷贝对象，见工具一段）
- `$.fn.extend(p)` 在 jQuery 的 **DOM 集合**上挂载方法或属性
  挂载的方法中可用 `this` 表示 jQuery 元素对象的自身
- `$.error(message)` 使用指定错误信息抛出异常
  jQuery 遇到异常也会调用它，所以可以使用一个函数给它赋值

**队列控制：**

- `$.queue(el [, name])` / `$.queue(el, name, newQueue | cb)`
  获取/设置一个元素的函数队列
  - `name` 是队列名，默认为 `'fx'` 表示动画效果
  - `newQueue` 是新的队列数组，会替换掉原来的队列；若是 `cb` 回调则会追加到队尾执行
- `$.dequeue(el [, name])`
  执行并移除队列中下一个函数，`name` 是队列名，默认为 `'fx'` 表示动画效果

- `.queue([name])` / `.queue(name, newQueue | cb)` 
  同 `$.queue()`，应用于当前选择器的 DOM
- `.dequeue([name])`
  同 `$.dequeue()`，应用于当前选择器的 DOM
- `.clearQueue([name])` 
  清空队列中的所有函数，`name` 是队列名，默认为 `'fx'` 表示动画效果

**工具方法：**

- `$.jquery` 获取 jQuery 的版本号字符串
- `$.globalEval(code)` 在全局上下文中执行 JS 代码，完整配置见 [官方文档](https://api.jquery.com/jQuery.globalEval/)
- `$.parseHTML(data [, context] [, keepScripts])` 将字符串解析为 DOM 节点
- `$.parseXML(data)` 将字符串解析为 XML 文档
- `$.noop` 空函数

**数组与对象：**

- `$.each(obj | arr , fn)` 
  可遍历对象或数组，`fn` 的回调签名 `function(key, value)`
- `$.extend([deep,] target [, …obj1])` 
  合并后续的对象到第一个对象并返回，`deep` 设为 `true` 则会深拷贝
- `$.grep(arr, fn [, invert])` 
  类似于数组的 `.filter()`，`invert` 如果开启则改为返回原本要丢弃的元素
- `$.makeArray(obj)` 
  将伪数组转化为真数组，`obj` 也可以传 jQuery 选择器对象
- `$.map(arr | obj, fn)` 
  可以遍历数组或对象，回调签名 `function(value, key)`，返回 `null` 或 `undefined` 时会移除元素
- `$.inArray(value, arr [, fromIndex])` 
  在数组 `arr` 中查找 `value` 的索引，`fromIndex` 默认为 `0` 表示搜寻起始，找不到返回 `-1`
- `$.merge(fir, sec)`
  将第二个数组上的内容接在第一个数组后面并返回，**此方法会修改第一个参数的数组**
- `$.uniqueSort(arr)`
  对数组内容排序并移除重复项目，返回新的结果

**检测判断：**

- `$.contains(outer, inner)`
  判断 DOM 是否有包含关系，第一个参数必须是 DOM 元素，第二个参数不支持文本和注释
- `$.isEmptyObject(obj)`
  判断是否是空对象，此方法还会沿着原型链判断
- `$.isPlainObject(obj)`
  判断是否是普通对象，即通过 `{}` 或 `new Object()` 创建的，而不是来自宿主
- `$.isXMLDoc(node)`
  判断是否是 XML 文档或在 XML 文档内



# 回调列表（发布订阅）

**创建：**

- `$.Callbacks(flags)`
  创建一个 jQuery 的回调列表，`flags` 是以空格分隔的表示标志的字符串：
  - `'once'` 该回调列表只能被触发一次
  - `'memory'` 之前触发的参数被记住，新回调添加时也会执行一遍
  - `'unique'` 确保回调不能被重复添加
  - `'stopOnFalse'` 任意回调返回 `false` 时中断回调

**用法：**

回调列表支持链式操作，以下函数返回回调对象本身

- `.add(fn)` / `.remove(fn)` / `.empty()` 添加/删除/清空回调函数
- `.has(fn)` 判断列表中是否存在某个回调
- `.fire(…args)` / `.fired()`
  用给定的参数触发回调列表中的所有回调/确认是否曾调用过
- `.fireWith([context] [, argArr])`
  使用 `context` 的上下文来触发回调，第二个参数可以是一个数组，会以 REST 方式传给回调函数
- `.lock()` / `.locked()`
  锁定回调列表并阻止增删和触发回调函数，但对 “memory” 回调存在[特殊处理](https://api.jquery.com/callbacks.lock/)/确认是否被锁定
- `.disable()` / `.disabled()`
  禁用回调列表/确认是否被禁用

 

# 延迟对象

**延迟对象创建：**

- `$.Deferred([beforeStart])` 创建并返回一个 Deferred 对象。
  - `beforeStart`
    将在该 Deferred 返回之前调用，将这个 Deferred 对象将作为第一个参数传入

**改变状态：**

- `.resolve(args)` / `.resolveWith(context [, …args])`
  成功执行延迟对象/以指定上下文成功执行
- `.reject(args)` / `.rejectedWith(context [, …args])`
  拒绝延迟对象/以指定上下文拒绝
- `.notify(args)` / `.notifyWith(context [, …args])`
  通知延迟对象执行中进度/以指定上下文通知

**状态改变触发的回调：**

- `.done(cb [, …cbs])` 延迟对象执行成功时依次调用回调
- `.fail(cb [, …cbs])` 延迟对象执行失败时依次调用回调
- `.progress(cb [, …cbs])` 设置延迟对象的进度时依次调用回调
- `.always(cb [, …cbs])` 延迟对象解决或成功完成后都会依次调用的回调

**延迟对象控制：**

- `$.when(…deferrObj)` 用于执行一个或多个延迟对象或 thenable 的函数对象等

  - 传入一个延时对象，会形如 `Promise` 一样先返回，并在延迟对象解决后改变状态


  - 传入多个延时对象，会类似 `Promise.all()` 一样形成新的对象，所有延时对象完成后会执行该新对象的 `done` 回调，任一延时对象失败后会执行该新对象的 `fail` 回调，这些回调的参数依次此函数的参数


  - 传其他参数或不传，将返回类似于 `Promise.resolve()` 的已完成的 thenable 对象

- `.then(doneCb [, failCb] [, progressCb])` 为延迟对象添加后续处理程序参数
- `.promise([target])` 返回一个延迟对象，但它没有任何修改状态的方法，例如 `.resolve()`
  如果指定了 `target` 对象，那么会给这个对象添加延迟对象的相关 API 并返回它，会修改此对象
- `.state()` 返回 `'pending'`、`'resolved'`、`'rejected'` 表示对象状态