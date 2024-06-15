---
title: JavaScript 标准库备忘
date: 2018-04-11 15:01:40
tags:
- JS
- Cheatsheet
categories:
- JS
---

持续记录并提供 JavaScript 标准库的 API 的使用技巧、避坑、示例代码等。
建议特别留意 “Symbol” 章节、第一个章节、最后三个章节，这部分内容较为精华。



# 全局变量和全局方法

**全局变量：**

- `Infinity`
  无穷大，也可以使用 `Number.POSITIVE_INFINITY` 来代指；

- `NaN`
  非数字，非法的数学运算会产生这个值；也可以使用 `Number.NaN` 来代指；注意 `NaN` 不和任何值相等，即使是两个 `NaN` 也是互不相等的；

- `undefined`
  表示未定义的值，可以使用 `void` 运算符来得到 `undefined`，例如 `void 0`；
- `null`
  表示为空的值，需要注意的是 `typeof null === 'object'`。

-----

**编码类全局方法：**

- `encodeURI()`
  编码一个 URI 字符串，它会将 URI 地址中不合法的部分（如空格、中文等字符）转码成如同 `%20` 这种值，无法完成时会产生 `URIError` 错误；
- `decodeURI()`
  解码一个已被编码的 URI 字符串；
- `encodeURIComponent()`
  编码一个 URI 的**参数部分**，与上面的方法不同的是，因为 URI 的参数一般是 `?a=1&b=2` 这种形式，所以 `?=&/#` 等字符也都不再合法，必须编码后使用，因此此方法编码的字符类型比 `encodeURI()` 更多，是包含关系；
- `decodeURIComponent()`
  解码一个已被编码的 URI 参数部分的字符串；
- `escape()`
  此方法已被标记为废弃，不建议使用；它也会编码和解码字符串，编码的结果和 `encodeComponentURI()` 很像都是带百分号但是格式并不一样，切勿混淆；
- `unescape()`
  此方法已被标记为废弃，不建议使用；解码一个已被 `escape()` 编码的字符串；它也会使用 Unicode 的解码方式，支持解码例如 `\u0107` 这种带有 `\u` 前缀的编码内容。

**注意：** JS 中的 `encodeURIComponent()` 转码方法不符合 RFC 3986 规范，它不会转换 `!'()*` 这些字符，涉及到这些字符时可能与一些后端语言有出入。如果需要处理上述的情况，使用这个方法：

``` js
function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
```

-----

**数值类全局方法：**

- `isNaN()`
  判断输入值是否为非数值，它会尝试将输入值转换为数值，如果转换后还是无法当做数值，那么返回 `true`；
  注意它和 `Number.isNaN()` 不同，`Number.isNaN()` 对不是 `NaN` 的值永远返回 `false`；

- `isFinite()`
  判断输入值是否有限，它会尝试将输入值转换为数值，只有输入值能当做数值并且有限，才会返回 `true`；
  注意它和 `Number.isFinite()` 不同，`Number.isFinite()` 对非数值类型永远返回 `false`；

- `parseInt(str, radix)`
  从字符串中解析整数，按照从左往右顺序并忽略空格，如果遇到非法字符则停止解析并保留已解析的部分，返回解析出来的数值或 `NaN`；注意它不支持科学计数法，且不会识别小数点；
  还可以传入第二个参数 `radix` 表示进制数；默认情况只有 0x 开头的字符串会当做十六进制，**建议在任何使用场景下都须传入第二个参数**；
  此方法完全等于 `Number.parseInt()`，但更好的选择是 `Number()`；

- `parseFloat()`
  从字符串中解析浮点数，具体方式同上，但是此方法不支持指定进制数；
  此方法完全等于 `Number.parseFloat()`，但更好的选择是 `Number()`。

-----

**定时器方法：**

**注意：**定时器方法属于宿主方法，不属于 JS 标准库，因此浏览器和 Node.js 上的实现是有区别的。

- `setTimeout(callback, delay = 0, [args...])`
  指定延迟毫秒后执行对应的方法，还可以提前指定好要传入的参数 `args`，在浏览器上它返回一个数字 ID 用于清除定时器，在 Node.js 上它返回一个 `Timeout` 对象（但是带有 `[Symbol.toPrimitive]` 方法属性以转为数值，所以也可以当做数值来看待）；
  `delay` 为 0 则回调会直接在本轮事件循环的宏任务（比 `Promise` 的微任务更晚）中执行；

- `clearTimeout(id)`
  传入定时器的 ID 以清除定时器；

- `setInterval(callback, delay = 0, [args...])`
  循环地每隔指定延迟毫秒后执行对应的方法，还可以提前指定好要传入的参数 `args`，它的返回值行为和 `setTimeout()` 相似；

- `clearInterval(id)`
  传入循环定时器的 ID 以清除定时器。

------

**不推荐使用的全局方法：**

- `eval()`
  执行传入其中的 JS 代码，返回这些代码执行后的返回值；
  需要注意的是，**直接调用该方法，如果产生了变量则是局部变量，而通过引用调用该方法，则会生成全局变量**；
  这个方法的性能很差，且会产生变量的泄露，所以推荐使用 `new Function()` 的方式取代它。



# Array.prototype
**属性：**

- `array.length`
  表示数组长度；
  减小该值将删去尾部元素，增加该值则会用 `undefined` 占位，不推荐修改此值。

-----

**会修改数组的方法，增删元素：**

- `array.push(item)`
  “尾追加”，修改数组，末尾追加一个元素，返回数组新的长度；

- `array.pop()`
  “尾删除”，修改数组，末尾移除一个元素，返回移出的元素；

- `array.unshift(item)`
  “头插入”，修改数组，开头追加一个元素，返回数组新的长度；

- `array.shift()`
  “头删除”，修改数组，开头移除一个元素，返回移出的元素；

- `array.splice(start = 0, [delLength = array.length,] [...newItem])`
  “万能增删”，修改数组，从指定下标元素的前一位开始删除数个元素，然后再插入数个元素，返回被删除的元素的数组；
  这是原生 JS 中最强的数组调整函数，可从任意位置一次性删除并插入多个元素；
  它也有不会修改数组自身的版本，见下文的 `.spliced()` 方法。

-----

**会修改数组的方法，调序或填充：**

- `array.reverse()` 
  “反转数组”，修改数组，反转所有元素的顺序，返回自身；
  它也有不会修改数组自身的版本，见下文的 `.toReversed()` 方法；

- `array.sort([sortFn])` 
  “排序数组”，修改数组，按照给定的排序回调来排序，返回自身；
  注意**回调 `sortFn` 默认会将元素按字符串顺序排序**，所以建议一定提供一个排序函数作为参数，不要留空；
  它也有不会修改数组自身的版本，见下文的 `.toSorted()` 方法；

- `array.fill(value | fillFn, [start = 0,] [end = array.length])`
  “填充数组”，修改数组，将所有元素填充成指定的值 `value` 或回调方法 `fillFn` 的返回值，还可以指定填充范围开始和结束的下标；
- `array.copyWithin(target, [start = 0,] [end = array.length])`
  “复制回填”，修改数组，从 `target` 下标位置开始，将数组从 `start` 到 `end` 下标顺序的元素复制并回填，此方法不会导致数组的长度发生改变；三个参数都支持负值，从数组尾部计数。

-----

**不会修改数组内容的方法：**

- `array.concat(...arrsOrValue)`
  “连接数组”，返回一个当前数组连接所有值和数组后的新数组；

- `array.join(separator = ',')`
  “转字符串”，返回当前数组用给定分隔符连接形成的字符串；
- `array.flat([depth = 1])`
  “拍平”，展平数组，返回新的数组作为结果，可以提供展平深度的参数；
- `array.flatMap(fn, [thisArg])`
  “定制拍平”，同上，但会使用回调来处理每个元素，以回调的返回值为准；展平的深度固定为 `1`；
- `array.every(fn, [thisArg])`
  “全部满足”，依次对元素执行回调，只有在所有回调均返回真值结果，该函数才返回 `true`，否则返回 `false`；

- `array.some(fn, [thisArg])`
  “任一满足”，同上，但是任何回调返回真值时该函数直接返回 `true`。

-----

**从数组中检索元素的方法：**

- `array.at(index)`
  类似于下标访问，但它支持负数，会从数组尾部开始算（最尾部元素下标为 `-1`）；

- `array.includes(item, [fromIndex = 0])`
  返回数组是否包含某个元素的布尔值；

- `array.indexOf(item, [fromIndex = 0])` / `array.lastIndexOf()`
  返回给定元素在数组中首次/末次出现的下标位置，找不到则返回 `-1`；

- `array.find(fn, [thisArg])` / `array.findLast()`
  从数组中找到并返回首个/末个能使回调 `fn` 返回真值的元素，找不到则返回 `undefined`；

- `array.findIndex(fn, [thisArg])` / `array.findLastIndex()`
  从数组中找到并返回首个/末个能使回调 `fn` 返回真值的元素的下标，找不到则返回 `-1`。

-----

**筛选数组的方法：**

- `array.filter(fn, [thisArg])`
  “筛选”，提取能使回调 `fn` 返回真值的元素，形成新数组返回；

