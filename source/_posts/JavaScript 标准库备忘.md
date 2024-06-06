---
title: JavaScript 标准库备忘
date: 2018-04-11 15:01:40
tags:
- JS
- Cheatsheet
categories:
- JS
---

# 全局变量和全局方法
**全局变量：**

`Infinity`：无穷大，值等于 `Number.POSITIVE_INFINITY`

`NaN`：非数字，非法的数学运算会产生这个值，也可以使用 `Number.NaN` 来代指，注意 `NaN` 不和任何值相等，即使是两个 `NaN` 也是互不相等的

`undefined`：表示未定义的值，可以使用 `void` 运算符来得到 `undefined`

`null`：表示为空的值，需要注意的是 `typeof null === 'object'`

-----

**编码类全局方法：**

`encodeURI()`：编码一个 URI 字符串，它会将 URI 地址中不合法的部分转码成如同 `%20` 这种值，无法完成时会产生 `URIError` 错误；例如空格、百分号等在 URI 中不合法的字符串会被编码

`decodeURI()`：解码一个已被编码的 URI 字符串

`encodeComponentURI()`：编码或者解码一个 URI 的参数部分，与上面的方法不同的是，URI 的参数一般是 `?a=1&b=2` 这种形式，因此 `?=&/#` 等字符也都不再合法，必须编码后使用，因此此方法编码、解码的字符类型比 `encodeURI()` 更多，是包含关系

`decodeComponentURI()`：解码一个已被编码的 URI 参数部分的字符串

`escape()`：此方法已被标记为废弃；它也会编码和解码字符串，编码的结果和 `encodeComponentURI()` 很像都是带百分号但是格式并不一样，切勿混淆

`unescape()`：此方法已被标记为废弃；解码一个已被 `escape()` 编码的字符串；它也会使用 Unicode 的解码方式，支持例如 `\u0107` 这种带有 `\u` 前缀的编码结果，也是可以正确解码的

**注意：** JS 中的 `encodeURIComponent()` 转码方法不符合 RFC 3986 规范，它不会转换 `!'()*` 这些字符，涉及到这些字符时可能与一些后端语言有出入。如果需要处理上述的情况，推荐写法：

``` js
function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
```

-----

**数值类全局方法：**

`isNaN()`：判断值是否为非数值，它会尝试转换参数为数值，如果转换后还是无法当做数值，那么返回 `true`，也因此当把布尔值用做参数时，它始终返回 `false`；注意它和 `Number.isNaN()` 不同，后者对不是 `NaN` 的值永远返回 `false`

`isFinite()`：判断值是否有限，**注意对于 `NaN` 它返回 `false` 值**；注意它和 `Number.isFinite()` 不同，后者对非数值永远返回 `false`

`parseInt(str, radix)`：从字符串中解析整数，按照从左往右顺序并忽略空格，如果遇到非法字符则停止解析并保留已解析的部分，返回解析出来的数值或 `NaN`，还可以传入第二个参数表示进制数；注意它不支持科学计数法，只有 0x 开头的数字会当做十六进制，**建议在任何使用场景下都须传入第二个参数**；全等于 `Number.parseInt()`；更好的选择是 `Number()`

`parseFloat()`：从字符串中解析浮点数，具体方式同上，但是此方法不支持指定进制数；全等于 `Number.parseFloat()`；更好的选择是 `Number()`

-----

**定时器类方法：**

**注意：**定时器类方法属于宿主方法，不属于 JS 标准库，因此浏览器和 Node.js 上的实现是有区别的

`setTimeout(callback, delay = 0, [args...])`：指定延迟毫秒后执行对应的方法，还可以提前指定好要传入的参数，在浏览器上它返回一个数字 ID 用于清除定时器，在 Node.js 上它返回一个 `Timeout` 对象（但是带有 `[Symbol.toPrimitive]` 方法属性以转为数值，所以也可以当做数值来看待）；`delay` 为 0 则回调会直接在本轮事件循环的宏任务（比 `Promise` 的微任务更晚）中执行

`clearTimeout(id)`： 传入定时器的 ID 以清除定时器

`setInterval(callback, delay = 0, [args...])`：循环地每隔指定延迟毫秒后执行对应的方法，还可以提前指定好要传入的参数，它的返回值行为和 `setTimeout()` 相似

`clearInterval(id)`：传入循环定时器的 ID 以清除定时器

------

**不推荐使用的方法：**

`eval()`：执行传入其中的JS代码，返回这些代码执行后的返回值。直接调用该方法，如果产生了变量则是局部变量；通过引用调用该方法，则会生成全局变量，需要注意；推荐使用 `new Function()` 的方式取代



# Array.prototype
**属性：**

`[ ].length`：表示数组长度；减小该值将删去尾部元素，增加该值则会用 `undefined` 占位

-----

**会修改数组内容的方法：**

`[ ].push(item)`：修改数组，末尾追加一个元素，返回数组新的长度

`[ ].pop()`：修改数组，末尾移除一个元素，返回移出的元素

`[ ].unshift(item)`：修改数组，开头追加一个元素，返回数组新的长度

`[ ].shift()`：修改数组，开头移除一个元素，返回移出的元素

`[ ].reverse()`：修改数组，反转所有元素的顺序，返回自身

`[ ].sort([sortFn])`：修改数组，按照给定的排序回调来排序，返回自身；注意**默认是当做字符串来排序**

`[ ].splice(start = 0, [delLength = this.length,] [...newItem])`：修改数组，从指定下标元素的前一位开始删除数个元素，然后再插入数个元素，返回被删除的元素的数组

`[ ].fill(value | fillFn, [start = 0,] [end = this.length])`：修改数组，将所有元素填充成指定的值或回调方法返回值

-----

**不会修改数组内容的方法：**

`[ ].concat(...arrsOrValue)`：返回一个当前数组连接所有值和数组后的新数组

`[ ].join(separator = ',')`：返回当前数组用给定分隔符连接形成的字符串

`[ ].slice(start = 0, [end = this.length])`：选取从开头到结尾下标的元素组成新数组并返回；参数可以为负数

`[ ].indexOf(item, [fromIndex = 0])`：返回给定元素在数组中首次出现的下标位置，找不到则返回 `-1`

