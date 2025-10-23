---
title: 更优质的随机 ID 生成库 ULID
date: 2024-01-01 12:00:00
tags: 
- JS
- Node
categories: 
- JS
---

在 2022 年的某一天，我在阮一峰的博客中看到了 [一篇博文](https://www.ruanyifeng.com/blog/2022/02/weekly-issue-195.html) 中提到了一种名叫 [ULID](https://github.com/ulid/spec) 的标识符系统，文中对它的描述为：“一个独特 ID 的生成库，对 UUID 进行了多方面的改进。”

我经常会做一些 Node.js 和数据库方面的开发工作，对主键 ID 生成系统有一定的要求，所以对 ULID 比较有兴趣，也对此进行了一些展开研究。



# 常见的随机 ID 生成系统

随机 ID 生成系统也会被称为 “发号器”，通常用于实体的标识，比如数据库主键。

通常来说，ID 生成系统都会允许用户提供随机数种子，依此来生成随机的 ID。考虑到大部分随机数种子都是基于时间戳，如果分布式部署，同一时间多台机器可能生成重复的 ID，所以部分 ID 生成系统会采集设备或运行平台的硬件信息来参与生成过程。

常见的随机 ID 生成系统有这些：



**[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)：**

比较常见的随机 ID 系统，形如 `123e4567-e89b-42d3-a456-556642440000`，由 32 位十六进制数字和 4 位连字符 `-` 组成，长度为 36 字符，大小写不敏感，无序。

**UUID 有很多版本，但只有 UUID v4 / v6 / v7 才算是 “随机 ID”，我们常说 UUID 的一般特指 v4 和 v7 这两个版本。**
可以在 https://www.uuidtools.com/ 进行 UUID 的生成、解析，也可以查看相关文档。

以下是各个 UUID 版本的介绍：

- v1 版本基于时间戳、硬件 MAC 地址，它的输出不具备随机性，同一设备同一时间生成的 ID 是固定的；
  虽然它输出固定的 ID，但它使用的时间戳的精度很高（100 纳秒），正常来说很难发生碰撞；而且基于硬件 MAC 地址可以避免多机器并发时 ID 出现碰撞，但也为攻击者提供了反向标记 ID 创建来源的溯源手段，所以 UUID v1 已被认为是不安全的；
- v2 版本在 v1 基础上做了些许调整，时间戳占用的位数被减少，并加入了几位 “域标识符”，更适合用于分布式计算；
  这个版本非常冷门，很少有人使用；
- v3 和 v5 版本是基于用户提供的名称和命名空间来通过哈希运算来生成 ID，区别只在哈希算法，v3 使用 MD5，v5 使用 SHA-1，它甚至也不包含时间戳，完全没有随机性，因此 UUID v3 和 v5 通常只用来对固定的资源进行标识，不能用作随机 ID 系统；
- v4 版本完全基于随机数来生成的，被广泛使用；
  因为 v4 本身没有对生成方式做要求，此时随机生成的实现方式就变得很重要，例如同一时刻生成的 ID 是否会碰撞、多台设备并发时会不会碰撞，这些问题都要由实现者自己来解决；
- v6 版本是 v1 的改进版，它的高位时间戳部分是递增的，所以它是有序的，且原先基于 MAC 地址的部分可以改为随机生成，避免被恶意用户溯源标记硬件；
  它既具备有序性，又具备随机性，可以作为随机 ID 使用，但 v6 旨在兼容 v1，新系统建议直接使用 v7；
- v7 版本可看作是 v4 的改进版，它的高位时间戳部分是递增的，其余位数可以全部随机；需要注意的是，v7 的时间戳时间精度为 1 毫秒，而不是 100 纳秒，也就是说同一毫秒内生成多个 UUID v7，时间戳都一样，这就没法保证同一毫秒内有序；
  它既具备有序性，又具备随机性，可以作为随机 ID 使用；

UUID 会记录其版本号、变体类型，它们被放置在 ID 字符串中的固定位置，形如：`xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`，其中 `M` 的位置表示版本号，目前的取值范围是 1-5，而 `N` 位置表示变体类型，目前的取值范围是 0-d。
这两个位置的字符可以帮助我们判断 UUID 的版本，如果不符合上述范围，则表示这个 UUID 不合法。

对于 JavaScript 开发者，可以使用 [uuid](https://github.com/uuidjs/uuid) 这个 npm 包来生成、检验各种版本的 UUID。

考虑到 JavaScript 运行在浏览器中时，没有高精度时间 API，也无法获取到设备 MAC 等硬件信息，因此 UUID 的实用性会有所下降；此外部分 UUID 包含随机数部分，建议使用浏览器的安全随机数生成 API [`crypto.getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) 而不是 `Math.random()`，一般的随机 ID 生成库都会默认使用安全随机数 API。

-----

**[GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)：**

和 UUID 的 v4 版本类似，仅在内存中的字节序有所不同，通常认为是微软对 UUID 的一种专有的实现方式。

-----

**[CUID](https://github.com/paralleldrive/cuid) / [CUID2](https://github.com/paralleldrive/cuid2)：**

新式且先进的 ID 生成系统，它体积小、性能好、安全性更佳；开发者为它配套的丰富的测试用例，甚至进行了数学上的防逆向分析；它也可以同时在浏览器和 Node.js 中运行（甚至不局限于 JS 生态，Java、Go、C# 等语言也有相关实现），并利用更安全的随机数发生器 API。CUID 已被广泛应用于生产环境，非常推荐使用。

它的格式形如 `pfh0haxfpzowht3oi213cqos`，为 24 字符长度；v1 版本一般会添加字母 `c` 作为开头，所以是 25 字符长度；由数字和英文字母组成，大小写不敏感，一般默认全小写。

官方认为任何有序 ID 都是不安全的，且有序本身意义不大，因此现在的 CUID v2 不是递增的。

曾经的 v1 版本，CUID 依次由毫秒级时间戳、计数器、平台指纹、随机数这几个部分构成。
这个结构使它具备了以下特性：

- 因为时间戳在左侧（高位），所以排序的时候始终可以保证按时间先后排序；
- 因为有计数器，所以一个实例在同一毫秒内也可以生成最多1万个互相不同的 ID，且仍能保持相对时间有序；
- 因为有平台指纹，所以即使随机数种子相同，在不同主机上也能避免生成相同的 ID；
  在浏览器端运行时，因为无法获取到标识符，它会使用浏览器 UA 等信息；
- 因为 ID 只有数字和字母且不区分大小写，不易混淆，因此它可安全地应用于主键、用户昵称、URL 片段中；且第一位始终为 `c`，这样使它可以作为变量名、HTML 实体 ID 等。

新的 v2 版本，包名改为了 `@paralleldrive/cuid2`，每个 ID 都由随机首字母、时间戳、随机数、计数器、平台指纹这几个部分构成。
它做了以下改动：

- 不再以字母 `c` 开头，所以是 24 字符长度，但 v2 版本保证一定是字母开头，这使得它依然能用于变量名、HTML 实体 ID 等用途；
- 不再有序，虽然仍包含时间戳，但被混淆在 ID 中，无法解读也无法排序；
- 可以生成不同长度的 ID。

对于 JavaScript 开发者而言，建议使用 [`@paralleldrive/cuid2`](https://www.npmjs.com/package/@paralleldrive/cuid2) 这个包来生成 CUID v2。

<br />

目前 [Prisma](https://www.prisma.io/) 支持使用 v1 版本的 CUID 来作为数据库的主键生成器。其 scheme 如下：

```
model User {
  id    String @id @default(cuid())
}
```

-----

**[雪花算法（Snowflake）](https://en.wikipedia.org/wiki/Snowflake_ID)：**

由 Twitter 创造的随机 ID 系统，分布式相关的面试题经常会问到。形如：`1765366779879620608`，它由纯数字组成，基于生成时间有序。

雪花 ID 依次由毫秒级时间戳、机器 ID、序号组成，所以它也具备了 CUID 所具备的一些特性。雪花 ID 也可以用于主键，且因为它仅包含纯数字的缘故，它可被安全的用在很多地方。

Twitter、Instagram、Discord 等多家公司使用雪花 ID 来作为用户 ID、帖子 ID。
此外，Sony 公司基于 Snowflake 开发了 [Sonyflake](https://github.com/sony/sonyflake)，旨在改善 Snowflake 在多主机和多核心下的性能。

对于 JavaScript 开发者而言，可以使用 [flake-idgen](https://www.npmjs.com/package/flake-idgen) 这个库来生成雪花 ID。

-----

**[Nano ID](https://github.com/ai/nanoid)：**

在 npm 上的包名为 `nanoid`，它是 JavaScript 生态常见的随机数 ID 生成器，可在浏览器和 Node.js 运行，它具备体积小、速度快、更安全等特点；Nano ID 也有 Go、C#、Java 等多个语言的实现。

它的格式形如 `V1StGXR8_Z5jdHi6B-myT`，由数字、区分大小写的字母、连字符 `-`、下划线 `_` 共计 64 种字符组成，字符数为固定 21 位。 

Nano ID 是完全由随机数产生的 ID，本身不包含时间戳，因此它的实现方式需要有较好的随机数来源，避免产生冲突。

它具备以下特点：

- 大小写敏感、字符有可能是 `-` 或 `_` 开头，这导致它的用途可能有一些限制；
- `nanoid` 库提供了自定义字符表的功能，官方甚至提供了 `nanoid-dictionary` 来提供一些常用的字符表，提供 `nanoid-good` 来避免生成的 ID 具备污言秽语；
- 可以生成不同长度的 ID；
- 默认使用更安全的随机数 API，避免输出结果被预测。

-----

说完了这些，接下来开始介绍 ULID。



# ULID 的特点

ULID 并不是很新的标准，实际上它的诞生最早可以到大约 2015 年。
ULID 的 [规格说明](https://github.com/ulid/spec) 描述了这个随机 ID 生成系统的特点：

- 生成的随机 ID 形如：`01ARZ3NDEKTSV4RRFFQ69G5FAV`，固定 26 个字符长度，通常以 `01` 开头；
- 它由数字和 22 个英文字母组成，大小写不敏感，为了避免混淆，不包含字母 `L`、`I`、`O` 和 `U`，也就是说组成 ULID 的字符一共有 32 个，可以理解成一种 Base32 编码方式（这种方式被称为 “[Crockford 编码](https://www.crockford.com/Base32.html)”），字符表为 `0123456789ABCDEFGHJKMNPQRSTVWXYZ`；
- 因为 ULID 的组成不包含特殊字符，所以它可以安全的用于用户名、URL 中，而且它不包含容易混淆的字符，甚至可以用于印刷品；
- ULID 从左到右依次由毫秒级时间戳（前 10 个字符，48 比特位）和随机数（后 16 个字符，80 比特位）组成，组合方式是分别 Base32 编码，然后拼接在一起；因为时间戳在高位，所以 ULID 是基于时间先后有序的。

可以看出，ULID 相比 CUID 而言，使用 Base32 编码方式，编码方式更友好，且去掉 4 个字母避免了阅读和做印刷品时引起的混淆。

但是，ULID 为了更容易跨平台实现，没有依据运行环境的指纹，且没有部署计数器，这使得它与 CUID 相比有以下注意事项：

- ULID 不依据设备或运行环境的指纹，这可能会导致多台机器在同一时间生成相同的 ID，所以建议使用 ULID 时配套使用安全的随机数生成 API；
- ULID 仅由毫秒级时间戳和随机数组成，没有计数器，这导致如果在同一毫秒中生成多个 ID，它们的有序性无法保证；
  ULID 推荐实现一种 monotonic （单调性）的功能，允许用户在同一毫秒内中生成多个不同的 ID 且保证时间上有序，最简单的做法是把随机数部分加 1，目前常用的 ULID 库都实现了。

对于 JavaScript 开发者而言，常用这两个包来生成 ULID，它们都支持 Node.js 和现代浏览器：

- [ulid](https://github.com/ulid/javascript)，提供了直接生成和工厂模式，支持使用自定义随机数来源，它还提供了 `detectPrng()` 用于从当前环境中探测更安全的随机数发生器，可以避免分布式部署场景使用 ULID 导致随机数碰撞；
- [id128](https://github.com/aarondcohen/id128)，较为全面的工具，它不使用 `Math.random()` 而是实用更高安全级别的随机数来源，除了提供 ULID 外还提供了 UUID 的生成、ID 间的判别和比较函数。



> 因为 ULID 前面 10 个字符是毫秒级时间戳，所以直到大约公元 6429 年之前，ULID 都会以 `0` 开头，因为在这之前，时间戳占不满 48 个比特位，前面会有 0 填充。
>
> 验证方式：
>
> ``` javascript
> // 因为 ULID 的时间戳部分是 48 个比特，也就是将 0b1 左移 47 位
> // 但是 JS 中 0b1 << 47 的结果是 32768，显然是错误的，实际上 0b1 << 15 结果才是 32768
> // 这是因为 JS 对于位操作时，将数值视为 32 位有符号整数来进行运算，48 位的移位运算溢出了
> 
> // 正确的做法，结果输出：140737488355328
> 2 ** 47
> 
> // 或者直接打出 48 位且最高位以 1 开头的二进制最小的无符号数
> 0b10000000_00000000_00000000_00000000_00000000_00000000
> 
> // 时间戳转换为日期，结果输出：Wed Oct 17 6429 10:45:55 GMT+0800 (中国标准时间)
> new Date(2 ** 47)
> ```
>
> 由此可见，ULID 的第一位基本固定为 `0`，除非真到了公元 6000 多年。
>
> 此外，48 个比特位如果完全用数字 1 填满，再转换为 Base32 编码时，数值为 `7ZZZZZZZZZ`，这便是 ULID 时间戳的上限。
> 如果某 ID 开头第一个字符是大于 7 的值，则它一定不是合法的 ULID。



# 自己实现 ULID

从规范中可以看出，ULID 由 48 比特的时间戳和 80 比特的随机数组成，两个部分分别 Base32 编码之后拼接在一起，所以我们也可以分别实现两边的部分以及 Base32 编码的部分。

以下各段代码均可直接在浏览器 F12 控制台中运行。

实现 Base32 编码：

```javascript
/** 将一个由 0、1 组成的字符串当做二进制数值，进行 Base32 编码 */
function binaryStringToBase32Encode(binaryString) {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

  // 补齐到能被 5 整除，因为 5 个比特位正好是一个 Base32 字符
  while (binaryString.length % 5 !== 0) {
    binaryString = '0' + binaryString
  }

  // 按照 5 位一组分组，将它转为 32 进制表示形式
  let result = ''
  for (let i = 0; i < binaryString.length; i += 5) {
    const chunk = binaryString.slice(i, i + 5)
    const index = parseInt(chunk, 2)
    result += alphabet[index]
  }

  return result
}
```

> 真正的 Base32 Crockford 编码还包含了末尾一位校验码，我们这里使用简化版的 “32 进制” 编码方式并使用 Crockford 编码的字母表，而并不是真正的 Base32 Crockford 编码。

接下来可以实现前 10 字符长度（48 比特位）的时间戳生成器：

```javascript
/** 把当前时间戳转为 Base32 编码，补齐到 10 位 */
function generateTimestampPrefix(ts = +new Date()) {
  return binaryStringToBase32Encode(ts.toString(2)).padStart(10, '0')
}
```

然后实现后 16 字符长度（80 比特位）的随机数生成器：

```javascript
/** 生成 16 字符长度的 Base32 随机字符串 */
function generateRandomSuffix() {
  const randomUint8Array = new Uint8Array(10)
  
  // 下面这行适用于浏览器环境 
  crypto.getRandomValues(randomUint8Array)
  // 下面这行适用于 Node.js 环境，需要引入 crypto 这个包
  // crypto.webcrypto.getRandomValues(randomUint8Array)

  let randomBinary = ''
  randomUint8Array.forEach(num => {
    randomBinary += num.toString(2).padStart(8, '0')
  })

  return binaryStringToBase32Encode(randomBinary).padStart(16, '0')
}
```

将上面这两个函数组合起来，便可以得到一个 ULID 的生成函数：

```javascript
/** 生成一个 ULID */
function generateUlid() {
  return generateTimestampPrefix() + generateRandomSuffix()
}
```

-----

实现 monotonic （单调性）的版本：

为了保证同一毫秒内生成的多个 ULID 为单调递增，我们需要使用计数器变量来记录上一次生成的时间戳和随机数，ULID 规范允许我们使用上一次随机数的值加 1 来作为新的 ID。
本次代码演示为了简化，使用这种简单的随机数加 1 来实现单调 ULID。实际生产环境中，建议改为加一个随机整数。

此时，生成随机数的函数便需要添加一个时间戳作为参数，同时还需要额外 2 个外部的变量用于记录信息：

```javascript
// 记录上一次生成 ULID 的时间戳
let lastTs = 0
// 记录在这个时间生成 ULID 所用的随机数二进制字符串
let lastRandomBinary = ''

/** 生成 16 字符长度的 Base32 随机字符串 */
function generateRandomSuffix(ts = +new Date()) {
  if (ts === lastTs) {
    // 如果与上一次生成发生在同一毫秒，此时直接将上次随机数结果加 1 返回
    // 这个实现方式比较简单，也可以将 “+ 1n” 修改为加上一个随机整数
    const newRandomBinary = (BigInt(`0b${lastRandomBinary}`) + 1n).toString(2)
    lastRandomBinary = newRandomBinary

    return binaryStringToBase32Encode(newRandomBinary).padStart(16, '0')
  }

  const randomUint8Array = new Uint8Array(10)

  // 下面这行适用于浏览器环境 
  crypto.getRandomValues(randomUint8Array)
  // 下面这行适用于 Node.js 环境，需要引入 crypto 这个包
  // crypto.webcrypto.getRandomValues(randomUint8Array)

  let randomBinary = ''
  randomUint8Array.forEach(num => {
    randomBinary += num.toString(2).padStart(8, '0')
  })

  // 重置两个计数器
  lastRandomBinary = randomBinary
  lastTs = ts

  return binaryStringToBase32Encode(randomBinary).padStart(16, '0')
}
```