- `array.slice(start = 0, [end = array.length])`
  “截取”，选取从开头到结尾下标的元素组成新数组并返回，参数可以为负数。

-----

**遍历数组的方法：**

- `array.forEach(fn, [thisArg])`
  “遍历”，依次对元素执行回调；

- `array.map(fn, [thisArg])`
  “变换”，依次对元素执行回调，将返回值形成新数组返回。

-----

**聚合计算数组的方法：**

- `array.reduce(reduceFn, [initValue = array[0]])`
  “折叠”，接受回调 `reduceFn(sum, current, index, array)`，参数依次是之前的计算结果、当前元素的值、当前元素的下标、原数组，依次对数组中的元素执行回调，并将结果用于下一个元素的计算；
  此方法将数组所有项聚合为一个数据，可用于实现求和、数组转对象等一系列需求；

- `array.reduceRight(reduceFn, [initValue = array[array.length - 1]])`
  “右折叠”，同上，但从数组尾部开始，反向遍历。

-----

**特地避免修改数组的方法：**

- `array.with(index, value)`
  将指定下标的元素修改为 `value`，下标支持负值，返回修改后的新数组，不会修改原数组；
- `array.toSpliced(start = 0, [delLength = array.length,] [...newItem])`
  是 `.splice()` 的无副作用版本，返回修改后的新数组，不会修改原数组；
- `array.toReversed()`
  是 `.reverse()` 的无副作用版本，返回修改后的新数组，不会修改原数组；
- `array.toSorted([sortFn])`
  是 `.sort()` 的无副作用版本，返回修改后的新数组，不会修改原数组。

-----

**补充说明：**

- 以上所有需要遍历数组元素的方法，以开始执行时的数组长度为准，因此遍历过程中追加的元素不会被遍历到；
- 以上方法参数中名为 `fn` 的回调函数的签名均为 `fn(current, index, array)`，其参数：
  `current` 表示当前元素值；`index` 表示当前元素下标；`array` 表示原数组；
- 以上方法参数中名为 `thisArg` 的参数，用于设定在执行回调函数 `fn` 时，回调函数中的 `this` 指向；
- 这些遍历数组的方法，基本都会跳过对 “空位” 元素的处理，但不是遍历数组的方法，有可能将空位转为 `undefined`。



# Array
**构造函数：**

- `new Array(length)`
  仅参数为一个数值时，返回此长度的空数组，所有元素都是 “空位” 而不是 `undefined`；

- `new Array(...items)`
  多个参数时，将这些参数形成一个数组并返回；不建议这种用法，请使用 `Array.of(...items)` 代替。

-----

**静态方法：**

- `Array.form(arrLike, [mapFn,] [thisArg])`
  将伪数组或可迭代对象转为数组，`mapFn` 回调可用来变换元素，签名为 `mapFn(el, index)`；
- `Array.fromAsync(arrLike, [mapFn,] [thisArg])`
  同上，但它支持异步可迭代对象；注意兼容性（2024）；

- `Array.of(...items)`
  将多个参数转为数组并返回；

- `Array.isArray(val)`
  判断给定的值是否为数组，返回布尔值。



# String.prototype
**属性：**

- `string.length`
  返回字符串长度；

- `string[index]`
  返回指定下标的字符；注意它是只读的，修改无效。

如果需要将常用中文算两个字符，可以使用以下方法：

```js
function stringLength(str) {
  // 仅对中文有效，如果想对日文韩文等生效，调整正则表达式中的范围即可
  const cnCharRegex = /[\u4e00-\u9fff]/g;
  const cnChars = str.match(chineseCharRegex);
  const cnCharCount = chineseChars ? chineseChars.length : 0;

  return str.length + chineseCharCount;
}
```

-----

**查找与替换：**

- `string.includes(str, [start = 0])`
  判断字符串是否包含某子串并返回布尔值；

- `string.indexOf(str, [start = 0])` / `string.lastIndexOf()`
  查找并返回另一个字符串首次/末次出现的下标，找不到则返回 `-1`；

- `string.search(reg)`
  查找并返回首次匹配正则表达式子串的位置下标，查找不到则返回 `-1`；

- `string.match(reg)`
  查找并返回匹配捕获正则表达式的结果，是一个数组，下文有详细说明，未匹配则返回 `null`；
- `string.matchAll(reg)`
  同上，但它支持正则表达式带 `g` 标志位时捕获组，且要求必须开启此标志，否则会报错；
  它返回可迭代对象，其每个子结果和 `.match()` 相同；

- `string.replace(reg | str, newStr | fn)`
  将匹配正则表达式或给定字符串的子串替换为新的字符串 `newStr` 或 `fn` 回调结果；
  如果第一个参数是正则表达式且有 `g` 标记，则是全局替换，否则仅替换第一次匹配到的值；
- `string.replaceAll(reg | str, newStr | fn)`
  同上，对于字符串输入可以替换全部，对于正则输入则必须带 `g` 标记，否则会报错。

-----

**拼接与切分：**

- `string.concat(...strs)`
  拼接多个字符串并返回拼接结果；

- `string.repeat(count)`
  将字符串重复数次并连接一起，返回结果；

- `string.split(separator, [limit])`
  以指定分隔符或正则表达式将字符串分割为数组并返回，匹配分隔标识的内容会被 “吃掉”。

-----

**首尾处理：**

- `string.trim()` / `string.trimStart()` / `string.trimEnd()`
  删除两端/开头/结尾的不可见字符；

- `string.padStart(length, [fillBy = ' '])` / `string.padEnd()`
  在字符串的开头/结尾用指定字符串填充到指定长度并返回；

- `string.startsWith(str, [start = 0])` / `string.endsWith()`
  判断字符串是否以指定字串开头/结尾，返回布尔值。

-----

**字符和子串提取：**

- `string.slice(start, [end = string.length - 1])`
  按下标提取并返回字符串的一部分；参数可以为负数；

- `string.substring(start, [end = string.length - 1])`
  同上，但它可以在 `end` 小于 `start` 时自动交换二者，并具有一些额外的特性；

- `string.substr(start = 0, [length = string.length])`
  已被标记废弃；按长度提取并返回字符串的一部分；
- `string.chatAt(index)`
  类似于下标访问，提取字符串某个位置的字符；
- `string.charCodeAt(index)`
  选择字符串某下标位置的字符，返回其 BMP 范围内的 Unicode 码点；

- `string.codePointAt(index)`
  同上，但是它对超出 BMP 范围的字符支持更好，可以返回其完整的 Unicode 码点。

-----

**本地化和正规化处理：**