`[ ].lastIndexOf(item, [fromIndex = this.length - 1])`：同上，但返回在数组末次出现的下标位置

`[ ].includes(item, [fromIndex = 0])`：返回数组是否包含某个元素的布尔值

-----

**遍历数组的方法：**

注意：这些方法以开始执行时的数组长度为准，因此遍历过程中追加的元素不会被遍历到

`[ ].forEach(fn, [thisArg])`：依次对元素执行回调

`[ ].every(fn, [thisArg])`：依次对元素执行回调，只有在所有回调返回值全为 `true` 时候，该函数才返回 `true`，否则返回 `false`

`[ ].some(fn, [thisArg])`：同上，但是任何回调返回 `true` 时该函数直接返回 `true`

`[ ].filter(fn, [thisArg])`：依次对元素执行回调，提取回调返回值为 `true` 的元素形成新数组返回

`[ ].map(fn, [thisArg])`：依次对元素执行回调，将返回值形成新数组返回

`[ ].find(fn, [thisArg])`：从数组中找到并返回首个执行回调返回 `true` 的值，找不到则返回 `undefined`

`[ ].findIndex(fn, [thisArg])`：同上，但是返回值是找到的元素的下标，找不到则返回 `-1`

以上方法均会跳过数组中的空位，且其回调函数的参数均是 `fn(current, index, array)`，三个参数依次表示当前元素值、当前元素下标、原数组。

-----

**聚合计算数组的方法：**

`[ ].reduce(reduceFn, [initValue = this[0]])`：接受回调 `reduceFn(sum, current, index, array)`，参数依次是之前的计算结果、当前元素的值、当前元素的下标、原数组，依次对数组中的元素执行回调，并将结果用于下一个元素的计算

`[ ].reduceRight(reduceFn, [initValue = this[this.length - 1]])`：同上，但从数组尾部开始，反向遍历



# Array
`new Array(length)`：仅参数为一个数值的情况，返回一个指定长度的空数组

`new Array(...items)`：用多个参数形成一个数组并返回

`Array.form(arrLike, [mapFn,] [thisArg])`：将伪数组或迭代器对象转为数组并返回，第二个参数可以当做 `map()` 方法来看待

`Array.of(...items)`：将多个参数转为数组并返回

`Array.isArray(val)`：判断给定的值是否为数组，返回布尔值



# String.prototype
**属性：**

`'str'.length`：返回字符串长度

`'str'[index]`：返回指定下标的字符，注意它只读的，修改无效

-----

**查找与替换：**

`'str'.includes(str, [index = 0])`：判断字符串是否包含并返回布尔值 

`'str'.indexOf(str, [index = 0])`：查找并返回另一个字符串首次出现的下标，找不到则返回 `-1`

`'str'.lastIndexOf(str, [index = this.length - 1])`：同上，从尾部查找

`'str'.search(reg)`：查找并返回首次匹配正则表达式的下标，查找不到则返回 `-1`

`'str'.match(reg)`：查找并返回匹配捕获正则表达式的值，是一个数组，未匹配则返回 `null`

`'str'.replace(reg, newStr | fn)`：将匹配正则表达式的子串替换为新的字符串或回调结果

`'str'.replace(str, newStr | fn)`：将**第一次匹配字符串的子串**替换为新的字符串或回调结果

-----

**拼接与切分：**

`'str'.concat( ...strs )`：拼接多个字符串并返回拼接结果

`'str'.repeat(count)`：将字符串重复并连接，返回结果

`'str'.split(separator, [limit])`：以指定分隔符或正则表达式将字符串分割为数组并返回

-----

**首尾处理：**

`'str'.trim()` `'str'.trimStart()` `'str'.trimEnd()`：删除两端/开头/结尾的不可见字符

`'str'.padStart(length, [fillBy = ' '])`：在字符串的开头用指定字符串填充到指定长度并返回

`'str'.padEnd(length, [fillBy = ' '])`：同上，但改为判断结尾

`'str'.startsWith(str, [index = 0])`：判断字符串是否以指定字串开头，返回布尔值

`'str'.endsWith(str, [index = this.length])`：同上，但改为判断结尾

-----

**字符和子串提取：**

`'str'.slice(start, [end = this.length - 1])`：按下标提取并返回字符串的一部分；参数可以为负数

`'str'.substring(start, [end = this.length - 1])`：同上，处理参数更智能

`'str'.substr(start = 0, [length = this.length])`：已被标记废弃；按长度提取并返回字符串的一部分

`'str'.chatAt(index)` `.charCodeAt(index)`：返回指定下标的字符或者 unicode 编码单元

`'str'.codePointAt(index)`：返回指定下标的字符的编码单元体现数字，可以用于处理 UTF-16 字符

-----

**本地化和正规化处理：**

`'str'.toLowerCase()` `.toUpperCase()`：返回转为小写/大写的字符串

`'str'.toLocalelLowerCase()` `'str'.toLocaleUpperCase()`：同上，但按照本地化方式处理

`'str'.normalize(opt = 'NFC')`：按照 unicode 正规化方式处理字符串并返回，参数还可选 `NFD`、`NFKC`、`NFKD`

`'str'.localeCompare(str, [loacl,] [opt])`：用于字符串本地化排序，返回数字；参见 MDN 上的 [相关介绍](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)

-----

**正则表达式相关方法详细用法：**

`'str'.match(reg)`：查找并返回匹配捕获正则表达式的值，结果是一个数组，未匹配则返回 `null`

**当参数 `reg` 未使用 `g` 标记时：**

未匹配到，则返回 `null`；

匹配到则返回一个数组，其 0 下标是首次匹配到的字符串，1、2、3... 等下标依次是使用括号捕获的字符串；

数组带有 `.index` 表示初次匹配的下标；

数组带有 `.input` 表示原始输入字符串；

