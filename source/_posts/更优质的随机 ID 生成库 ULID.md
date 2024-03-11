---
title: 更优质的随机 ID 生成库 ULID
date: 2024-01-01 12:00:00
tags: 
- JS
- Node
categories: 
- JS
---

在 2022 年的某一天，我在阮一峰的博客中看到了 [一篇博文](https://www.ruanyifeng.com/blog/2022/02/weekly-issue-195.html) 中提到了一种名叫 [ulid](https://github.com/ulid/spec) 的标识符系统，文中对它的描述为：“一个独特 ID 的生成库，对 uuid 进行了多方面的改进。”

我经常会做一些 Node.js 和数据库方面的开发工作，对主键 ID 生成系统有一定的要求，所以对 ulid 比较有兴趣，也对此进行了一些展开研究。



# 常见的随机 ID 生成系统

随机 ID 生成系统也会被称为 “发号器”，通常用于实体的标识，比如数据库主键。
通常来说，ID 生成系统都会允许用户提供随机数种子，依此来生成随机的 ID。考虑到大部分随机数种子都是基于时间戳，如果分布式部署，同一时间多台机器可能生成重复的 ID，所以部分 ID 生成系统会采集设备或运行平台的指纹信息来参与生成过程。

常见的随机 ID 生成系统有这些：



**[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)：**

比较常见的随机 ID 系统，形如 `123e4567-e89b-42d3-a456-556642440000`，由 32 位十六进制数字和 4 位连字符 `-` 组成，长度为 36 字符，大小写不敏感，无序。

实际上，UUID 有 5 个版本：
v1 版本基于时间戳、硬件 MAC 地址；v2 版本相比前者还额外需要一个本地 ID（很少有工具实现 v2）；
v3 版本基于种子（由一个命名空间和一个名称组成）；v5 版本相比前者则改用了 SHA-1 哈希算法；
v4 版本是最常见的，它是完全基于随机数种子来生成的。

UUID 会记录其版本号、变体类型，它们被放置在 ID 字符串中的固定位置，形如：`xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`，其中 `M` 的位置表示版本号，目前的取值范围是 1~5，而 `N` 位置表示变体类型，目前的取值范围是 0~d。
这两个位置的字符可以帮助我们判断 UUID 的版本，如果不符合上述范围，则表示这个 UUID 不合法。

通过上述规范，可以发现 UUID 的一些特点：无序导致它无法用做数据库索引；虽然是由16进制数字字符组成，但包含连字符 `-` 可能会阻碍一些应用场景。

对于 Javascript 开发者，可以使用 [uuid](https://github.com/uuidjs/uuid) 这个 npm 包来生成各种版本的 UUID。

-----

**[GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)：**

和 UUID 的 v4 版本类似，通常认为是微软对 UUID 的一种专有的实现方式。

-----

**[CUID](https://github.com/paralleldrive/cuid) / [CUID2](https://github.com/paralleldrive/cuid2)：**

较新式的 ID 生成系统，我认为它很接近 ulid。注意其 v1 版本被官方因安全性问题宣布废弃，推荐使用 v2 版本。

格式形如 `pfh0haxfpzowht3oi213cqos`，为 24 字符长度；注意其 v1 版本一般会添加字母 `c` 作为开头，所以是 25 字符长度；由数字和 26 个字母组成，大小写不敏感，它生成的 ID 相对时间而言是有序的，后生成的 ID 在字符串比较时始终大于之前生成的 ID。

CUID 依次由毫秒级时间戳、计数器、平台指纹、随机数这几个部分构成。这个结构使它具备了以下特性：

- 因为时间戳在左侧（高位），所以排序的时候始终可以保证按时间先后排序；
- 因为有计数器，所以一个实例在同一毫秒内也可以生成最多1万个互相不同的 ID，且仍能保持相对时间有序；
- 因为有平台指纹，所以即使随机数种子相同，在不同主机上也能避免生成相同的 ID。

可以看出，CUID 十分先进，它可以用于用户名、昵称、URL、数据库主键等场合。此外，它还提供了第一方的 JS 实现，npm 上包名就叫 `cuid` 或 `cuid2`，且同时适配了 Node.js 和浏览器。

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
对于 Javascript 开发者而言，可以使用 [flake-idgen](https://www.npmjs.com/package/flake-idgen) 这个 npm 包来生成雪花 ID。

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
但 ULID 为了更容易跨平台实现，没有依据运行环境的指纹，且没有部署计数器，这使得它与 CUID 相比有以下注意事项：

- ULID 不依据设备或运行环境的指纹，这可能会导致多台机器在同一时间生成相同的 ID，所以建议使用 ULID 时配套使用安全的随机数发生器的结果作为种子而不是时间戳（例如可以使用 `crypto.getRandomValues()`，Node.js 需导入 `crypto` 包并使用 `crypto.webcrypto.getRandomValues()`，如果 Node.js 版本比较旧，可以使用 `crypto.randomBytes()`）；或者，也可以把运行环境指纹也混入种子中；
- ULID 仅由毫秒级时间戳和随机数组成，没有计数器，这导致如果在同一毫秒中生成多个 ID，它们的有序性无法保证；ULID 推荐实现一种 monotonic （单调性）的功能，允许用户在同一毫秒内中生成多个不同的 ID 且保证时间上有序，推荐的做法是把随机数部分加 1，目前常用的 ULID 库都实现了。

对于 Javascript 开发者而言，常用这两个包来生成 ULID，它们都支持 Node.js 和现代浏览器：

- [ulid](https://github.com/ulid/javascript)，提供了直接生成和工厂模式，支持使用自定义随机数来源，它还提供了 `detectPrng()` 用于从当前环境中探测更安全的随机数发生器，可以避免分布式部署场景使用 ULID 导致随机数碰撞；
- [id128](https://github.com/aarondcohen/id128)，较为全面的工具，它不使用 `Math.random()` 而是实用更高安全级别的随机数来源，除了提供 ULID 外还提供了 UUID 的生成、ID 间的判别和比较函数。



> 因为 ULID 前面 10 个字符是毫秒级时间戳，所以直到大约公元 6429 年之前，ULID 都会以 `0` 开头，因为在这之前，时间戳占不满 48 个比特位，前面会有 0 填充。
>
> 验证方式：
>
> ``` javascript
> // 因为 ULID 的时间戳部分是 48 个比特，也就是将 0b1 左移 47 位
> // 但是 JS 中 0b1 << 47 的结果是 32768，显然是错误的，实际上 0b1 << 15 结果也是 32768
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

以下各个你可以直接在浏览器 F12 控制台中复现。

实现 Base32 编码：

```javascript
/** 将一个由 0、1 组成的字符串当做二进制数值，进行 Crockford 的 Base32 编码 */
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

为了保证同一毫秒内生成的多个 ULID 为单调递增，我们需要使用计数器变量来记录上一次生成的时间戳和随机数，ULID 规范允许我们使用上一次随机数的值加 1 来作为新的 ID，为了方便本次就使用这种方法，实际实现可以不遵循这个加 1 的规则。

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
