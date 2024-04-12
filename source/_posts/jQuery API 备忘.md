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
相关链接：[jQuery 官网 API 文档](https://api.jquery.com/)，[jQuery 源码分析](https://www.cnblogs.com/aaronjs/p/3279314.html)，[国人做的 API 速查表](https://jquery.cuishifeng.cn/)。



# 选择器语法

**选择器语法：**

- **$('#id')** ID选择器
- **$('div')** 标签选择器
- **$('.class')** 类选择器
- **$('[name=a]')** 属性选择器
- **$(document)** 文档选择器
- **$('\*')** 所有内容选择器
- 选择器接受第二个参数作为搜寻范围，默认为 `document`
- 多个选择器可以逗号分隔，这时获取的是多个选择器的**并集**
- **$.escapeSelector(n)** 用于在属性值有选择器字符时使用

**层级关系：**

- **a b** 在 a 元素内的 b 元素
- **a>b** 在 a 元素直接子级 b 元素
- **a~b** 同级且在 a 之后的 b 元素
- **a+b** 同级且紧接 a 之后的 b 元素

**基本筛选器：**

- **:first :last** 第一/最后出现
- **:odd :even** 奇数/偶数次出现
- **:gt(2) :lt(2) :eq(2)** 选择编号大于/小于/等于 2 的元素，**编号从 1 开始**
- **:animated** 处于动画状态的元素
- **:lang(en)** 带有语言标签 `lang=en` 的元素
- **:root** 选择根元素 `<html>`
- **:target** 当前 url 的 `#` 锚点元素
- **:header** 选择所有 `<h1><h2>` 等标题元素
- **:focus** 选择焦点元素

**按内容筛选：**

- **:contains(t)** 内容包含 t 的元素
- **:empty** 选择空元素
- **:has(a)** 选择带有符合 a 选择器的元素的元素
- **:parent** 选择含有子元素或内容的元素
- **:visible :hidden** 选择可见/隐藏元素

**详细的属性筛选：**

- **[attr]** 带有 attr 元素
- **[attr=b] [attr!=b]** 选择带有 attr 属性且值等于/不等于 b 的元素
- **[attr^=b] [attr$=b]** 选择带有 attr 属性且值以 b 开头/结尾的元素
- **[attr\*=b]** 选择带有 attr 属性且值包含 b 的元素
- 多个属性选择器可以连写，元素必须全部匹配才能被选择

**子元素位序筛选：**

- **:first-child :last-child** 选择所有作为父级元素中第一个/最后一个元素
- **:nth-child(3) :nth-last-child(3)** 选择所有作为父级元素中第 3 个/倒数第 3 个元素，**编号从 1 开始**
- **:only-child** 选择所有作为父级元素中唯一的元素
- **:first-of-type :last-of-type** 选择所有作为父级元素中的同类元素中第一个/最后一个
- **:nth-of-type(3) :nth-last-of-type(3)** 选择所有作为父级元素中的同类元素中的正数/倒数第 3 个
- **:only-of-type** 选择所有作为父级元素中同类元素中的唯一个体
- 另外，上述 `nth-` 开头的选择器中的参数除了数字还可以是 `even`、`odd` 分别表示偶数和奇数，还可以是一个类似于 `an+b` 的表达式，例如 `3n+1`，这时会匹配第 1、4、7… 个元素

**按表单筛选器：**

- **:input** 匹配所有 `<input>` 表单元素
- **:text :password :radio :checkbox :image :file :reset :submit** 匹配对应 `type` 的这些表单元素
- **:enable :disable** 匹配所有可用/禁用的表单元素
- **:checked** 匹配所有选中的复选框、单选框、`<option>`
- **:selected** 匹配所有选中的表单元素

 

# DOM 集合

**DOM 集合的属性：**

- **a.length** 获取集合的元素数量，和已废弃的 `a.size()` 作用相同
- **a.get()** 获取集合中所有的元素
- **a.get(2)** 获取集合中的第3个元素，类似于 `[2]`
- **a.index()** 返回 `a` 在同辈元素中的相对位置
- **a.index(e)** 获取 `e` 元素/选择器在 `a` 中的位置，不存在则返回 `-1`
- **a.each(fn)** 对a对象中所有对象执行 `fn` 回调，回调返回 `false` 则会停止迭代
- **a.toArray()** 将 jQuery 的 DOM 集合转为数组

**选择器过滤方法：**

- **a.find(b)** 从 `a` 匹配的元素中，找出匹配 `b` 选择器的元素
- **a.has(b)** 在匹配 `a` 的元素中查找包含有 `b` 的选择器的元素
- **a.not(b)** 在匹配 `a` 的元素中去除匹配 `b` 的元素
- **a.eq(5)** 选择第 6 个，类似于 `[5]`
- **a.qe(-5)** 选择倒数第 5 个，类似于 `[-5]`，倒数从 `-1` 开始
- **a.first() a.last()** 选择匹配的第一个/最后一个元素
- **a.filter(b)** 在匹配 `a` 的元素中筛选出同样匹配 `b` 的元素
- **a.is(b)** 判断 `a` 是否匹配 `b` 选择器/回调并返回 `true` 或 `false`
- **a.hasClass('b')** 根据 `a` 元素是否含有名为 `'b'` 的类名并返回 `true` 或 `false`
- **a.map(fn)** 常规 map 操作，注意回调中用 `$(this)` 来获取当前元素
- **a.slice(start [, end])** 截取编号 `[start,end)` 区间的元素，`end` 默认是长度



# DOM 游标移动

**后代元素：**

- **a.children([b])** 取得 `a` 元素的所有直接子级元素，`b` 为筛选选择器 
- **a.contents()** 取得 `a` 的所有子节点，包含文本节点

**祖先元素：**

- **a.closet(b)** 从 `a` 开始逐级向父级元素遍历，找到匹配 `b` 的元素便停止
- **a.parent([b])** 选择 `a` 的直接父级元素，`b` 为筛选选择器
- **a.parents([b])** 类似于 `parent` 和 `closet`，但它将所有祖先元素都遍历一遍
- **a.offsetParent()** 返回可用于定位的第一个父级元素，可定位元素的 `position` 为 `relative` 或 `absolute`

**同级元素：**

- **a.next([b])** 选择紧跟 `a` 匹配元素后面的第一个元素，`b` 为筛选选择器
- **a.nextAll([b])** 类似于 `next`，但它匹配所有元素，`b` 为筛选选择器
- **a.nextUntil(b [,c])** 从 `a` 匹配的元素后开始，直到找到匹配 `b` 选择器的前面一个元素，`c` 是筛选选择器
- **a.siblings([b])** 选择 `a` 的其他所有同级元素，`b` 为筛选选择器
- **a.prev() a.prevAll() a.prevUntil()** 用法同 `next` 系列方法，只是方向是向前

**选择器的链式操作：**

- **a.add(b)** 将匹配 `b` 选择器的元素或者变量 `b` 的 DOM 添加到 `a` 中
- **a.addBack()** 如果使用 `next` 等方法来获取其他元素，`addBack` 可以把最初选择器的元素加进来
- **a.end()** 回到最后一次改变匹配内容的操作之前，`find`、`next`、`slice` 等都属于改变匹配内容



# DOM 操作

**DOM操作：**

- **$(html [, props])** 动态创建 DOM 元素，`html` 为标签字符串，`props` 为属性和事件监听器
- **a.clone([[b,] c])** 克隆元素，`a` 默认 `false` 表示是否复制事件，`b` 表示是否递归子元素以及事件
- 以下方法，如果 `b` 是 jQuery 或元素则会移动 `b` 元素，否则会生成一个 DOM 插入

**在标签【内部】追加内容：**

- **a.append(b)** 向 `a` 标签内部**尾部**追加 `b` 元素/回调返回的元素
- **a.appendTo(b)** 将 `a` 标签追加到 `b` 标签内部**尾部**，**返回追加后的 jQuery 对象**
- **a.prepend(b)** 向 `a` 标签内部**头部**追加 `b` 元素/回调返回的元素
- **a.prependTo(b)** 将 `a` 标签追加到 `b` 标签内部**头部**，**返回追加后的 jQuery 对象**

**在标签【外部】追加内容：**

- **a.after(b)** 向 `a` 标签外部**后面**追加 `b` 元素/回调返回的元素
- **a.insertAfter(b)** 将 `a` 追加到 `b` 元素标签外的**后面**，**返回追加后的 jQuery 对象**
- **a.before(b)** 向 `a` 标签外部**前面**追加 `b` 元素/回调返回的元素
- **a.insertBefore(b)** 将 `a` 追加到 `b` 元素标签外的**前面**，**返回追加后的 jQuery 对象**

**使用标签包裹：**

- **a.wrap(b)** 生成 `b` 标签包裹 `a` 标签
- **a.unwrap([b])** 移除 `a` 元素的外部标签，`b` 是筛选选择器，父元素如不符合将不会被移除
- **a.wrapAll(b)** 生成 `b` 标签包裹 `a` 中所有的元素
- **a.wrapInner(b)** 在 `a` 标签的**内部**生成 `b` 标签，这里 `b` 标签包裹原本 `a` 标签内部的内容

**增删替换 DOM：**

- **a.replaceWith(b)** 使用 `b` 内容/回调替换所有 `a` 元素，如果 `b` 是 jQuery 或元素则会移动 `b`
- **a.replaceAll(b)** 使用 `a` 来替换所有 `b` 选择器的内容，**返回包含所有替换后内容的 jQuery 对象**
- **a.empty()** 将 `a` 元素内容内容清空
- **a.remove([b])** 从 DOM 中删除 `a` 元素并移除它的事件，jQuery 对象还在，`b` 是筛选选择器
- **a.detch([b])** 从 DOM 中删除 `a` 元素，保留事件，jQuery 对象还在，`b` 是筛选选择器



# 属性操纵

**标签属性：**

- **a.attr()** 获取或设置属性，赋值可用双参数/键值对对象等
- **a.removeAttr(n)** 移除属性
- **a.prop()** 类似 `attr` 但用于获取 `checked`、`disable` 等属性，可以取到 `true` 和 `false`
- **a.removeProp(n)** 对应 `prop` 用于移除属性

**类操纵：**

- **a.addClass(n)** 给元素添加类，多个类名用空格分开
- **a.removeClass()** 移除元素的类名，多个类名用空格分开
- **a.toggleClass(n [, fn])** 添加/移除类名，`fn` 是回调根据返回 `true` 还是 `false` 决定添加还是移除类名

**内容操纵：**

- **a.html([v])** 取值赋值html内容，可用回调f(index,html)
- **a.text([v])** 取值赋值text内容(text不包含子元素的标签文本)，对xml也有效，可用回调
- **a.val([v])** 表单取值赋值value

**数据值属性：**

- **a.data(k, v)** 存储 `data` 数据，注意 `data` 在设值/取值的时候都会被转为纯小写
- **a.removeData(k)** 移除 `data` 数据



# 样式与尺寸控制

**样式控制：**

- **a.css()** 设置或获取 CSS 属性值，可用键值对对象，jQuery 会自动添加诸如 `-webkit-` 前缀
- **$.cssHooks()** 自行设定 CSS 钩子，例如可以为一些属性设置 getter 和 setter

**位置操控：**

- **a.offset(n)** 设置元素的偏移值，接受回调或一个对象，带有 `top` 和 `left` 属性且值为数字
- **a.position()** 获取 `top` 和 `left` 的偏移值的对象
- **a.scrollTop([v]) a.scrollLeft([v])** 获取或设置相对滚动条顶部/左部的偏移

**尺寸操控：**

- **a.height([v]) a.width([v])** 使用数字或回调设置或获取元素的高度/宽度值
- **a.innerHeight() a.innerWidth()** 在上个方法基础上加上 `border` 的值
- **a.outerHeight([opt]) a.outerWidth([opt])** 在上个方法基础上加上 `padding` 的值，如果 `opt` 为 `true` 时还将加上 `margin` 的值



# 效果和动画

**DOM 效果控制：**

- 下文所有的速度参数 `s` 可设为预定义的字符串 `'slow'`、`'normal'`、`'fast'` 或是一个表示毫秒数的数字
- 切换效果参数 `e` 默认为 `'swing'` 为开头结尾慢中间快，可设为 `'linear'` 为匀速
- **$.fx.off** 设置为 `true` 将立即直接关闭页面上所有动画，且所有动画效果不会产生

**基本功能：**

- **a.show([s [, e] [, fn]])** 显示隐藏的元素，`s` 是速度，`b` 是切换效果，`fn` 是回调 
- **a.hide([s [, e] [, fn]])** 隐藏元素

**滑动/淡入淡出：**

- **a.slideDown([s [, e] [, fn]]) a.slideUp([s [, e] [, fn]])** 通过向下伸长/向上收起来展示/隐藏元素，`slideToggle` 是切换显示与隐藏
- **a.slideToggle([s [, e] [, fn]])** 切换隐藏和显示
- **a.fadeIn([s [, e] [, fn]]) a.fadeOut([s, [, e] [, fn]])** 淡入显示/淡出隐藏元素
- **a.fadeTo([s, o [, e] [, fn]])** 将透明度淡入淡出到参数 `o` 的值，`o` 是一个 0 到 1 之间的数字

**自定义动画：**

- **a.animate(p [, s] [, e] [, fn])** 执行动画效果，`p` 是表示动画参数的对象
- **a.stop([c [, j]])** 停止当前正在活动的动画效果，`c` 为 `true` 则将清空动画队列，`j` 为空将直接完成当前动画动作
- **a.delay(d [, q])** 推迟动画的执行，`d` 是毫秒数或是预定义的速度，`q` 是队列名
- **a.finish([q])** 停止并清空所有队列中的动画，完成动作，同时更新队列的 CSS 到完成时，`q` 是队列名



# 事件

**设置事件：**

- **$(fn)** 即**$(document).ready()**，在文档结构加载完成后执行，回调可以传一个参数作为 jQuery 的替代变量
- **a.on(e [, dt] , fn)** 绑定事件，`e` 是事件名多个用空格分隔，`fn` 是回调事件，`dt` 是传入事件回调 `event.data` 的值
- **a.off(e)** 移除事件
- **a.one(e [, dt] , fn)** 设置触发一次后就移除的事件
- **a.trigger(e [, dt])** 在 `a` 中所有元素上触发事件 `e`，可用 `dt` 传递数据
- **a.triggerHandle(e [, dt])** 类似 `trigger`，但它不触发默认行为也不导致事件冒泡，且返回该事件处理函数返回值
- **a.hover([in,] out)** 一个自定义事件，鼠标移入触发 `in` 事件，鼠标移出触发 `out` 事件

**绑定原生事件：**

- 这些方法基本大部分都接受参数 `[dt], fn` 来传递数据和回调，**无参数时将直接触发这些事件**
- **a.blur()** 元素失去焦点
- **a.change()** 元素值改变时触发
- **a.click() a.dbclick()** 点击、双击元素
- **a.focus()** 元素通过点击或 TAB 键获取焦点
- **a.focusIn() a.focusOut()** 获取/失去焦点，**子元素也会触发父元素的该事件**
- **a.keydown() a.keyup()** 当前元素键盘按下/弹出时触发。如果在 `document` 上设置则页面无焦点也会触发
- **a.keypress()** 键盘按下触发，**必须在尝试输入内容才触发**，因此按下 Ctrl 等键不会触发
- **a.mousedown() a.mouseup()** 鼠标按下/松开
- **a.mouseenter() a.mouseleave()** 鼠标移入/移出
- **a.mouseover() a.mouseout()** 鼠标移入/移出，**在子元素也会触发父元素的该事件**
- **a.mousemove()** 鼠标在元素上移动触发，它的事件参数包含 `clientX` 和 `clientY`
- **a.resize()** 调整浏览器窗口大小
- **a.scroll()** 滚动元素，可以绑定在可滚动元素或 `window` 上
- **a.select()** 选中文本，返回 `false` 可以阻止复制
- **a.submit()** 表单提交

**jQuery 事件对象：**

- jQuery 事件对象不同于原生事件对象，有一些额外的参数。用于 jQuery 绑定的事件回调中做参数传入
- **a.data** 包含调用事件时传入的 `data` 数据
- **a.currentTarget a.target** 触发事件的当前冒泡的元素/原始元素
- **a.type** 事件的类型名
- **a.which** 对于键盘事件，表示 `keycode` 和 `keycharcode` 的标准化用于判断按键
- **a.timestamp** 事件触发的事件
- **a.namespace** 事件触发的命名空间
- **a.data** 包含事件回调中传入的 `data` 数据
- **a.result** 最后触发的处理函数的返回值
- **a.preventDeafult() a.isDefaultPrevented()** 调用/获取阻止事件默认行为的设置
- **a.stoppePropagation() a.isPropagationStopped()** 调用/获取阻止事件传递的设置
- **a.stopImmediatePropagation() a.isImmediatePropagationStopped()** 调用/获取在所有监听处理方法上阻止事件传递的设置
- **a.relatedTarget** 与事件相关的其他元素，只有部分事件带有该属性，类型是 `Element`
  - **mouseover/mouseout** 带有该属性表示鼠标离开的/进入的节点
  - **focus/blur** 带有该属性表示之前/之后的焦点元素
- **a.delegateTarget** 表示负责绑定事件处理函数的 DOM 元素，一般等价于 `currentTarget`



# AJAX

**请求方法：**

- **$.get(url [, dt] [, fn] [, t]) / $.post(url [, dt] [, fn] [, t]) / $.getJSON(url [, dt] [, fn])**
  - 也可以使用对象作为参数；该方法返回 XHR 对象
  - `url` 是请求发起的地址，`dt` 是发送的数据对象，`fn` 是回调，`t` 是类型
  - 可以传入一个对象作为参数，这样调用可以使用类似 `$.ajax()` 方法的很多特性
- **$.getScript(url [, fn])** 加载一个 JS 文件，并执行之
- **$.ajax(url [, opt])** 返回一个 XHR 对象，可用 `$.ajaxSetup()` 来设置全局 AJAX 参数。下面是 `opt` 的各参数：

**常用参数：**

- **url**：一般是单独作为一个参数用的，也可以放在参数对象里，表示请求的地址
- **async**：默认 `true`，如果为 `false` 则 AJAX 变为同步
- **accepts**：告知服务器接受何种返回，默认值取决于发送时候的数据类型
- **type**：请求方法
- **contentType**：默认 `'application/x-www-form-urlencoded'`，表示发给服务器时的编码内容
- **data**：发送到服务器的数据，GET 请求将使用 url 参数
- **dataType**：预期服务器返回数据类型，可以设置为 `'json'`、`'html'`、`'script'`、`'xml'`、`'text'` 和 `'jsonp'`，如果不指定则 jQuery 会根据返回的 MIME 信息自动转化
- **headers**：一个键值对对象，表示额外发出的请求头
- **timeout**：设置超时时间的毫秒数
- **xhrFields**：向xhr中追加的键值对，追加 `{ withCredentials : true }` 可以发出跨域请求

**回调函数：**

- 以下回调函数中的 `this` 默认表示 AJAX 方法的配置参数对象
- **success**：请求成功后触发，回调参数 **(data, textStatus, jqXHR)**，第三个参数是一个 XHR 对象的超集

- **error**：请求失败后触发，回调参数 **(jqXHR, textStatus, err)**，第三个参数表示捕获的异常对象
- **beforeSend**：发送前触发的事件，回调函数 **(xhr)**，返回 `false` 可以取消本次 AJAX 请求
- **complete**：请求完成触发，无论成功或失败，回调参数 **(xhr, textStatus)**
- **dataFilter**：给服务器返回的数据进行预处理，回调参数 **(data, type)**，`type` 表示 AJAX 的 `dataType` 参数，返回值将被 jQuery 接收
- **statusCode**：一个由一组由状态码到处理函数的集合对象，例如 **{ '404': function() { } }**

**不常用的参数：**

- **cache**：默认为 `true`，除非 `dataType` 为 `'script'` 或 `'jsonp'`，表示是否缓存请求
- **contents**：由字符串-正则组成的键值对，指定 jQuery 解析返回的数据时依据的模式
- **context**：设置该值以改变回调函数中的 `this`
- **converters**：由字符串-正则组成的键值对，用于让 jQuery 对不同的数据类型进行转换
- **crossDomain**：同域默认为 `false`，跨域默认为 `true`；注意如果同域的地址有跳转，则需要显式设为 `true`
- **global**：默认 `true`，是否触发全局 AJAX 事件
- **ifModified**：默认 `false`，是否仅在服务器数据更改时才获取新数据，这用到了 `Last-Modified` 响应头
- **isLocal**：默认值取决于协议，是否允许当前的位置被认定为本地
- **jsonp**：在发出 JSONP 请求时，更改参数 `callback=xxxx` 中 `callback` 的字符
- **jsonpCallback**：在发出 JSONP 请求时，更改参数 `callback=xxxx` 中 `xxxx` 的字符
- **mimeType**：用于覆盖原 XHR 的 MIME 类型
- **username/password**：设定 HTTP 认证的用户名和密码
- **processData**：默认 `true`，是否将 `data` 参数的内容转化为一个字符串
- **scriptCharset**：在 `dataType` 为 `'script'` 或 `'jsonp'` 时，且是 GET 请求才可用，强制修改相应的 `charset` 属性
- **traditional**：使用传统的方法来序列化数据，则设置为 `true`

- **a.load(url [, data] [, fn])** 参数 `a` 是选择器选中的 DOM，通过 AJAX 获取数据插入到该 DOM 中
  - **url** 是地址，但是可以在地址后面加一个空格然后接选择器字符串来筛选接收到的 HTML 内容
  - **data** 可以接受一个对象作为传给服务器的数据，默认请求是 GET，但是带有任何参数则转为 POST
  - **fn** 是载入成功之后执行的回调

**AJAX 相关事件：**

- 以下除 `ajaxError` 外，回调的参数均为 **(e, xhr, opt)**，其中 `e` 是事件对象，`opt` 是 AJAX 配置
- **ajaxStart(fn)** 在 AJAX 请求开始的时触发
- **ajaxSend(fn)** 在 AJAX 请求发送前触发
- **ajaxSuccess(fn)** 在 AJAX 请求成功时触发
- **ajaxComplete(fn)** 在 AJAX 请求完成时触发
- **ajaxError(fn)** 在 AJAX 请求出错时触发，它的回调参数为 **(e, xhr, opt, error)**，多了一个抛出的错误
- **ajaxStop(fn)** 在 AJAX 请求结束时触发

**AJAX 全局配置项：**

- **$.ajaxPrefilter([dataType,] handler)**：在每个 AJAX 发出前会触发该 `handler` 回调修改 `opt` 参数
  - **dataType** 是包含一个或空格分隔的多个表示 `dataType` 类型所组成的字符串
  - **handler** 是回调，参数 **(opt, originOpt, jqXhr)**，分别为请求参数、未经修改的参数、xhr对象
- **$.ajaxSetup([opt])** 接受一个对象，为所有 AJAX 设置参数
- **$.serialize()** 将表单内容序列化为字符串
- **$.serializeArray()** 将表单内容序列化为 JSON 对象，每个对象包含 `.name` 和 `.value` 属性



# jQuery 核心与工具

**核心方法：**

- **$(sel [, context])** 选择器基本用法，`context` 表示选择查找的范围。无参数调用返回空 jQuery 对象
- **$(html [, props])** 使用 DOM 字符串创建一个节点，`props` 是一个对象，用于设置 DOM 属性、事件等
- **$(fn)** 类似于 **document.ready()** 事件，文档准备完毕时调用其中的回调，可以传入一个变量名
- **$.readyException(err)** 处理 `ready` 事件中出现的错误

**扩展与共存：**

- **$.noConflict([rename])** 让出当前 jQuery 注册的全局变量，用于在 `$` 变量名冲突时使用，传入 `true` 时会恢复
- **$.extend(obj)** 在 jQuery 的**全局**上挂载方法或属性 (还能用来拷贝对象，见工具一段)
- **$.fn.extend(obj)** 在 jQuery 的 **DOM 集合**上挂载方法或属性，其中的 `this` 表示 jQuery 元素对象的自身

**队列控制：**

- **a.queue([name] [, newQue|fn])** 获取或设置在当前 jQuery 元素上的函数队列
  - 队列方法中的 `name` 是队列名称，默认为 `'fx'` 表示动画效果
  - **newQue** 是一个数组用于替换当前队列，也可以用 `fn` 回调表示要加进队列的函数
- **a.dequeue([name])** 从队首移出并执行一个函数
- **a.clearQueue([name])** 清空队列中的所有未执行函数

**工具方法：**

- **$.browser.version** 获取浏览器相关信息
- **$.when(…def)** 用于执行一个或多个 thenable 的函数对象等
  - 传入一个延时对象，会形如 `Promise` 一样先返回，并在延迟对象解决后改变状态
  - 传入多个延时对象，会类似 `Promise.all()` 一样形成新的对象，所有延时对象完成后会执行该新对象的 `done` 回调，任一延时对象失败后会执行该新对象的 `fail` 回调。这些回调的参数依次为传入的各个 `def`
  - 传入非延时对象或无参调用，将返回类似于 `Promise.resolve()` 的已完成的 thenable 对象
- **$.parseXML(dt)** 将字符串解析为 XML 文档
- **$.noop** 表示一个空函数
- **$.proxy(f, context)** 将 `f` 的作用上下文绑定为 `context`。也可以使用参数 **(context, name)**，参数 `name` 表示函数名称
- **$.trim(str)** 去除字符串头尾空格
- **$.param(obj [, trad])** 将表单元素数组或对象序列化，参数 `trad` 设为 `true` 将使用传统方式浅层序列化
- **$.error()** 抛出一个错误，一般用于 jQuery 插件开发
- **$.fn.jquery** 获取 jQuery 的版本号字符串

**数组与对象：**

- **$.each(obj [, fn])** 可遍历对象或数组，`fn` 的回调参数为 **(index, item)**，分别是索引和内容
- **$.extend([deep,] target [, …obj1])** 合并后续的对象到第一个对象，`deep` 表示是否递归复制结构
- **$.grep(arr, fn)** 用回调过滤数组，回调参数 **(index, item)**，返回 `false` 时将过滤掉元素
- **$.makeArray(obj)** 对象转换为数组，可以用于将 jQuery 选择元素转为数组
- **$.map(arr|obj, fn)** 对对象或数组的每个成员调用 `fn` 回调，返回值形成一个新数组或对象；返回 `null` 的成员将被移除
- **$.inArray(v, arr [, fromIndex])** 在数组 `arr` 中查找 `v` 的位置，`fromIndex` 默认为 0 表示搜寻起始，找不到返回 `-1`
- **$.merge(fir, sec)** 将第二个数组上的内容接在第一个数组后面
- **$.uniqueSort(arr)** 排序并移除重复的数组内容

**检测判断：**

- **$.contains(outer, inner)** 判断 DOM 是否有包含关系
- **$.type(obj)** 检测类型，返回一个字符串
- **$.isEmptyObject(obj)** 判断是否是空对象，**也会从原型继承上检测**
- **$.isPlainObject(obj)** 判断是否是纯粹对象，即通过 `{}` 或 `new Object()` 创建的
- **$.isNumeric(v)** 判断是否是一个数字

 

# 回调函数

**回调列表创建：**

- **$.Callbacks(flags)** 创建并返回一个 jQuery 的回调列表，`flags` 是一个字符串表示标志，各项以空格分隔
- **flags** 的可选参数如下：`'once'` 该回调列表只会执行一次、`'memory'` 以前的和新加的立即执行任何回调、`'unique'` 一次只能添加一个回调且不重复、`'stopOnFalse'` 一个回调返回 `false` 时中断回调

**回调列表用法：**

- **cb.add(fn)** 将一个函数或一个函数数组添加进回调列表
- **cb.remove(fn)** 从回调列表中删除一个函数或数组
- **cb.empty()** 清空回调列表
- **cb.has(fn)** 判断列表中是否存在某个回调
- **cb.fire(…args) cb.fired()** 用给定的参数调用回调列表中的所有回调，或是确认回调是否曾调用过
- **cb.fireWith([context] [, …args])** 使用 `context` 的上下文来调用回调
- **cb.disable() cb.disabled()** 禁用回调列表，或是确认回调是否禁用
- **cb.lock() cb.locked()** 锁定回调来避免修改状态，或是确认回调是否锁定

 

# 延迟对象

**延迟对象创建：**

- **$.Deferred([beforeStart])** 创建并返回一个 Deferred 对象。
  - **beforeStart** 将在该 Deferred 返回之前调用，**$.Deferred(  )** 构造出的对象将作为第一个参数传入
  - **deferred** 对象开始处于 Pending 状态，调用其 `resolve()` 或 `resolveWith()` 将改变状态为 “Resolved” 状态并触发 `done` 回调，而调用其 `reject()` 或 `rejectWith()` 将改变状态为 “Rejected” 状态并触发 `fail` 回调
  - 即使 Deferred  对象处于 “Rejected” 状态，仍可以调用 `resolve()` 或 `reject()`，这会被立即执行

**改变状态：**

- **def.resolve(args) def.resolveWith(context [, …args])** 成功执行延迟对象，或是以指定上下文成功执行
- **def.reject(args) def.rejectedWith(context [, …args])** 拒绝延迟对象，或是以指定上下文拒绝
- **def.notify(args) def.notifyWith(context [, …args])** 通知延迟对象执行中状态，或是以指定上下文通知

**状态改变触发的回调：**

- **def.done(fn [, …fn])** 延迟对象执行成功时，依次调用其中的回调，例如可以 `$.get('url').done(xxx)`
- **def.fail(fn [, …fn])** 延迟对象执行失败后调用回调
- **def.progress(fn [, …fn])** 设置延迟对象的进度通知回调
- **def.always(fn [, …fn])** 延迟对象解决或成功完成后都会调用

**延迟对象控制：**

- **def.then(done [, fail] [, progress])** 为延迟对象添加后续处理程序。参数中 `done` 表示延迟对象解决时触发、`fail` 表示拒绝时、`progress` 表示对象生成进度
- **def.promise([target])** 产生一个无法调用 `resolve()` 等改变延迟对象状态的 `Promise`，**返回**或将**其事件附加到 `target` 上**
- **def.state()** 返回 `'pending'`、`'resolved'`、`'rejected'` 三个字符串之一，表示当前延迟对象状态