数组带有 `.groups` 表示[具名组匹配](http://es6.ruanyifeng.com/#docs/regex#具名组匹配)的分组信息，是一个对象或是 `undefined`



**当参数 `reg` 启用了 `g` 标记时：**

返回一个数组，表示所有匹配到的字符串；未匹配到则返回 `null`

-----

`'str'.replace(reg, newStr | fn)`：将匹配正则表达式的子串替换为新的字符串或回调结果

如果第二个参数是字符串，那么可以在字符串里面使用以下转义标记：

`$$` 表示`$`字符串本身

`$&` 表示匹配的子串

`` $` `` 表示匹配子串左边的剩余字符串内容

`$'` 表示匹配子串右边的剩余字符串内容

`$n` 其中 n 从 1 开始，`$n` 表示括号捕获的第 n 个字符串



如果第二个参数是函数，它的参数形如：`fn(match, ...p, offset, string)`

其中，`match` 表示匹配的子串（即 `$&` ），`p` 是多个参数表示被括号捕获的字符串（即 `$n`），`offset` 是匹配的子串在原字符串中的偏移量，`string` 是原字符串。



# Function 相关
`func.name`：返回方法名，匿名方法返回 `'anonymous'`

`func.length`：返回方法所需要参数个数，注意带默认值的参数和剩余参数是不计入的

`func.call(thisArg, [argsArr = []])`：传入一个值作为方法内部的 `this` 来执行该方法，`argsArr` 是一个表示参数的数组

`func.apply(thisArg, [...args])`：同上，但是参数形式是可变长参数的形式

`func.bind(thisArg, [...args])`：返回一个新方法，新方法绑定了 `this` 对象和预设的参数

**注意：**箭头函数也可以作为参数传入上面三个方法，这并不会导致报错，但是箭头函数内部的 `this` 亦无法被上面三个方法所更改。

-----

**`Function` 的构造器：**

`new Function([...args], funcStr)`：参数 `args` 表示方法的参数，`funcStr` 表示方法体内的字符串，返回一个这样的方法



# Object.prototype
**注意：**因为 JS 中的对象均继承自 `Object`，因此几乎所有对象都具备这些属性

`obj.hasOwnProperty(propName)`：返回表示对象自身（即不包括原型）是否包含该属性

`obj.isPropertyOf(target)`：返回表示该对象是否在 `target` 参数的原型链上，即该对象是否是 `target` 的原型

`obj.propertyIsEnumerable(propName)`：返回某个属性是否能被枚举，它只对对象自身的属性有效

`obj.valueOf()`：返回对象的原始值形式

`obj.toString()` `obj.toLocaleString()`：返回对象的字符串/本地化字符串表示形式，一般返回值形如 `[object xxx]`

**注意：**将对象转换为布尔值时始终为 `true`，转换为字符串时的顺序为 `[Symbol.toPrimitive]()` > `toString()`，而转换为数值时则是 `[Symbol.toPrimitive]()` > `toValueOf()`。



# Object
`Object.is(v1, v2)`：同值相等判断，类似于 `===` 运算符，但有两点例外：`+0` 不等于 `-0`、并且 `NaN` 与自身相等

`Object.assign(target, ...items)`：合并对象，将第二个开始所有参数的属性合并到 `target`，返回合并后对象；注意这里的合并操作是浅拷贝，重复的属性是后面的覆盖前面的

`Object.create(proto, [assignObj = undefined])`：以一个原型作为 `__proto__` 创建一个新对象；`assignObj ` 参数表示要合并入新对象的属性；用这种方式可以创建出原型为 `null`  的对象

-----

**定义/获取属性信息的方法：**

`Object.defineProperty(obj, propName, des)`：以指定的属性描述符在对象上定义属性

`Object.defineProperties(obj, props)`：同上，第二个参数是一个对象，可以一次设置多个属性

`Object.getOwnPropertyDescriptor(obj, propName)`：获取 `obj` 对象自身的（不包括原型上的） `propName` 属性的属性描述符，没有该属性则返回 `undefined`

`Object.getOwnPropertyDescriptors(obj)`：同上，但是列出对象自身的（不包括原型上的）所有属性的描述符

-----

**遍历属性的方法：**

`Object.getOwnPropertyNames(obj)`：返回一个对象自身的（不包括原型上的）所有属性名数组，包括不可枚举的，**始终忽略 `Symbol` 类型的属性**

`Object.getOwnPropertySymbols(obj)`：返回一个对象自身的（不包括原型上的）所有 `Symbol` 类型的属性数组

`Object.keys()` `Object.values()`：获取对象的自身的（不包括原型上的）键/值的**枚举器**

`Object.entries()`：获取对象自身的（不包括原型上的）键值对数组 `[key, value]` 的**枚举器**

-----

**原型操作：**

`Object.setPropertyOf()`：设置一个对象的 `__proto__` 原型链

`Object.getPropertyOf()`：获取一个对象的 `__proto__` 原型链

-----

**封闭类操作：**

`Object.preventExtensions()`：阻止扩展对象，阻止添加属性

`Object.seal()`：密封对象，阻止增/删/配置属性

`Object.freeze()`：冻结对象，阻止增/删/配置属性，对象的任何值均无法修改

`Object.isExtensible()` `Object.isSealed()` `Object.isFrozen()`：判断对象是否被阻止扩展/密封/冻结

-----

**属性描述符相关：**

属性描述符是一个对象，它具备两种形式，分为**数据描述符（默认）**和**存取描述符**，只能使用其中一种

如果是**数据描述符**的形式，它具备以下属性：

`.value` 表示值本身

`.writable` 表示值是否可被修改

如果是**存取描述符**的形式，它具备以下属性：

`.get()` 一个取值函数

`.set()` 一个存值函数，它有一个参数表示新的值



此外，无论是哪种形式，它始终还具备下面两个属性：

`.enumerable` 表示可枚举性，不可枚举的属性无法被 `Object.keys()`、`JSON.stringify()` 和 `for...in...` 遍历到

`.configurable` 表示可配置性，不可配置的属性无法被删除，属性描述符也不能被修改



在一个对象上直接定义新的属性时，它的描述符各属性均默认为 `true`，但使用 `Object.defineProperty()` 定义的新的属性时，它的描述符的各属性默认为 `false`。

-----

**备注：JS 对象的几个概念：**

**本地对象：**JS 实现的对象，包括了 `Object`、`Number` 等

**内置对象：**JS 实现、独立于宿主的实现，在运行环境生成时即被初始化好的，目前只有 `Global` 和 `Math`

**宿主对象：**由当前运行宿主提供的对象，例如浏览器的 BOM 和 DOM，例如 Node.js 的 `Process` 等

**用户自定义对象：**开发人员代码所创建的对象



# Number 相关
**`Number` 的构造器：**

`new Number(val)`：使用指定数值构造一个 `Numebr` 对象，不建议使用，推荐使用下面的 `Number(val)`

`Number(val)`：将参数转化为数值并返回，无法转换时返回 `NaN`；此方法不会像 `parseInt()` 那样可能只对字符串的一部分进行解析，只要存在非法内容则直接返回 `NaN`

-----

**`Number` 上的静态方法：**

`Number.isNaN()`：判断是否为 `NaN`，和全局的 `isNaN` 的区别是它对非数值永远返回 `true`，不会尝试转换为数字

`Number.isFinite()`：判断数值是否可数，**对非数值始终返回 `false` 值**，它不会尝试把参数转换为数值

`Number.parseInteger()` `Number.parseFloat()`：同全局的同名方法，见上文

`Number.isInteger()` `Number.isSafeInteger()`：判断是否为整数/安全整数，对非数值始终返回 `false`

-----

**`Number` 上的常量：**

`Number.EPSILON`：两个可区分数值的最小间隔

`Number.MAX_VALUE` `Number.MIN_VALUE`：最大/最小数字值

`Number.MAX_SAFE_INTEGER` `Number.MIN_SAFE_INTEGER`：最大/最小的安全整数

`Number.NEGATIVE_INFINITY` `Number.POSITIVE_INFINITY`：正负无穷大

`Number.NaN`：表示非数字值

-----

**`Number.prototype` 上的方法：**

`num.toFixed(n = 0)`：返回数字使用定点数表示法的结果的字符串，`n` 表示设定的小数位数，如果超出则会取近似值并截断，不足则使用数字 0 来填补，**注意它既不是四舍五入也不是四舍六入**，不建议使用

`num.toExponential(n)`：返回数值以 `n` 位小数来科学计数法表示形式的**字符串**，小数位数不足则使用数字 0 来补足，使用 `Number.prototype.toFixed()` 来进行小数近似值计算

`num.toPrecision(n)`：返回数值以 `n` 位有效数字表示的**字符串**，如果给的有效数字位数小于整数部分的位数则会使用科学计数法，如有效数字位数不足则使用数字 0 来补足，使用 `Number.prototype.toFixed()` 来进行小数近似值计算

`num.toLocaleString(option)`：以本地化形式返回数值的**字符串**结果，可以配置显示货币样式、千分符样式等，参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)