这里带有 “本地化 / locale” 说明的方法，一般用于带有音标的特殊国家的语言；
对于这些语种，建议配合 [`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) 上的静态方法来处理。

- `string.toLowerCase()` / `.toUpperCase()`
  返回转为小写/大写的字符串；

- `string.toLocalelLowerCase()` / `string.toLocaleUpperCase()`
  同上，但按照本地化方式处理；

- `string.normalize(opt = 'NFC')`
  按照 Unicode 正规化方式处理字符串并返回，参数还可选 `'NFD'`、`'NFKC'`、`'NFKD'`；

- `string.localeCompare(str, [loacl,] [opt])`
  用于字符串本地化排序，返回数字，可用做 `array.sort()` 的回调；参见 MDN 上的 [相关介绍](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)；
- `string.toWellFormed()`
  处理含有不合法 Unicode 码点的字符串，将这些字符替换为 `U+FFFD`，避免其他字符串 API 报错。

-----

**方法 `string.match()` 的详细用法：**

`string.match(reg)`
查找并返回匹配捕获正则表达式的值，匹配到时返回一个数组，未匹配则返回 `null`。

**当参数 `reg` 未使用 `g` 标记时：**
匹配到返回的数组，其 `0` 下标是首次匹配到的字符串，其他下标依次是使用括号 `()` 捕获的字符串；
而且：

- 此数组带有 `.index` 表示初次匹配的下标；
- 此数组带有 `.input` 表示原始输入字符串；
- 此数组带有 `.groups` 表示 [具名组匹配](http://es6.ruanyifeng.com/#docs/regex#具名组匹配) 的分组信息，是一个对象或是 `undefined`。

**当参数 `reg` 启用了 `g` 标记时：**
返回一个数组，表示所有匹配到的字符串，没有额外属性；
注意，此时 **正则表示中的括号 `()` 捕获也不生效**，如果想要捕获生效，请使用 `.matchAll()`。

-----

**方法 `string.replace()` 的详细用法：**

`string.replace(reg | str, newStr | fn)`
将匹配正则表达式或给定字符串的子串替换为新的字符串或回调结果，返回新字符串。

默认只会替换首个匹配到的子串，只有第一个参数为正则表达式且带有 `g` 标记，才会替换所有；
可以试试 `.replaceAll()` 这个方法（自 2020 年可用），它一定对所有匹配的子串进行替换。

如果第二个参数是字符串，那么可以在字符串里面使用以下转义标记：

- `$$` 表示 `$` 字符串本身；

- `$&` 表示匹配的子串；

- `` $` `` 表示匹配子串左边的剩余字符串内容；

- `$'` 表示匹配子串右边的剩余字符串内容；

- `$n` 其中 `n` 从 1 开始，`$n` 表示括号捕获的第 `n` 个字符串。

如果第二个参数是回调函数，它的签名为 `fn(match, ...p, offset, string)`；
参数：

- `match` 表示匹配的子串（即 `$&` ）；
- `p` 是多个参数，依次表示被括号捕获的字符串（即 `$n`）；
- `offset` 是匹配的子串在原字符串中的偏移量；
- `string` 是原字符串。

-----

**补充说明：**

- 字符串对象本身也是一个可迭代对象， “Generator 与 Iterator 相关” 章节介绍什么是可迭代对象；
- 字符串对象带有大量早期浏览器的旧 API，例如 `.bold()` 返回一个套了 `<b>` 标签的结果，这些 API 均已被废弃多年，请勿使用，本文亦不介绍；
- 以上方法中的 `.match()`、`.matchAll()`、`replace()`、`search()`、`split()`，都可以接受其他类型的参数输入；
  具体而言：
  例如以 `.match()` 或 `.matchAll()` 举例，实际上它接受的参数只需要实现了 `[Symbol.match]` 或 `[Symbol.matchAll]` 方法属性即可，JS 会自动调用这个方法，并把当前字符串作为参数传入；上面列出的其他几个方法也同理；
  当然 JS 内置的 `RegExp`、`String` 类型都实现了这些属性，所以我们可以直接传入使用。



# String

**构造函数与工厂：**

- `new String(input)`
  基本用不到；构造一个 `String` 对象，注意它不是原始类型 `string`，而是 `object`；
- `String(input)`
  将输入值转为字符串，数值以十进制转换，`undefined`、`null`、`true`、`false` 均会转为其自身拼写的字符串；
  输入对象时，使用其 `object[Symbol.toPrimitive]('string')` 的结果，如果无法调用或结果不为字符串，则调用其 `object.toString()` 获取返回值。

-----

**静态方法：**

- `String.fromCharCode(...num)`
  从 BMP 范围内的码点还原字符，支持 REST 参数，会拼接为字符串返回；
- `String.fromCodePoint(...num)`
  同上，但它支持 BMP 范围以外的码点；
- `String.raw(objectWithRaw, ...vars)`
  基本用不到；用于处理 [标签模板](https://es6.ruanyifeng.com/#docs/string#%E6%A0%87%E7%AD%BE%E6%A8%A1%E6%9D%BF)；标签模板介绍见下文。

-----

**关于标签模板：**

例如 `` `你好${you}，我叫${me}` `` 这个模板字符串，它由以下两个部分组成：
变量部分：有 2 个变量 `you`、`me`；
原始部分：有 3 个字符串 `'你好'`、`'我叫'`、`''`，原始部分一定会包含首尾，即使模板字符串的首尾是变量，也需一个空字符串占位；

拼接时，按照 “原始字符串”、“变量”、“原始字符串”、“变量”、……、“原始字符串” 这样交替拼接，最左侧和最右侧一定是原始字符串，所以原始字符串的数量一定比变量要多一个，一定会包住左右两侧，即使用空字符串占位；

如果用做标签模板，JS 会自动将它的原始字符串部分转为数组 `['你好', '，我叫', '']`，且此数组带有一个 `raw` 属性，指向它自身，然后变量部分会作为依次作为剩余参数；
假设标签函数为 `tag`，举例：

```js
const you = 'Alice'
const me = 'Bob'

// 标签模板
tag`你好${you}，我叫${me}`

// 下面的写法和标签模板是一样的：
const array = ['你好', '，我叫', '']
array.raw = array
tag(array, you, me)
```

而 `String.raw(objectWithRaw, ...vars)` 这个函数本身就是一个处理标签模板的函数：
第一个参数接受带有 `raw` 属性的对象，读取其 `raw` 属性当做模板字符串的原始部分；
后面的 REST 参数接受数个变量，数量为第一个参数中数组的长度减一，当做变量部分；
然后此方法会将这些参数拼接成一个完整字符串返回。

你可以将上面代码示例中的 `tag` 替换为 `String.raw`，可以发现它就是标签模板的原生实现。



# Object.prototype
**注意：**因为 JS 中的对象均继承自 `Object`，因此几乎所有对象都具备以下这些属性。

- `object.hasOwnProperty(propName)`
  返回表示对象自身（不包括原型）是否包含该属性，即使是 `undefined`；
  和 `in` 运算符不同，此方法不会检测继承而来的属性。
- `object.isPropertyOf(target)`
  返回表示该对象是否在 `target` 参数的原型链上，即该对象是否是 `target` 的原型；
  和 `instanceof` 不同，此方法不会访问参数的 `.prototype`；
- `object.propertyIsEnumerable(propName)`
  返回对象自身（不包括原型）某个属性是否能被枚举；
- `object.valueOf()`
  返回对象的原始数值形式；
- `object.toString()` / `object.toLocaleString()`
  返回对象的字符串/本地化字符串表示形式，一般返回值形如 `[object xxx]`。

-----

**关于对象转换：**

- 转为布尔值时始终为 `true`；
- 转为字符串时，JS 会先调用 `object[Symbol.toPrimitive]('string')`，结果不符合则调用 `object.toString()`；
- 转为数值时，JS 会先调用 `object[Symbol.toPrimitive]('number')`，结果不符合则调用 `object.valueOf()`。

-----

**JS 中对象的几个概念：**

- **本地对象：**JS 实现的对象，包括了 `Object`、`Number` 等；
- **宿主对象：**由当前运行宿主提供的对象，例如浏览器的 BOM 和 DOM、Node.js 的 `Process` 等；
- **内置对象：**JS 引擎内置的独立于宿主的实现的对象，在运行环境生成时即被初始化好，目前只有 `Global` 和 `Math`；
- **用户自定义对象：**开发人员代码所创建的对象。



# Object
**构造函数和工厂：**

- `new Object(input)`
  基本用不到，创建或包装一个对象并返回，传入 `undefined`、`null` 也会创建一个空对象；
- `Object(input)`
  同上，用法大致相同。

-----

**常用静态方法：**

- `Object.is(v1, v2)`
  “同值相等” 判断，类似于 `===` 运算符，但有两点例外：`+0` 不等于 `-0`、并且 `NaN` 与自身相等；

- `Object.assign(target, ...objs)`
  合并对象，将第二个开始所有参数的属性合并到 `target`，返回合并后对象；
  注意这里的合并操作是浅拷贝，重复的属性是后面的覆盖前面的；

- `Object.create(proto, [assignObj = undefined])`
  以第一个参数作为 `__proto__` 原型创建新对象；`assignObj` 参数表示要合并入新对象的属性；
  可以用它实现 “继承” 操作，也可以用它创建出原型为 `null`  的对象；
- `Object.fromEntries(entries)`
  从键值对数组创建一个对象，类似于下文 `Object.entries()` 方法的 “反向” 版本；
- `Object.hasOwn(object, propName)`
  类似 `object.hasOwnProperty()`，此为静态版本，它可适用于无原型的对象。

-----

**定义/获取属性信息：**

- `Object.defineProperty(object, propName, desc)`
  以指定的属性描述符在对象上定义属性，有关属性描述符的解释见本章节末尾处；

- `Object.defineProperties(object, props)`
  同上，第二个参数是一个对象，可以一次性为多个属性的设置描述符；

- `Object.getOwnPropertyDescriptor(object, propName)`
  获取对象自身（不包括原型）的某个属性的属性描述符，没有该属性则返回 `undefined`；

- `Object.getOwnPropertyDescriptors(object)`
  同上，但是列出对象自身（不包括原型）的所有属性的描述符。

-----

**遍历属性：**

- `Object.getOwnPropertyNames(object)`
  返回一个对象自身的（不包括原型）所有属性名数组，包括不可枚举的，**始终忽略 `Symbol` 属性**；

- `Object.getOwnPropertySymbols(object)`
  返回一个对象自身的（不包括原型）所有 `Symbol` 类型的属性数组；

- `Object.keys(object)` / `Object.values(object)`
  获取对象的自身（不包括原型）的键/值的数组；

- `Object.entries(object)`
  获取对象自身（不包括原型）的键值对数组 `[key, value]` 的数组。

-----

**原型操作：**

- `Object.setPropertyOf(object)`
  设置一个对象的 `__proto__` 原型链；

- `Object.getPropertyOf(object)`
  获取一个对象的 `__proto__` 原型链。

-----

**封闭类操作：**

- `Object.preventExtensions(object)`
  阻止扩展对象，使它无法添加属性；

- `Object.seal(object)`
  密封对象，阻止增/删/配置属性；

- `Object.freeze(object)`
  冻结对象，阻止增/删/配置属性，对象的任何属性值均无法修改；

- `Object.isExtensible(object)` / `Object.isSealed()` / `Object.isFrozen()`
  判断对象是否被阻止扩展/密封/冻结。

-----

**关于属性描述符：**

属性描述符是一个对象，存在两种形式，分为**数据描述符（默认）**和**存取描述符**，只能使用其中一种；

无论是哪种形式，它始终具备下面两个属性：

- `.enumerable` 表示可枚举性，不可枚举的属性无法被 `for...in...` 等方式遍历到；
- `.configurable` 表示可配置性，不可配置的属性无法被删除，属性描述符也不能被修改；

此外，如果是**数据描述符**的形式，它具备以下属性：

- `.value` 表示值本身；
- `.writable` 表示值是否可被修改；

如果是**存取描述符**的形式，它具备以下属性：

- `.get()` 一个取值函数；
- `.set(newValue)` 一个存值函数，它有一个参数表示新的值。

在一个对象上直接定义新的属性时，它的描述符各属性均默认为 `true`；
**但使用 `Object.defineProperty()` 定义的新的属性时，它的描述符的各属性默认为 `false`，这一点非常值得注意。**



# Function 相关

**构造函数和工厂：**

- `new Function([...argStrs], funcStr)`
  前面的参数表示函数的参数字符串，最后一个表示函数体的代码，生成一个这样的函数；
- `Function([...argStrs], funcStr)`
  同上，用法一致。

动态创建的函数具备以下特点：

- 这个方法只能访问全局变量，任何局部变量都无法访问到，这一点和 `eval()` 不同；
- 用法比较自由，参数里可以带注释，`argStrs` 中多个参数也可以写在一个字符串里；
- 创建出的方法，其 `name` 固定为 `'anonymous'`；
- 它的性能比 `eval()` 要好，所以推荐使用它取代 `eval()`。

代码示例：

```js
// 测试对注释的支持：
const f1 = new Function('a', 'b = 10 /* 我是注释 */', 'return a + b // 我也是注释')
f1(4) 
// 结果：14

// 测试多个参数写成一个字符串
const f2 = Function('a, b', 'return a + b')
f2(10, 20) 
// 结果：40

// 测试对局部变量的访问
(function(){
  const a = 888
  const f3 = Function('return a')
  console.log(f3())
  // 会立即报错，因为 a 不存在
})()
```

-----

**`Function.prototype` 实例的属性：**

- `function.name`
  返回方法名，匿名方法返回 `'anonymous'`；

- `function.length`
  返回方法所需要参数个数，**注意带默认值的参数、剩余参数都是不计入的**；
- `function.prototype`
  显式原型，方法被使用 `new` 调用时，此值会成为被构造出新对象的原型；

- `function.call(thisArg, [argsArr = []])`
  传入一个值作为方法内部的 `this` 来执行该方法，`argsArr` 是一个表示参数的数组；

- `function.apply(thisArg, [...args])`
  同上，但是提供参数时是以 REST 参数的形式提供；

- `function.bind(thisArg, [...args])`
  返回一个新方法，新方法绑定了 `this` 对象和预设的参数。

**关于箭头函数：**箭头函数也可以调用上面三个方法，并不会报错，但是其内部的 `this` 无法被上面三个方法所更改。



# Number 相关
**构造函数和工厂：**

- `new Number(input)`
  基本用不到；使用指定数值构造一个 `Numebr` 对象，不是原始值；一般使用下面的 `Number()`；

- `Number(input)`
  将参数转化为十进制数值并返回，无法转换时返回 `NaN`；
  - 特殊规则：`null` 转为 `0`，`undefined` 转为 `NaN`，`true` 转为 `1`，`false` 转为 `0`；
  - 字符串：会忽略字符串两端的空白字符，额外支持 `'Infinity'` 和科学计数法，也支持十六进制、二进制，但不支持八进制；只要存在非法内容则此方法直接返回 `NaN`，不会像 `parseInt()` 一样仍能返回已解析的部分；
  - 对象：使用其 `object[Symbol.toPrimitive]('number')` 的结果，如果无法调用或结果不为数值，则调用其 `object.valueOf()` 获取返回值。

-----

**静态方法：**

- `Number.isNaN(input)`
  判断是否为 `NaN`，它对不是 `NaN` 的值永远返回 `false`，不会尝试任何转换；

- `Number.isFinite(input)`
  判断数值是否可数，对非数值始终返回 `false` 值，不会尝试任何转换；

- `Number.parseInteger(input)` / `Number.parseFloat()`
  和全局的同名方法完全一致，见文章最开始章节；

- `Number.isInteger(input)` / `Number.isSafeInteger()`
  判断是否为整数/安全整数，对非数值始终返回 `false`。

-----

**常量：**

- `Number.NaN`
  同全局的 `NaN`，表示非数值；
- `Number.EPSILON`
  可区分两个数值的最小间隔；

- `Number.MAX_VALUE` / `Number.MIN_VALUE`
  最大/最小数字值；

- `Number.MAX_SAFE_INTEGER` / `Number.MIN_SAFE_INTEGER`
  最大/最小的安全整数；

- `Number.NEGATIVE_INFINITY` / `Number.POSITIVE_INFINITY`
  正负无穷大。

-----

**`Number.prototype` 实例方法：**

- `number.toFixed(n = 0)`
  四舍五入保留 `n` 位小数，不足位数用 `'0'` 补全，返回字符串；
  **但是，因为 JS 的浮点数有精度问题，它的四舍五入可能并不准确，不建议直接使用；**

- `number.toExponential(n)`
  四舍五入保留 `n` 位小数的科学计数法，不足位数用 `'0'` 补全，返回字符串；
  **此方法内部使用了 `.toFixed()`，它也存在精度的问题，不建议直接使用**；

- `number.toPrecision(n)`
  四舍五入保留 `n` 位有效数字的字符串，位数过长会自动转为科学计数法，返回字符串；
  **此方法内部使用了 `.toFixed()`，它也存在精度的问题，不建议直接使用**；

- `number.toLocaleString([locale,] [options])`
  以本地化形式返回数值的字符串显式，可以配置显示货币样式、千分符样式等，参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)。

-----

**方法 `.toLocaleString()` 的一些用例：**

此方法非常强大（[文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)），第一个参数指定地区和语言，第二个参数可以精确配置格式化的各种行为；
代码示例：

```js
(123456.789).toLocaleString()
(123456.789).toLocaleString('zh-CN')
// 简单直接使用，自动插入千分符，输出：'123,456.789'

(123456.789).toLocaleString('zh-CN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
// 保留 0~2 位小数，输出：'123,456.79'

(123456.789).toLocaleString('zh-CN', {
  minimumSignificantDigits: 3,
  maximumSignificantDigits: 5,
})
// 转为 3~5位有效数字，输出：'123,460'
```

此外，它的四舍五入为准确值，甚至还可以指定为银行家算法，甚至还提供负数范围的处理模式；
代码示例：

```js
(0.45).toLocaleString('zh-CN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
// 默认，输出：'0.5'

(0.45).toLocaleString('zh-CN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  roundingMode: 'halfEven',
})
// 开启银行家算法，输出：'0.4'
```

还可以输出汉字、带货币单位、带百分号等格式：

```js
(123456.789).toLocaleString('zh-Hans-CN-u-nu-hanidec')
// 汉字大写，输出：'一二三,四五六.七八九'

(123456.789).toLocaleString('zh-CN', {
  style: 'currency',
  currency: 'USD',
})
// 货币显示，输出：'US$123,456.79'

(0.35).toLocaleString('zh-CN', { style: 'percent' })
// 百分比，输出：'35%'
```

-----

**JS 的浮点数精度问题：**

JS 遵循 IEEE 754 规范的双精度 64 位浮点数标准，所有的数值会转为二进制位存储，但很多数值在二进制形式下是无限循环小数：
例如十进制的 `0.2`，在二进制下就是 `0.00110011……` 无限循环；

而 JS 只能保留 52 位比特的尾数，会使得二进制数被截断，**但这个对二进制的截断也有 “0舍1入” 的规则**，例如：`0.0011` 保留 2 位则为 `0.01`；

我们假设截断为 8 位**有效数字**，注意是有效数字，左侧所有 `0` 是不算位数的，示例：
`0.1` 二进制形式 `0.0001100110011……` 截断后为 `0.00011001101`，注意末尾数字是 `1`；
`0.2` 二进制形式 `0.0011001100110011……` 截断后为 `0.0011001101`，末尾数字还是 `1`；
两个数的二进制形式，在被截断时分别发生了一次 “四舍五入” 的进位，导致计算结果包含了两次进位，这导致了累积误差，使得系统无法自动把它转为近似值，也是 JS 中 `0.1 + 0.2` 得到的结果带个小数点小尾巴的原因。

-----

**关于 `.toFixed()` 等方法：**

这些方法也是基于二进制进行截断，因此也会存在 “0舍1入” 的截断问题，这会导致其截断结果不符合十进制的结果：

```js
0.35.toFixed(1)
// 结果为：'0.3'

0.45.toFixed(1)
// 结果为：'0.5'
```

可以看出 `.toFixed()` 既不是四舍五入，也不是银行家算法。

建议使用上面的 `.toLocaleString()` 方法，或安装 [`mathjs`](https://mathjs.org/)、[`decimal.js`](https://mikemcl.github.io/decimal.js/) 这些工具来取代原生的 `.toFixed()` 等方法。



# Math
**常用方法：**

- `Math.abs()`
  计算数值的绝对值；

- `Math.sign()`
返回 `0`、**`-0`**、`1`、`-1` 来判断一个数的符号；

- `Math.max(...n)` / `Math.min(...n)`
  返回所有参数中的最大/最小值；

- `Math.hypot(...n)`
  返回参数总所有数的平方和的平方根。

-----

**科学计算常量：**

- `Math.E`、`Math.PI`
  分别表示 `e`、`π`；
- `Math.LN2`、`Math.LN10`
  分别表示 `㏑2`、`㏑10`；
- `Math.LOG2E`、`Math.LOG10E`
  分别表示 `㏒2(e)`、`㏒10(e)`；
- `Math.SQRT1_2`、`Math.SQRT2`
  分别表示 `√½`、`√2`。

-----

**三角函数：**

- `Math.sin()` /`Math.cos()` / `Math.tan()`
  三种三角函数；

- `Math.asin()` / `Math.acos()` / `Math.atan()`
  反三角函数；

- `Math.sinh()` / `Math.cosh()` / `Math.tanh()`
  双曲三角函数；

- `Math.asinh()` / `Math.acosh()` / `Math.atanh()`
  反双曲三角函数。

-----

**乘方类计算：**

- `Math.pow(a, b)`
  `a` 的 `b` 次幂；

- `Math.sqrt()` / `Math.cbrt()`
  平方根/立方根；

- `Math.log(x)` / `Math.log1p(x)` / `Math.log10(x)` / `Math.log2(x)`
  计算 `㏑x`、`㏑(x+1)`、`lg(x)` 、`㏒2(x)` 的值；

- `Math.exp(x)` / `Math.exmp1(x)`
  计算 `e` 的 `x` 次幂、`e` 的 `x` 次幂减 1。

-----

**取整：**

- `Math.trunc()`
  直接丢弃小数部分，可以认为是向数轴原点取整；

- `Math.round()`
  四舍五入取整，注意它的舍入可能不准确，尤其是在负数场合；

- `Math.ceil()` / `Math.floor()`
  向上/向下取整，可以认为是向数轴左侧/右侧取整。

-----

**计算机科学**：

- `Math.fround(x)`
  返回 `x` 在单精度 32 位浮点数中的值；
- `Math.imul(a, b)`
  以 32 位整数计算 `a × b`，模拟 C 语言的 32 位乘法运算；

- `Math.clz32(x)`
  返回 `x` 以 32 位无符号二进制表示时前导 `0` 的个数。

-----

**随机数：**

- `Math.random()`
  获取 `[0, 1)` 区间内的随机数；如果对随机数的安全性要求较高，建议使用 Web Crypto API 来替代。

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
`JSON.parse(str, [mapFn])`
将一个 JSON 字符串反序列化成 JS 对象返回；

该方法可以传入一个回调参数，签名 `mapFn(key, value)`，解析出的每个键值对都将传入该回调并使用回调的返回值来作为最终的属性值，顺序是自内到外，顶层对象传入时 `key` 是空字符串；如果该回调返回 `undefined`，那个传入的键值对将被移除。

-----

`JSON.stringify(obj, [mapFn,] [space])`
将一个 JS 对象序列化为 JSON 字符串；
该方法可以传入一个回调参数，签名 `mapFn(key, value)`，使用它可以修改序列化时属性的值；
参数 `space` 用于美化输出，表示缩进空格个数，最多为 `10`。

补充说明：键为 `Symbol` 类型的属性、不可枚举属性、`undefined`、函数属性都是不会被序列化的；`NaN`、`Infinity` 都会当做 `null`；循环引用的对象会导致报错；如果一个对象具有 `.toJSON()` 方法，它的序列化结果会使用此方法的返回值覆盖。



# Date 相关
**`Date.prototype` 实例上的方法：**

**设置时间参数：**

- `date.getFullYear()` / `date.setFullYear()`
  获取/设置年份；设置时还可一并设置月、日；

- `date.getMonth()` / `date.setMonth()`
  获取/设置月份，**月份从0开始，到11为止**；设置时还可一并设置日；

- `date.getDate()` / `date.setDate()`
  获取/设置日，取值 1~31；

- `date.getDay()` / `date.setDay()`
  获取/设置每周的第几天（周几），注意周日为 `0`；

- `date.getHours()` / `date.setHours()`
  获取/设置小时数，取值 0~23，设置时还可一并设置分钟、秒、毫秒；

- `date.getMinutes()` / `date.setMinutes()`
  获取/设置分钟数，取值 0~59，设置时还可一并设置秒、毫秒；

- `date.getSeconds()` / `date.setSeconds()`
  获取/设置秒数，取值 0~59，设置时还可一并设置毫秒；

- `date.getMilliseconds()` / `date.setMilliseconds()`
  获取/设置毫秒数，取值 0~999。

**直接设置时间戳：**

- `date.getTime()` / `date.setTime()`
  获取/设置时间戳，它是自 1970 年开始至今的毫秒数。

**补充说明：**

- **以上除了 `.getTime()` 和 `.setTime()` 以外，所有方法均有对应的 UTC 的版本，表示以世界时为标准；**
  例如 `.getDate()` 方法还对应有一个 `.getUTCDate()` 的版本；
- 设置时间日期属性时，若输入小于/大约取值范围，则将自动向前/向后调整时间；
  例如 `.setSeconds(70)` 将移动到下一个分钟的第 `10` 秒；
- JS 中的时间戳是 1970 年 1 月 1 日 00:00:00 距今的**毫秒数**，其他语言可能是秒数而不是毫秒数；
- 这些方法会直接修改当前的时间日期对象，也就是 “有副作用”。

-----

**格式化输出：**

为了便于理解，以下示例以 `const date = new Date(2019, 0, 1)` 为例，中文环境：

- `date.toString()` / `date.toLocaleString([locales,] [options])`
  时间日期字符串的标准格式输出/本地化格式化输出；
  结果：`'Tue Jan 01 2019 00:00:00 GMT+0800 (中国标准时间)'` / `2019/1/1 00:00:00`；
- `date.toDateString()` / `date.toLocaleDateString([locales,] [options])`
  日期字符串的标准格式输出/本地化格式化输出；
  结果：`'Tue Jan 01 2019'` / `'2019/1/1'`；
- `date.toTimeString()` / `date.toLocaleTimeString([locales,] [options])`
  时间字符串的标准格式输出/本地化格式化输出；
  结果：`'00:00:00 GMT+0800 (中国标准时间)'` / `'00:00:00'`；
- `date.toUTCString()`
  使用 UTC 时区格式化输出，结果：`'Mon, 31 Dec 2018 16:00:00 GMT'`；
- `date.toISOString()`
  使用 UTC 时区以 ISO 格式输出，结果：`'2018-12-31T16:00:00.000Z'`；
- `date.toJSON()`
  在 JSON 序列化时获取时间的字符串表示形式，和上一个方法返回值相同。

-----

**`Date` 自身的用法：**

**构造函数：**

`new Date()`：可以创建一个时间日期对象，它有多种重载：

- `new Date()`：以当前时间创建；

- `new Date(num)`：参数为一个数字，按照时间戳来创建；

- `new Date(str)`：参数为一个字符串，格式化字符串创建时间日期对象，**注意用这种方式创建出的日期，如果不指定时间，它会加上时区偏移；**
  **例如在中国 GMT+8 时区执行代码 `new Date('2022-12-16')` 得到的时间是早上 8:00，但是 `new Date(2022, 11, 16)` 这样得到的就是 0:00 凌晨；**

- `new Date(year, month, day, hour, minute, second, millisecond)`：按照给定的参数创建，`month` 后面的参数可选，不提供的参数默认为最小值。


-----

**静态方法：**

- `Date.now()`
  返回当前时间的时间戳；

- `Date.parse(str)`
  基本用不到，解析一个时间日期字符串并返回时间戳，无法解析时返回 `NaN`；

- `Date.UTC()`
  用法类似 `new Date()` 的最后一种重载，但是返回的是时间戳而不是 `Date` 对象。



# Boolean 相关
- `new Boolean(val)`
  基本用不到；生成一个 `Boolean` 对象，它不是原始值；一般使用下面的 `Boolean()`；

- `Boolean(val)`
  强制转换一个值到布尔类型；以下几个值会转换为 `false`：`0`、`-0`、`null`、`undefined`、`NaN`、`''`、`document.all`；
  其他值均会转为 `true`。



# Symbol 相关
**静态方法和工厂：**

注意：`Symbol` 对象无法使用 `new` 创建。

- `Symbol(name)`
返回一个指定 `name` 的 `Symbol` 对象，此法创建的 `Symbol` 永远互不相等；

- `Symbol.for(name)`
  尝试按指定的 `name` 来查找被此方法创建的 `Symbol` 对象并返回，如果找不到则创建一个并返回；
  只有通过此方法创建的 `Symbol` 才能被此方法找到；

- `Symbol.keyFor(symbol)`
  如果一个 `Symbol` 是通过 `Symbol.for()` 方式创建的，则可以通过该方法反查它被创建时候的 `name` 值；如果传入的 `Symbol` 不是通过 `Symbol.for()` 创建的或是找不到它的 `name` 则返回 `undefined`；
  传入不是 `Symbol` 类型的参数会抛出错误。

-----

**`Symbol.prototype` 实例上的属性：**

- `symbol.description`
  此 `Symbol` 被创建时提供的 `name`。

-----

**常量：**

在对象上定义的 `Symbol` 常量作为键的属性不会被 `for ... in` 遍历到；
对对象执行一些操作，例如转为原始值、访问迭代器等行为（通常都是 JS 隐含执行的行为）时，JS 引擎会优先从对象上寻找键为这些 `Symbol` 常量的方法或值去执行这些操作。

以下列出所有 `Symbol` 上的常量：

**`Symbol.hasInstance`**
函数属性，定义当前对象或类被 `instanceof` 计算时的返回值，`instanceof` 运算符的左侧的值会成为此函数的参数；
**这个属性一般放在类 `class` 上，且定义为静态 `static` 方法**；

代码示例：

``` js
class A {
  // ↓ 推荐写法。用做静态方法，属于类 A
  static [Symbol.hasInstance](instance) {
    return instance > 5
  }
  
  // ↓ 不推荐。非静态方法，此属性属于每个 A 的实例
  [Symbol.hasInstance](instance) {
    return instance > 50
  }
}
```

测试用例：

```js
// 使用 instanceof 运算符，会调用键为 [Symbol.hasInstance] 的方法来判断

// 此时会把 instanceof 运算符左边的值作为参数
// ↓ 以类名作为右值，调用类上的静态方法
1 instanceof A === false
10 instanceof A === true

const a = new A
// ↓ 以实例作为右值，调用实例上的方法，即类上定义的普通非静态方法
10 instanceof a === false
100 instanceof a === true
```

-----

**`Symbol.species`**
函数属性，指向一个构造函数，一般只会在自定义的类用 `extends` 继承 JS 中原生类型（例如 `Array`、`Date` 等）时用到，JS 里的原生类型在需要构造新对象返回时（例如 `array.map()` 就是返回新数组），会优先使用当前类上的 `Symbol.species` 属性来作为构造器，如果它不存在，才使用自身的构造器。

**只有 JS 的原生对象会寻找这个属性并使用它来构造新对象，所以此属性很少被用到，基本就是扩展 `Array` 并希望 `.map()` 等相关方法仍返回 `Array` 类型，此时才会用到它。**
可以参考规范 ECMA-262 7.3.22 中的相关描述。

这个属性通常放在类 `class` 定义中，且写成静态、`get` 访问符的形式，例如：

```js
class MyClass {
  static get [Symbol.species]() {
    // ...
  }
}
```

以下是用法代码示例：
通常情况，数组的 `map()` 方法使用自身的构造器构造新的数组结果并返回：

```js
class MyArray extends Array { }

const myArray = new MyArray(1, 2, 3)
const result = myArray.map(t => t * 2)

// 此时 result 是 MyArray 的实例
result instanceof MyArray === true
result instanceof Array === true
```

可以使用 `Symbol.species` 属性重载构造函数：

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

// 因为重载了 [Symbol.species] 属性，此时会使用 Array 来构造对象
newResult instanceof NewArray === false
newResult instanceof Array === true
```

只有 JS 原生对象会用到这个属性，所以如果没有继承原生的类，则无需用到这个属性；
以下代码模拟了原生对象利用此属性的行为：

```js
// 假设这个类是原生对象，例如 Array
class A {
  // 假设这个方法类似 .map()，返回一个新的实例
  getNewSelf() {
    // 以下是原生 JS 对象使用 Symbol.species 的行为模拟

    // 寻找 [Symbol.species] 来作为构造器
    if (this.constructor[Symbol.species]) {
      return new this.constructor[Symbol.species].prototype.constructor()
    }

    // 找不到则使用自身的构造器
    return new this.constructor()
  }
}
```

测试用例：

```js
class B extends A { }
class C extends A {
  static get [Symbol.species]() {
    return A
  }
}

new B().getNewSelf() instanceof A === false
new C().getNewSelf() instanceof A === true
```

-----

**`Symbol.iterator`**
函数属性，表示迭代器，已实现（或已继承）此属性的对象是一个可迭代对象，即它可被 `for ... of` 遍历或者被 `...` 展开运算符展开。

迭代器可以是一个生成器函数，其中使用 `yield` 返回值，或是一个返回**迭代器对象**的函数；
其实两者是等价的，因为直接调用生成器函数时，返回值会被 JS 自动包装成迭代器对象。

代码示例：

```js
let idx1 = 0, idx2 = 0

// 生成器函数的例子
const iterableObject1 = {
  *[Symbol.iterator]() {
    while(++idx1 <= 5) {
      yield idx1
    }
    // 循环结束后，别忘了重置索引
    idx1 = 0
  }
}

// 迭代器对象的例子
const iterableObject2 = {
  [Symbol.iterator]() {
    // return 的就是一个迭代器对象
    return {
      next() {
        if(++idx2 > 5) {
          // 循环结束后，别忘了重置索引
          idx2 = 0
          return { done: true }
        }
        return { done: false, value: idx2 }
      }
    }
  }
}
```

测试用例：

```js
// 结果都是 [1, 2, 3, 4, 5]
[...iterableObject1]
[...iterableObject2]
```

-----

**`Symbol.asyncIterator`**
同上一条，但它表示异步迭代器，可以用于 `for await (const a of b)` 遍历等场景；
一般指向一个异步生成器函数。

目前 `ReadableStream` 等浏览器 BOM 对象已经实现了此属性。

-----

**`Symbol.toPrimitive`**
函数属性，提供对象转换成原始值的转换函数，签名 `fn(hint)`，参数 `hint` 表示当前正在试图转换为的值类型，可以是 `'number'`（数值）、`'string'`（字符串）、`'default'`（原始值）。

代码示例：

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    console.log('hint=', hint)

    return 888
  },
}
```

测试用例：

```ts
1 + obj
// 会打印 "hint= default"，因为 “+” 运算符对数值和字符串都可用

2 * obj
// 会打印 "hint= number"，因为 “*” 运算符是专用于数值类型的

`${obj}`
// 会打印 "hint= string"，因为这是一个转为字符串的操作
```

-----

**`Symbol.toStringTag`**
函数属性，调用一个对象的 `.toString()` 时得到的字符串如果形如 `[object Object]` 这种的形式，通过该函数的返回值来决定后面那个字符串 `'Object'` 是什么。

-----

**`Symbol.unscopables`**
对象属性，对一个对象使用 `with` 运算符时，JS 会访问这个属性，这个属性上值为真的键名会被 `with` 环境排除；
此属性的设计目的可以参考这篇 [知乎回答](https://www.zhihu.com/question/364970876/answer/965013908)，可以认为它是为向前兼容而诞生，开发者基本用不到。

代码示例：

``` js
const toString = function () {
  console.log(111)
}

const a = {}
with (a) {
  toString()
  // 此时会打印出 "[object Object]"
  // 因为在 with(a) 的块内，这视同 a.toString()
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

-----

**`Symbol.isConcatSpreadable`**
布尔值属性，一般只有 array-like 对象才会用到，定义对象被作为 `Array.prototype.concat()` 的参数时，是否展开数组元素。

代码示例：

```js
const a = [1, 1]
const b = [2, 2]

a.concat(b) // 结果：[1, 1, 2, 2]

b[Symbol.isConcatSpreadable] = false
a.concat(b) // 结果：[1, 1, [2, 2]]
```

-----

**字符串与正则相关的常量：**

- `Symbol.match`
  函数属性，对某字符串执行 `string.match()` 时如果传入某个对象作为参数，那么 JS 会自动则会调用对象上面的此函数，把 `string` 作为第一个参数传入运行，并使用返回值作结果；
  它可被设为 `false`  以标示此对象不具备正则表达式的行为；

- `Symbol.matchAll`
  同上，适用于 `string.matchAll()` 行为；

- `Symbol.replace`
  同上，适用于 `string.replace()` 行为；

- `Symbol.search`
  同上，适用于 `string.search()` 行为；

- `Symbol.split`
  同上，适用于 `string.split()` 行为。

备注：JS 内置对象中的 `String` 和 `RegExp` 显然都实现了上面这几个属性，所以字符串的这些方法，都可以提供 `String` 或 `RegExp` 类型的参数。



# Error 相关
**构造函数：**

- `new Error(msg, [options])`
  创建一个 `Error` 对象，参数为错误信息，还可提供一个配置对象设置原因、文件名、行号等信息；
- `Error(msg, [options])`
  同上，二者用法一致。

-----

**内置的错误类型：**

- `EvalError`
  使用 `eval()` 动态执行代码时出错；

- `RangeError`
  变量或参数超出有效范围；

- `ReferenceError`
  无效的引用；

- `SyntaxError`
  语法解析错误；

- `TypeError`
  变量或参数不属于有效类型；

- `URIError`
  使用 `encodeURI()` 系列方法时参数无效；

- `InternalError`
  这不是标准规范中的错误类型，它表示引擎内部错误，例如递归层数过多。

-----

**`Error.prototype` 实例上的属性：**

- `error.name`
  错误的名称，默认和错误对象的类型相同，在字符串表示错误对象时会显示在左侧；
- `error.message`
  错误的信息，即通过 `new Error()` 构造时传入的参数，在字符串表示错误对象时会显示在右侧；
- `error.cause`
  错误的原因，来源于创建错误对象时提供的第二个参数的 `cause` 属性；
- `error.stack`
  输出错误发生时的调用栈，这不是一个 JS 标准属性，但大部分 JS 运行环境都实现了它。



# RegExp 相关
**构造函数：**

- `new RegExp(regExpStr, [flags])`
  使用给定的字符串和标志位创建正则表达式；
- `RegExp(regExpStr, [flags])`
  同上，二者用法一致。
- `/regExpStr/flags`
  正则表达式的字面量创建方式。

使用字面量创建正则表达式时，不需要转义字符串中不合法的字符；
实例如下：

```js
// 反斜杠 "\" 在字符串中必须使用 "\\" 来表示
const regexp2 = new RegExp('\\d+', 'ig')

// 但在正则表达式字面量中，它是合法字符，无需转义
const regexp1 = /\d+/ig
```

**备注：**
多年前 JS 有使用 `RegExp.lastMatch`、`RegExp.$1` 等这种挂在全局对象上的属性，这种用法已被废弃，不推荐使用，本文不再赘述；
除此以外，目前 `RegExp` 上没有其他的静态属性或方法。

-----

**标志位 `flags` 的含义和用法：**

如果创建 `RegExp` 对象时开启这些标志位，那么 `RegExp` 对象的实例上的这些属性为 `true`；
注意这个属性是只读的，创建后无法修改。

- `g`，`RegExp.prototype.global`
  全局匹配，开启后将从头到尾多次匹配符合的内容，未开启此标志位则会在第一次匹配后停止；
- `i`，`RegExp.prototype.ignoreCase`
  开启后忽略大小写；

- `m`，`RegExp.prototype.multiline`
  开启后启用多行模式，`^ $` 将适用于每一行而不是整体；

- `u`，`RegExp.prototype.unicode`
  开启 Unicode 支持，可以支持中文等字符；

- `y`，`RegExp.prototype.sticky`
  开启粘连匹配，即后一个匹配位置必须紧邻前一个；

- `s`，`RegExp.prototype.dotAll`
  开启后，点 `.` 可以表示任何单个字符，也包括行终止符；
- `d`，`RegExp.prototype.hasIndices`
  自 2021 年可用，为捕获子串的计算结果添加一个 `.indices` 属性，它是一个数组，其中的元素形如 `[start, end]`，表示捕获到的子串在原字符串中的开始和结尾位置索引；
- `v`，`RegExp.prototype.unicodeSets`
  自 2023 年可用，扩展正则表达式对 Unicode 的支持能力，详情请参考 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets)。

-----

**`RegExp.prototype` 实例上的其他属性：**

- `regexp.source`
  当前正则表达式的字符串表示形式；
- `regexp.flags`
  当前正则表达式所有标志位，是一个字符串；
- `regexp.lastIndex`
  开启 `g` 标志位时有效，表示下一次匹配开始位置，在达到字符串末尾后重设为 `0`；
- `regexp.test(string)`
  测试与指定字符串匹配与否，返回布尔值；
  若正则表达式开启了 `g` 标志位，调用后将修改 `.lastIndex` 以用于多次匹配；
- `regexp.exec(string)`
  返回值同 `string.prototype.match(regexp)`，请参考之前的章节。



# Map、Set 相关
**`Map` 的构造函数：**

- `new Map(initial = {})`
  基于给定的输入创建一个 `Map` 对象；必须使用 `new` 调用，否则会报错。

-----

**`Map.prototype` 实例上的属性：**

- `map.size()`
  获取元素个数；

- `map.get(key)` / `map.set(key, value)`
  获取/设置键值；

- `map.delete(key)` / `map.clear()`
  依键删除/全部删除；

- `map.has(key)`
  依键判断是否存在；

- `map.keys()` / `map.values()` / `map.entries()`
  返回所有键/值/键值对数组；

- `map.forEach(fn, [thisArg])`
  依次对键值执行回调，回调签名 `fn(key, value, map)`。

-----

**`Set` 的构造函数：**

- `new Set(initial = [])`
  创建一个 `Set` 对象，可以使用可迭代对象作参数；必须使用 `new` 调用，否则会报错。

-----

**`Set.prototype` 实例上的属性：**

- `set.size()`
  获取集合中元素的个数；

- `set.add(item)` / `set.delete(item)` / `set.clear()`
  添加/删除/清空元素；

- `set.keys()` / `set.values()` / `set.entries()`
  返回所有键/值/键值对的枚举器，键和值都是元素自身，是相等的；

- `set.forEach(fn, [thisArg])`
  依次对元素执行回调，回调签名 `fn(item, set)`。



# WeakMap、WeakSet 相关
**构造函数：**
它们的构造器形如 `Map` 和 `Set`，此处不再赘述。

-----

**`WeakMap.prototype` 实例上的属性：**

只有以下方法：`.get()`、`.set()`、`.has()`、`.delete()`；
没有 `.clear()`、`.size()`，也没有遍历或枚举键值对相关的方法。

-----

**`WeakSet.prototype` 实例上的属性**

只有以下方法：`.add()`、`.delete()`、`.has()`、`.clear()`；
没有 `.size()`，也没有遍历或枚举相关的方法。



# Promise 相关
**构造函数：**

- `new Promise(task)`
  创建一个 `Promise` 运行给定的函数 `task`，其签名为 `task(resolve, reject)`，**注意必须在这个函数中调用 `resolve()` 或者 `reject()`，否则这个 `Promise` 将一直处于 `pending` 状态**。

-----

**`Promise` 上的方法：**

- `Promise.all(tasks)`
  返回一个新的 `Promise`，数组中所有的 `Promise` 完成后它才会完成，这些 `Promise` 的返回值会按照该调用时候的顺序组合成一个数组来作为它的返回值；
  如果任一 `Promise` 失败，它也将失败，失败值为首个失败的 `Promise` 的原因；

- `Promise.allSettled(tasks)`
  同上，但在任一 `Promise` 失败时它不会失败，而是等到所有 `Promise` 都已完成或失败，再将结果组成数组返回；

- `Promise.race(tasks)`
  返回一个新的 `Promise`，数组中任一的 `Promise` 完成或失败后，它直接变为相应的状态，值也变为相应的完成值或失败原因；

- `Promise.any(tasks)`
  同上，但数组里所有 `Promise` 都已失败时它才会失败，失败值是一个数组

- `Promise.resolve()`
  将一个值包装成 `Promise`，已经是 `Promise` 的值将直接返回，如果带有 `.then()` 方法还将调用之；

- `Promise.reject()`
  行为类似 `Promise.resolve()`，但是将参数作为原因包装成已失败的 `Promise`。

-----

**`Promise.prototype` 实例上的方法：**

- `promise.then(resFn, [rejFn])`
  接受的值或拒绝的值，会传入 `resFn()` 或 `rejFn()`；
  `.then()` 方法中的返回值，将继续传给下一个 `.then()`，但是，`new Promise()` 函数中的返回值不会传给 `.then()`，只有 `resolve()` 的参数会传给 `.then()`；
  下文有具体示例代码；

- `promise.catch(rejFn)`
  处理错误的情况，类似于 `.then()` 的第二个参数；

- `promise.finally(fn)`
  不论完成还是失败都将执行，**注意 `fn` 回调没有任何参数，上一步的结果不会传入**。

-----

**`Promise` 运行的相关逻辑：**

```js
new Promise((res, rej) => {
  // 完成值为 888
  res(888)

  // 即使已完成，方法不会停止，还会继续运行
  console.log(111)

  // 此返回值没有意义
  return 777

}).then(data => {
  // 回调中的 data 值为 res() 传入的值 888，而不是返回值 777
  data === 888

  // then 方法中的返回值，下一个 then 可以使用
  return 999

}).then(data2 => {
  // 这里 data2 是上一步 return 的值 999
  data2 === 999
})
```



# Proxy、Reflect 相关
**`Proxy` 的构造函数和静态方法：**

- `new Proxy(target, handler)`
  创建一个被代理的对象或方法，使用 `handler` 对象里的属性方法来代理行为；

- `Proxy.revocable(target, handler)`
  同上，创建一个可撤销的代理，结果对象的 `.proxy` 属性与上面的方法返回值相同，但额外包含一个 `.revoke()` 方法，调用该方法可以永久撤掉代理。

本文将 `Proxy` 和 `Reflect` 放在一起讲，因为 `Proxy` 第二个参数 `handler` 指定代理行为时，这个对象上面使用的键名和 `Reflect` 上对应的键名同名，方法签名也相同；因此，如果不知道 `handler` 对象需要用哪些键，直接参考 `Reflect` 即可。

例如，想代理一个对象被检测属性时的行为，参考 `Reflect`：

```js
// 语句：
propName in obj

// 等同于表达式：
Reflect.has(obj, propName)
```

使用这个方法名和签名：

```js
new Proxy(target, {
  // target 对象被删除属性时，会调此方法
  has(obj, propName) {
    // 默认行为：
    return Reflect.has(obj, propName)
    // 你可以修改这个方法，来改写 in 运算符的结果
  }
})
```

-----

**`Reflect` 上的静态方法：**

备注：`Reflect` 没有实例，所以也没有构造器。

- `Reflect.apply(func, thisArg, args)`
  代理函数，在被调用时触发，可当做 `func.apply(thisArg, args)`；

- `Reflect.construct(func, args, [newTarget])`
  代理构造函数，必须返回一个对象，被以 `new func(...args)` 形式调用时触发；

- `Reflect.defineProperty(obj, propName, desc)`
  代理对象，在被 `Object.defineProperty()` 时触发；

- `Reflect.deleteProperty(obj, propName)`
  代理对象，被删除属性时触发，类似于 `delete obj[propName]`；

- `Reflect.get(obj, propName, proxy)`
  代理对象，访问属性时触发，类似于 `obj[propName]`；

- `Reflect.set(obj, propName, newValue, proxy)`
  代理对象，设置属性时触发，类似于 `obj[propName] = newValue`；

- `Reflect.has(obj, propName)`
  代理对象，检测属性时触发，类似于 `propName in obj`；

- `Reflect.ownKeys(obj)`
  代理对象，可被多个行为触发，见下表；
  默认行为是返回对象自身（不含继承）所有的键名的数组，它包括 `Symbol` 键和不可枚举的键，可看做 `Object.getOwnPropertyNames(obj)` 和 `Object.getOwnPropertySymbols(obj)` 返回值的总和；

- `Reflect.getOwnPropertyDescriptor(obj, propName)`
  代理对象，可被多个行为触发，见下表；默认行为是返回属性的属性描述符；需要注意返回值对象的 `configurable` 可枚举性，它决定了这个属性的一系列行为，具体见下表；

注：`Reflect.ownKeys()` 和 `Reflect.getOwnPropertyDescriptor()` 一般需要同时代理，因为它们的行为关联度比较高。

| 对 `obj` 对象执行的操作 | `ownKeys`, | `getOwnPropertyDescriptor` |
| ------------------------------------------------------------ | --------- | -------------------------- |
| `Object.keys(obj)` <br />`Object.valuse(obj)`<br />`Object.entries(obj)` | √         | √，检测可枚举性 |
| `for ... in obj`                                             | √         | √，检测可枚举性 |
| `Object.getOwnPropertyNames(obj)`                            | √         |                            |
| `Object.getOwnPropertySymbols(obj)`                          | √         |                            |
| `Object.getOwnPropertyDescriptor(obj, propName)`             |           | √                          |
| `Object.getOwnPropertyDescriptors(obj)`                      | √         | √                          |

- `Reflect.getPrototypeOf(obj)`
  代理对象，获取其隐式原型（原型链）时触发；
  类似于 `obj.__proto__` 或是 `Object.getPrototypeOf(obj)`；

- `Reflect.setPrototypeOf(obj, val)`
  代理对象，设置其隐式原型（原型链）时触发；
  类似于 `obj.__proto__ = val` 或是 `Object.setPrototypeOf(obj, val)`；

- `Reflect.isExtensible(obj)`
  代理对象，被 `Object.isExtensible(obj)` 操作时会触发；

- `Reflect.preventExtensions(obj)`
  代理对象，被 `Object.preventExtensions(obj)` 操作时会触发。

-----

**代码示例：**

对对象 `a` 进行代理：

```js
const a = { val: 111 }

const b = new Proxy(a, {
  // 拦截属性访问，返回原值的三倍
  get(obj, propName) { 
    return obj[propName] * 3 
  },

  // 一般下面这两个要一起代理
  ownKeys() {
    return ['aa', 'bb', 'cc']
  },
  getOwnPropertyDescriptor(_self, propName) {
    // 属性要可配置 + 可枚举，不然属性遍历不到
    return { configurable: true, enumerable: true }
  },
})
```

测试用例：

```js
// 对应 get，得到了三倍的结果值
b.val === 333

// 枚举所有键
Object.keys(b)
// 结果：['aa', 'bb', 'cc']
```



# 生成器与迭代器相关
上面的 “Symbol 相关” 章节中，其中 `Symbol.iterator` 一段有生成器函数和迭代器对象的示例代码可供参考。

**生成器函数：**

形如 `function* func()` 的函数是生成器函数：

- 它可以使用 `yield` 来向外输出结果值；
- 每次运行到 `yield` 语句并将结果值输出后，代码运行到的位置会保留；在下一次需要输出结果时，会从之前暂停的位置继续运行；
- 如果运行到方法结尾或是 `return` 语句，则表示不再有新的值了，本次迭代结束。

-----

**迭代器对象：**

- 一个特定结构的对象，具体见下文，它实现了 [迭代器协议](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)；
- 运行生成器方法时，JS 会自动包装出一个迭代器对象，并使用它来获取数据；当然你也可以自己写一个普通方法，然后手动构造迭代器对象并返回；这种方法可以替代生成器方法，因为他们的行为一致；
- 迭代器对象中，每次获取结果值时，均被会包装为 `{ done, value }` 的格式：`done` 是表示是否是最后一个结果，没有更多了；`value` 是结果值本身；但 JS 原生的迭代行为，例如 `for ... of` 等，均会自动拆出 `value` 属性供我们使用。

迭代器对象的格式如下：

```js
const iteratorObject = {
  // 获取下一个结果值或获取结束标志，此方法可能接收参数
  next(input) {
    // done 表示迭代是否完毕，value 为本次结果值
    return { done, value }
  },

  // 迭代提前结束时调用它，它也需要返回一个完成值
  return() {
    // done 为 true
    return { done: true, value }
  },

  // 抛出异常时会调用它，它也需要返回一个完成值
  throw() {
    // done 为 true
    return { done: true, value }
  },

  // 实现可迭代协议，使用自身即可
  [Symbol.iterator]() {
    return this
  }
}
```

每次执行生成器方法时会得到一个迭代器对象，JS 会不断地调用它的 `next()` 方法，直到迭代完毕；
仅当迭代**提前结束时**，例如 `for` 循环中使用 `break` 或**抛出错误**，JS 会调用其 `return()` 方法。

此外，我们每次手动获取迭代结果时，均会被包装为 `{ done, value }` 的形式，但 JS 原生的迭代行为会自动拆出 `value` 值。

-----

**[可迭代协议](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)：**

包含 `[Symbol.iterator]()` 方法属性，且此方法是生成器方法，或是它返回一个迭代器对象。

-----

**可迭代对象：**

假设对象 `obj` 实现了可迭代协议，那么它就是一个可迭代对象；JS 原生的数组、字符串、`Set` 等均为可迭代对象；
对可迭代对象而言，我们可以执行 `[...obj]`、`for(const item of obj)`、`new Set(obj)` 等迭代操作而不会报错；
注意，即使对象自身就是可迭代对象，它也必须实现上面的可迭代协议，此时返回 `this` 即可。

-----

**迭代器对象的属性详解：**

假设 `iteratorObject` 是一个可迭代对象：

- `iteratorObject.next([val])`
  获取下一个结果值，结果值格式为 `{ done, value }`；
  调用 `next()` 方法时可传入一个参数，此参数会成为生成器函数中 `yield` 语句的返回值，**但是首次调用 `next()` 时传入的参数是无效的，不会成为 `yield` 语句返回值**；
  这是因为，JS 执行到 `yield` 语句得到输出值后，就会暂停而不会执行后续的任何代码，此时 `yield` 还没返回值，而下一次调用 `next()` 时传入的参数会直接覆盖掉第一次传的直接作为 `yield` 语句的结果，所以前一次的输入就被覆盖了；
  如果看不懂，下文有代码演示；
- `iteratorObject.return([val])`
  提前结束生成器，例如 `for` 循环中使用 `break` 或抛出错误，此时需返回一个 `{ done: true }` 的对象；
  可以传入一个参数，参数将成为结果值的 `.value`；若未提供返回值则会在被调用后报错；

- `iteratorObject.throw(error)`
  参数是一个 `Error` 对象，向生成器抛出一个异常；
  如果 `yield` 语句被 `try ... catch` 包裹，则此异常会被捕获。

用代码来演示：
首先声明一个生成器函数：

```js
let idx = 0

// 一个生成器函数
function* genFunc() {
  while(++idx <= 3) {
    // 使用 yield 的返回值
    const nextProp = yield idx
    console.log('接收到 next 方法传入值：', nextProp)
  }
  idx = 0
}

// 自动迭代结果即为 [1, 2, 3]
[...genFunc()].toString() === '1,2,3'
```

手动获取迭代器对象并传参调用 `.next()`：

```js
// 获取迭代器对象
const iteratorObj = genFunc()

iteratorObj.next(111)
// 返回 { done: false, value: 1 }
// 此时不会打印任何内容，因为 yield 还没返回

iteratorObj.next(222)
// 返回 { done: false, value: 2 }
// 打印："接收到 next 方法传入值：222"
// 之前的 111 便被丢弃了，因为新的参数 222 直接作为 yield 的返回值

iteratorObj.next(333)
// 返回 { done: false, value: 3 }
// 打印："接收到 next 方法传入值：333"

iteratorObj.next(444) 
// 返回 { done: true }，且后续调用 .next() 返回值均相同
// 打印："接收到 next 方法传入值：444"
// 此时会打印是因为从上一次调 next() 的 yield 语句返回值位置开始执行的，还会走打印语句
```