# Math
`Math.abs()`：计算数值的绝对值

`Math.sign()`：返回 `0`、`-0`、`1`、`-1` 来判断一个数的符号

`Math.max(...n)` `Math.min(...n)`：返回所有参数中的最大/最小值

`Math.hypot(...n)`：返回参数总所有数的平方和的平方根

-----

**科学计算常量：**

`Math.E`、`Math.LN2`、`Math.LN10`、`Math.LOG2E`、`Math.LOG10E`、`Math.PI`、`Math.SQRT1_2`、`Math.SQRT2`

分别表示 e、㏑2、㏑10、㏒2e、㏒10e、π、√½、√2

-----

**三角函数：**

`Math.sin()` `Math.cos()` `Math.tan()`：三种三角函数

`Math.asin()` `Math.acos()` `Math.atan()`：反三角函数

`Math.sinh()` `Math.cosh()` `Math.tanh()`：双曲三角函数

`Math.asinh()` `Math.acosh()` `Math.atanh()`：反双曲三角函数

-----

**乘方类计算：**

`Math.pow(a, b)`：a 的 b 次幂

`Math.sqrt()` `Math.cbrt()`：平方根、立方根

`Math.log()` `Math.log1p()` `Math.log10()` `Math.log2()`：返回 ㏑x 、1+㏑x 、lgx 、log2x 的值

`Math.exp()` `Math.exmp1()` `Math.pow(a, b)`：返回 e 的 x 次幂、e 的 x 次幂 -1

-----

**取整：**

`Math.trunc()`：取整，直接丢弃小数部分

`Math.round()`：四舍五入取整，注意 JS 的四舍五入取整存在一些问题

`Math.ceil()`：向上取整

`Math.floor()`：向下取整

-----

**计算机科学计算**：

`Math.fround()` `Math.imul()`：返回一个小数在单精度 32 位 10 进制中精确表示的值、32 位乘法表示的值

`Math.clz32()`：返回一个数在 32 位中表示时前导 0 的个数

-----

**随机数：**

`Math.random()`：获取 [0, 1) 区间内的随机数；如果对随机数的安全性要求较高，可以使用 Web Crypto API 来替代 

常用代码片段：

```js
// 获取 [min, max) 之间的随机数
Math.random() * (max - min) + min

// 下面两个代码片段，如果区间参数为小数
// 需要提前做 min = Math.ceil(min) 和 max = Math.floor(max) 操作
// 不能使用 Math.round()，否则会导致分布不均

// 获取 [min, max) 之间的随机整数
Math.floor(Math.random() * (max - min)) + min

// 获取 [min, max] 之间的随机整数
Math.floor(Math.random() * (max - min + 1)) + min

// 抽奖 15% 概率中奖
Math.random() < 0.15
```



# JSON
`JSON.parse(str, [mapFn])`：将一个JSON字符串反序列化成JS对象返回

该方法可以传入一个回调参数，参数形式 `mapFn(key, value)`，解析出的每个键值对都将传入该回调并使用回调的返回值来作为最终的属性值，顺序是自内到外，顶层对象传入时 `key` 是空字符串；

如果该回调返回 `undefined`，那个传入的键值对将被移除。

-----

`JSON.stringify(obj, [mapFn,] [space])`：将一个 JS 对象序列化为字符串

该方法可以传入一个回调参数，参数形式 `mapFn(key, value)`，使用它可以修改序列化时属性的值

参数 `space` 用于美化输出，表示缩进空格个数，最多为 10

注意：键为 `Symbol` 类型的属性、不可枚举属性、`undefined`、函数属性都是不会被序列化的。



# Date 相关
**`Date.prototype` 上的方法：**

`now.getFullYear()` `now.setFullYear()`：设置或获取年份；set 方法还可一并设置月、日

`now.getMonth()` `now.setMonth()`：设置或获取月份，**月份从0开始，到11为止**；set 方法还可一并设置日

`now.getDate()` `now.setDate()`：设置或获取日，取值 1~31；设置小于或超过当前月范围的，会自动转换成上/下个月的对应日

`now.getDay()` `now.setDay()`：设置或获取每周的第几天（周几）

`now.getHours()` `now.setHours()`：设置或获取小时数，取值 0~23

`now.getMinutes()` `now.setMinutes()`：设置或获取分钟数，取值 0~59

`now.getSeconds()` `now.setSeconds()`：设置或获取秒数，取值 0~59

`now.getMilliseconds()` `now.setMilliseconds()`：设置或获取毫秒数，取值 0~999

`now.getTime()` `now.setTime()`：设置或获取时间戳，它是自 1970 年开始至今的毫秒数

**以上的 getXxx、setXxx 方法均有对应的 setUTCXxx、getUTCXxx 前缀的版本，表示以世界时为标准**  

-----

**`Date` 上的方法：**

`new Date()`：可以创建一个时间日期对象，它有多种重载：

- `new Date()`：以当前时间创建

- `new Date(num)`：参数为一个数字，按照时间戳来创建

- `new Date(str)`：参数为一个字符串，格式化字符串创建时间日期对象，**注意用这种方式创建出的日期，如果不指定时间，它会加上时区偏移，例如在中国 GMT+8 时区执行代码 `new Date('2022-12-16')` 得到的时间是早上 8:00，但是 `new Date(2022, 11, 16)` 这样得到的就是凌晨 0:00**

- `new Date(year, month, day, hour, minute, second, millisecond)`：按照给定的参数创建，`year` 后的参数可选，不提供的参数默认为最小值

`Date.now()`：返回当前时间的时间戳

`Date.parse(str)`：**不推荐使用**，解析一个时间日期字符串并返回时间戳，无法解析时返回 `NaN`

`Date.UTC()`：接受参数类似 `new Date()` 的最后一种重载方式，但是该方法返回时间戳

-----

备注：JS 中的时间戳是 1970 年 1 月 1 日 00:00:00 距今的**毫秒数**，其他语言可能是秒数而不是毫秒数，需要注意。



# Boolean 相关
`new Boolean(val)`：生成一个 `Boolean` 对象，不推荐使用

`Boolean(val)`：强制转换一个值为布尔值

以下几个值会转换为 `false`：`0`、`-0`、`null`、`undefined`、`NaN`、`''`、`document.all`，其他值均为 `true`



# Symbol 相关
**`Symbol` 上的方法：**

`Symbol(name)`：返回一个指定 `name` 的 `Symbol` 对象，此法创建的 `Symbol` 永远互不相等

`Symbol.for(name)`：尝试按指定的 `name` 来查找 `Symbol` 对象并返回找到的，如果找不到则创建一个并返回；只有通过此方法创建的 `Symbol` 才能被此方法找到

`Symbol.keyFor(symbol)`：如果一个 `Symbol` 是通过 `Symbol.for()` 方式创建的，则可以通过该方法反查它被创建时候的 `name` 参数值，传入不是 `Symbol` 类型的参数会抛出错误，如果传入的 `Symbol` 不是通过 `Symbol.for()` 创建的或是找不到它的 `name` 则返回 `undefined`

注意：`Symbol` 对象无法使用 `new` 创建。

-----

**`Symbol` 上的常量：**

在对象上定义的 `Symbol` 常量作为键的属性不会被 `for ... in` 遍历到；对对象执行一些操作，例如转为原始值、访问迭代器等行为（通常都是 JS 隐含执行的行为）时，JS 引擎会优先从对象上寻找键为这些 `Symbol` 常量的方法或值去执行这些操作。



`Symbol.hasInstance`：函数，重载 `instanceof` 运算符的实现，此函数的参数为 `instanceof` 运算符的左值；一般用做类上的静态方法；举例：

``` js
class A {
  // 推荐写法。用做静态方法，属于类 A
  static [Symbol.hasInstance](instance) {
    return instance > 5
  }
  
  // 不推荐。非静态方法，此属性属于每个 A 的实例
  [Symbol.hasInstance](instance) {
    return instance > 50
  }
}

// 使用 instanceof 运算符，会调用键为 [Symbol.hasInstance] 的方法来判断
// 此时会把 instanceof 运算符左边的值作为参数
// 以类名作为右值，调用类上的静态方法
1 instanceof A === false
10 instanceof A === true

const a = new A
// 以实例作为右值，调用实例上的方法，即类上定义的非静态方法
10 instanceof a === false
100 instanceof a === true
```



`Symbol.species`：属性，指向一个构造器，一般只会在自定义的类用 `extends` 继承 JS 中原生类型时用到，JS 里的原生类型（例如 `Array`、`Date` 等）在调用实例方法返回同类型的对象时（例如 `Array.prototype.map()` 就是返回一个 `Array` 类型），会优先使用当前类上的 `Symbol.species` **静态属性**来作为构造器，如果它不存在，才使用自身的构造器

通常情况，`map()` 方法使用自身的构造器构造新的对象并返回：

```js
class MyArray extends Array { }

const myArray = new MyArray(1, 2, 3)
const result = myArray.map(t => t * 2)

// 此时 result 是 MyArray 的实例
// 因为 Array.prototype.map() 返回的新数组使用了自身的构造器
result instanceof Array === false
```

使用 `Symbol.species` 重载：

```js
class NewArray extends Array {
  // 属性不能写成这种形式，会报错（方法可以这样写）：
  // [Symbol.species]: Array
  
  // 因此必须使用 get 访问符这种形式来写：
  static get [Symbol.species]() {
    return Array
  }
}

const newArray = new NewArray(1, 2, 3)
const newResult = newArray.map(t => t * 2)

// 因为重载了 [Symbol.species] 属性，此时会使用此属性的构造器来构造对象
newResult instanceof Array === true
```

因为只有 JS 原生对象会用到这个属性（ECMA-262 7.3.22），所以如果没有继承原生的类，则无需用到这个属性；如果通过 JS 来模拟原生对象的这个行为，代码大致同：

```js
class A {
  getNewSelf() {
    // 优先从原型上找 [Symbol.species] 来作为构造器
    if (this.constructor[Symbol.species]) {
      return new this.constructor[Symbol.species].prototype.constructor()
    }
    
    return new this.constructor()
  }
}

// 下面是测试代码
class B extends A { }
class C extends A {
  static get [Symbol.species]() {
    return A
  }
}

new B().getNewSelf() instanceof A === false
new C().getNewSelf() instanceof A === true
```



`Symbol.iterator`：函数，迭代器，已实现（或已继承）此属性的对象是一个可迭代对象，即它可被 `for ... of` 遍历或者被 `...` 展开运算符展开；迭代器可以是一个 `function *` 方式声明的生成器函数，其中使用 `yield` 返回值，或是一个返回**迭代器对象**的方法；其实两者是等价的，因为调用生成器函数时返回值就是迭代器对象；举例：

```js
let idx1 = 0, idx2 = 0

// 生成器函数的例子
const generatorIterator = {
  *[Symbol.iterator]() {
    while(++idx1 <= 5) {
      yield idx1
    }
    // 别忘了重置索引
    idx1 = 0
  }
}

// 可迭代对象的例子
const iterableObject = {
  [Symbol.iterator]() {
    return {
      next() {
        if(++idx2 > 5) {
          // 别忘了重置索引
          idx2 = 0
          return { done: true }
        }
        return { done: false, value: idx2 }
      }
    }
  }
}

// 结果都是 [1, 2, 3, 4, 5]
[...generatorIterator].toString() === '1,2,3,4,5'
[...iterableObject].toString() === '1,2,3,4,5'
```



`Symbol.toPrimitive`：函数，提供对象转换成原始值的转换函数，参数形式 `fn(hint)`，参数 `hint` 表示当前正在试图转换为的值类型，可以是 `'number'`（数值）、`'string'`（字符串）、`'default'`（原始值），参考以下示例：

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    console.log('hint=', hint)

    return 888
  },
}

1 + obj
// 会打印 "hint= default"，因为“+”运算符对数值和字符串都可用

2 * obj
// 会打印 "hint= number"，因为“*”运算符是专用于数值类型的

`${obj}`
// 会打印 "hint= string"，原因很直观不再赘述
```



`Symbol.toStringTag`：函数，调用此对象的 `.toString()` 或是将此对象传入 `Object.prototype.toString.call()` 得到的字符串如果形如 `[object Object]` 这种两个字符串的形式，该函数定义了后面那个字符串 `Object` 的值

`Symbol.unscopables`：对象，表示在使用 `with` 运算符时，对象中值为 `truly` 的键名会被 `with` 环境排除；此属性的设计目的可以参考这篇 [知乎回答](https://www.zhihu.com/question/364970876/answer/965013908)；举例：

``` js
const toString = function () {
  console.log(111)
}

const a = {}
with (a) {
  toString()
  // 此时会打印出 "[object Object]"
}

const b = {
  [Symbol.unscopables]: { toString: true }
}
with (b) {
  toString()
  // 此时会打印出 111
  // 因为 Symbol.unscopables 其中有 toString 属性
  // 这会使 with 排除掉 b 对象上的 toString 属性
}
```



`Symbol.isConcatSpreadable`：布尔值，一般只有 array-like 对象才会用到，定义对象是否可以被调用 `Array.prototype.concat()` 时展开，只有值为 `false` 时不能展开

-----

**字符串与正则相关的：**

`Symbol.match`：函数，执行 `str.match(obj)` 时会调用这个函数，`str` 作为此函数的第一个参数；它可被设为 `false`  以标示此对象不具备正则表达式的行为

`Symbol.replace`：函数，执行 `str.replace(obj)` 时会调用这个函数，`str` 作为此函数的第一个参数

`Symbol.search`：函数，执行 `str.search(obj)` 时会调用这个函数，`str` 作为此函数的第一个参数

`Symbol.split`：函数，对象被 `str.split(obj)` 时会调用这个函数，`str ` 作为此函数的第一个参数



# Error 相关
**`Error` 的构造器：**

`new Error(text)`：创建一个错误，其中的参数为提示文字

-----

**内置的错误类型：**

`EvalError`：使用 `eval()` 动态执行代码时出错

`RangeError`：变量或参数超出有效范围

`ReferenceError`：无效的引用

`SyntaxError`：语法解析错误

`TypeError`：变量或参数不属于有效类型

`URIError`：使用 `encodeURI()` 系列方法时参数无效

`InternalError`：这不是标准规范中的错误类型，它表示引擎内部错误，例如递归层数过多

-----

**错误对象的原型属性：**

`Error.prototype.name`：错误的名称

`Error.prototype.message`：错误的提示信息



# RegExp 相关
**`RegExp` 的构造器：**

`new RegExp(regExpStr, [flags])`：使用给定的字符串和标志位创建正则表达式

`/regExpStr/flags`：同上，这种方式创建正则表达式不需要转义字符串

-----

**正则表达式的标志位 `flags` 的含义和用法：**

`g`，`RegExp.prototype.global`：全局匹配，将对匹配目标从头到尾多次匹配符合的内容，未开启此标志位则会在第一次匹配后停止

`i`，`RegExp.prototype.ignoreCase`：忽略大小写

`m`，`RegExp.prototype.multiline`：多行模式，`^ $` 将适用于每一行而不是整体

`u`，`RegExp.prototype.unicode`：开启 unicode 支持

`y`，`RegExp.prototype.sticky`：粘连匹配，即后一个匹配位置必须紧邻前一个

`s`，`RegExp.prototype.dotAll`：点 `.` 可以表示任何单个字符，包括行终止符

-----

**`RegExp.prototype` 上的属性：**

`/xxx/.source`：当前正则表达式模式字符串

`/xxx/.flags`：当前正则表达式所有标志位，是一个字符串

`/xxx/.lastIndex`：开启 `g` 标志位时有效，表示下一次匹配开始位置，在达到字符串长度后重设为 0

`/xxx/.test(str)`：返回与指定字符串匹配与否的布尔值；开启 `g` 标志位后将修改 `.lastIndex`，可以用于多次匹配

`/xxx/.exec(str)`：返回值同 `String.prototype.match(reg)`



# Map、Set 相关
**`Map` 的构造器：**

`new Map(initial = {})`：创建一个 `Map` 对象；注意**键之间是用 `Object.is` 进行比较**

-----

**`Map.prototype` 上的属性：**

`map.size()`：获取元素个数

`map.get(key)` `map.set(key, value)`：获取/设置键值

`map.delete(key)` `map.clear()`：依键删除/全部删除

`map.has(key)`：依键判断是否存在

`map.keys()` `map.values()` `map.entries()`：返回所有键/值/键值对数组 `[key, value]` 的枚举器

`map.forEach(fn, [thisArg])`：依次对键值执行回调，回调形如 `fn(key, value, map)`

-----

**`Set` 的构造器：**

`new Set(initial = [])`：创建一个 `Set` 对象，可以使用可迭代对象作参数

-----

**`Set.prototype` 上的属性：**

`set.size()`：获取集合中元素的个数

`set.add(item)` `set.delete(item)` `set.clear()`：添加/删除/清空元素

`set.keys()` `set.values()` `set.entries()`：返回所有键/值/键值对的枚举器；**注意 `Set` 的键和值完全相同**

`set.forEach(fn, [thisArg])`：依次对元素执行回调，回调形如 `fn(item, set)`



# WeakMap、WeakSet 相关
它们的构造器形如 `Map` 和 `Set`，此处不再赘述。

-----

`WeakMap.prototype` 只具有以下方法：`weakMap.get(key)` `weakMap.set(key, value)` `weakMap.has(key)` `weakMap.delete(key)`

没有 `weakMap.clear()`

-----

`WeakSet.prototype` 只具有以下方法：`weakSet.add(item)` `weakSet.delete(item)` `weakSet.has(item)` `weakSet.clear()`



# Promise 相关
**`Promise` 的构造器：**

`new Promise(task)`：创建一个 `Promise`，参数形如 `task(resolve, reject)`，**注意必须在参数的方法中调用 `resolve()` 或者 `reject()`，否则 `Promise` 将一直处于 `pending` 状态**

-----

**`Promise` 上的方法：**

`Promise.all(tasks)`：返回一个新的 `Promise`，数组中所有的 `Promise` 完成后它才会完成，这些 `Promise` 的返回值会按照该调用时候的顺序组合成一个数组来作为它的返回值；如果任一 `Promise` 失败，它也将失败，失败值为首个失败的 `Promise` 的原因

`Promise.allSettled(tasks)`：同上，但在任一 `Promise` 失败时它不会失败，而是等到所有 `Promise` 都已完成或失败，将结果组成数组返回

`Promise.race(tasks)`：返回一个新的 `Promise`，数组中任一的 `Promise` 完成或失败后，它直接变为相应的状态，值也变为相应的完成值或失败原因

`Promise.any(tasks)`：同上，但数组里所有 `Promise` 都已失败时它才会失败，失败值是一个数组

`Promise.resolve()`：将一个值包装成 `Promise`，已经是 `Promise` 的值将直接返回；如果带有 `.then()` 方法还将调用之

`Promise.reject()`：行为类似 `Promise.resolve()`，但是将参数作为原因包装成已失败的 `Promise`

-----

**`Promise.prototype` 上的方法：**

`task.then(resFn, [rejFn])`：接受的值（`resolve()`）或错误值（`reject()` 或抛出的错误）会传入 `resFn()` 或 `rejFn()`；可以继续添加 `.then()`，`resFn()` 方法的返回值将作为它 `.then()` 中回调方法的参数继续传递（但是 `Promise` 构造器参数函数的返回值不会进入 `.then()`）

`task.catch(rejFn)`：处理错误的情况

`task.finally(fn)`：不论完成还是失败都将执行，**注意 `fn` 回调没有任何参数**

-----

**`Promise` 的特点：**

```js
new Promise((res, rej) => {
  // 完成值为 888
  res(888)
  // 方法不会停止，还会继续运行
  console.log(1)
  // 此返回值没有意义
  return 777
  
}).then(data => {
  // 回调中的值为 res() 传入的值 888，而不是返回值 777
  data === 888
  // then 方法中的返回值，下一个 then 可以使用
  return 999
  
}).then(data2 => {
  // 这里 data2 是上一步 return 的值 999
  data2 === 999
})
```



# Proxy、Reflect 相关
**`Proxy` 的构造器：**

`new Proxy(target, handler)`：创建一个代理对象，包装 `target` 对象，使用 `handler` 对象里的属性方法来代理行为

`Proxy.revocable(target, handler)`：同上，创建一个可撤销代理的对象，它的 `.proxy` 属性与上面的方法返回值相同，但额外包含一个 `.revoke()` 方法，调用该方法可以永久撤掉代理

-----

**`Reflect` 没有构造器，我们只使用它的静态方法：**

`Reflect.apply(func, thisArg, args)`：类似于 `func.apply(thisArg, args)`

`Reflect.construct(func, args, [newTarget])`：类似于 `new func(...args)` 表达式，如果指定了 `newTarget` 参数，会改变 `new.target` 值

`Reflect.defineProperty(obj, propName, desc)`：类似于 `Object.defineProperty()`

`Reflect.deleteProperty(obj, propName)`：类似于 `delete obj[propName]` 表达式

`Reflect.get(obj, propName)`：类似于 `obj[propName]` 表达式

`Reflect.set(obj, propName, newValue)`：类似于 `obj[propName] = newValue` 表达式

`Reflect.has(obj, propName)`：类似于 `propName in obj` 表达式

`Reflect.ownKeys(obj)`：类似的行为见下表，返回一个对象自身（不含原型链上的）所有的键名组成的数组，它包括 `Symbol` 键和不可枚举的属性，可以看做 `Object.getOwnPropertyNames(obj)` 和 `Object.getOwnPropertySymbols(obj)` 返回值的总合

`Reflect.getOwnPropertyDescriptor(obj, propName)`：类似的行为见下表

| 用户对 `obj` 对象执行的操作，打钩的项表示会触发代理的 handler | `ownKeys` | `getOwnPropertyDescriptor` |
| ------------------------------------------------------------ | --------- | -------------------------- |
| `Object.keys(obj)` <br />`Object.valuse(obj)`<br />`Object.entries(obj)` | √         | √，且必须可枚举            |
| `for ... in obj`                                             | √         | √，且必须可枚举            |
| `Object.getOwnPropertyNames(obj)`                            | √         |                            |
| `Object.getOwnPropertySymbols(obj)`                          | √         |                            |
| `Object.getOwnPropertyDescriptor(obj, propName)`             |           | √                          |
| `Object.getOwnPropertyDescriptors(obj)`                      | √         | √                          |

`Reflect.getPrototypeOf(obj)`：类似 `obj.__proto__` 或是 `Object.getPrototypeOf(obj)`，获取一个对象的原型链上的对象

`Reflect.setPrototypeOf(obj, val)`：类似 `obj.__proto__ = val` 或是 `Object.setPrototypeOf(obj, val)` 设置一个对象的原型链对象

`Reflect.isExtensible(obj)`：类似于 `Object.isExtensible(obj)`

`Reflect.preventExtensions(obj)`：类似于 `Object.preventExtensions(obj)`

-----

创建代理的方法其 `handler` 参数是一个对象，在对代理对象执行一些动作时，会按照 `Reflect` 上定义的行为找到对应的方法名，调用 `handler` 上同名的方法（第一个参数 `obj` 为原对象本身），用法示例：

```js
const a = {}
const b = new Proxy(a, {
  // 拦截 in 运算符，带字母 'x' 的判断均返回 true
  has(_self, propName) { return propName.includes('x') },
  
  // 拦截属性访问，均返回 888
  get() { return 888 },
  
  // 一般下面这两个要成对使用
  ownKeys() { return ['aa', 'bb', 'cc'] },
  getOwnPropertyDescriptor(_self, propName) {
    // 切记属性要可配置 + 可枚举，不然不好用
    return { configurable: true, enumerable: true }
  },
})

// 对应 has
'a' in b === false
'x' in b === true

// 对应 get
b.a === 888
b.xxx === 888
```



# Generator 与 Iterator 相关
**生成器方法：**

形如 `function* func()` 的方法是生成器方法，它可以使用 `yield` 来向外输出值，每次获取迭代值时会运行到 `yield` 语句并将迭代值输出，代码运行到的位置会保留，如果需要获取下一次结果，则从之前运行的位置继续运行，如果运行到方法结尾或是 `return` 语句，则表示不再有新的值了，本次迭代结束。

**迭代器对象：**运行生成器方法，会返回一个**迭代器对象**

**可迭代对象：**假设对象 `obj` 包含 `.[Symbol.iterator]()` 方法属性，且此方法返回一个迭代器对象，那么该对象 `obj` 就是可迭代对象；我们可以对此对象执行 `[...obj]`、`for(const item of obj)`、`new Set(obj)` 等迭代操作而不会报错

-----

**迭代器对象：**

迭代器对象形式如下：

```js
const iteratorObject = {
  // 获取下一个结果值或获取结束标志
  next() { /* ... */ return { done, value } },
  // 迭代器提前结束时调用它，它也需要返回一个完成值
  return() { /* ... */ return { done: true, value } },
  // 抛出异常，它也需要返回一个完成值
  throw() { /* ... */ return { done: true, value } },

  // 如果不实现此属性，此对象视为不可迭代对象，会报错
  // 实现方式可以这么认为
  [Symbol.iterator]() { return this }
}
```

**JS 原生的迭代行为：**

每次执行迭代均会生成一个迭代器对象，JS 会不断地调用它的 `next()` 方法，直到迭代完毕；仅当迭代**提前结束时**，例如 `for` 循环中使用 `break` 或**抛出错误**，JS 会调用其 `return()` 方法。

**手动迭代的调用方式：**

`iteratorObject.next([val])`：获取下一个结果，结果是一个对象类似 `{ done, value }`，`done` 属性是一个布尔值表示迭代是否结束，它为 `true` 时 `value` 可以没有或者为空，`value` 为结果值；调用 `next()` 方法时可传入一个参数，此参数会成为生成器函数的 `yield` 语句的返回值，**但是首次调用 `next()` 时传入的参数是无效的，不会成为 `yield` 语句返回值，因为 JS 会执行到 `yield` 语句输出值后就会暂停而不会执行后续的任何代码，此时 `yield` 还没返回值，下一次调用 `next()` 时传入的参数会直接覆盖掉第一次传的直接作为 `yield` 语句的值赋值给变量，然后运行后续代码，直到再执行到 `yield` 语句输出值为止**，举例：

```js
let idx = 0
// 一个生成器函数
function* genFunc() {
  while(++idx <= 3) {
    const nextProp = yield idx
    console.log('接收到 next 方法传入值：', nextProp)
  }
  idx = 0
}

// 自动迭代结果即为 [1, 2, 3]
[...genFunc()].toString() === '1,2,3'

// 获取迭代器对象并手动调用 next() 方法
const iteratorObj = genFunc()
iteratorObj.next(111)
// 返回 { done: false, value: 1 }
// 此时不会打印任何内容，因为 yield 还没返回

iteratorObj.next(222)
// 返回 { done: false, value: 2 }
// 打印：接收到 next 方法传入值：222
// 之前的 111 便被丢弃了，因为新的参数 222 直接作为 yield 的返回值

iteratorObj.next(333)
// 返回 { done: false, value: 3 }
// 打印：接收到 next 方法传入值：333

iteratorObj.next(444) 
// 返回 { done: true }，且后续调用 .next() 返回值均相同
// 打印：接收到 next 方法传入值：444
// 此时会打印是因为从上一次调 next() 的 yield 语句返回值位置开始执行的，还会走打印语句
```

`iteratorObject.return([val])`：提前结束生成器，也就是返回一个 `{ done: true }` 的对象；可以传入一个参数，参数将成为`value`属性；若未提供返回值则会在被调用后报错

`iteratorObject.throw(error)`：参数是一个错误对象，向生成器抛出一个异常，如果 `yield` 语句被 `try ... catch` 包裹，则此异常会被捕获；若未提供返回值则会在被调用后报错
