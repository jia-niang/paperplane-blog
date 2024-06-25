---
title: 函数式编程用 JS 推导 Y 组合子
date: 2021-07-02 17:00:00
tags: 
- DOC
- React
- JS
categories: 
- JS
---

<script async src="//unpkg.com/ramda@0.30.1/dist/ramda.min.js"></script>
<script async src="//unpkg.com/ramda-adjunct@5.0.1/dist/RA.web.standalone.min.js"></script>

曾经，函数式编程很难实现递归。

我们来试一试，需求：使用递归算出某个数字的阶乘值。
基础版本：

```ts
function factorial(n) {
  return n <= 1 ? n : n * factorial(n - 1)
}
```

尾递归优化后：

```ts
function factorial(n, total = 1) {
  return n <= 1 ? total : factorial(n - 1, n * total)
}
```

测试结果：

```ts
// 上面两个版本任选一个，测试结果为：120
factorial(5) 
```

为了方便理解，下面都以未尾调用优化的版本为例。



# 函数式递归的难点

我们可以使用函数式编程来实现这个递归函数，先来最简单的，把这个函数改写函数组合的形式：

```ts
import * as R from 'ramda'

function factorial(n) {
  return R.when(   // 三目运算符，不满足则返回 n，否则走到下面的 pipe()
    R.gt(R.__, 1), // 因为是不满足，所以这里是 n > 1，正好和 n <= 1 相反
    R.pipe(        // 组合
      R.juxt([     // 将 n “分身”为 [n, factorial(n - 1)]
        R.identity,
        R.pipe(R.dec, factorial)
      ]),           // 下面计算 n * factorial(n - 1)
      R.apply(R.multiply)
    )
  )(n)
}

// 测试，结果为：120
factorial(5) 
```

本文已经全局部署 `ramda`，可以通过全局变量 `R` 来访问，所以上述代码你可以直接在浏览器 F12 控制台中复制粘贴运行（注意不要复制 `import` 语句）。

然后改写成表达式形式：

```ts
import * as R from 'ramda'

// 这是错误示例，会报错，你也可以试试看
const factorial = R.when(
  R.gt(R.__, 1),
  R.pipe(R.juxt([R.identity, R.pipe(R.dec, factorial)]), R.apply(R.multiply))
)
```

这样写，会马上报错 `ReferenceError: factorial is not defined`，这是因为，在表达式中将 `factorial` 作为值来使用，但此时 `const` 语句未执行完毕，`factorial` 这个变量名处在 “死区” 中，访问它会报错。

一种解决方式是把 `const` 改成 `function`，这样就不存在 “死区” 了，因为函数声明会被 “提升” 到作用域最开头，所以不会报错：

```ts
import * as R from 'ramda'

function factorial(input) {
  return R.when(
    R.gt(R.__, 1),
    R.pipe(R.juxt([R.identity, R.pipe(R.dec, factorial)]), R.apply(R.multiply))
  )(input)
}
```

另一种解决方式，是把变量 `factorial` 改为方法的形式，即 `t => factorial(t)` 这种写法：

```ts
import * as R from 'ramda'

const factorial = R.when(
  R.gt(R.__, 1),
  R.pipe(R.juxt([R.identity, R.pipe(R.dec, t => factorial(t))]), R.apply(R.multiply))
)
```

上面无论哪种方式，都**不符合**函数式编程的要求，这是因为：

- 第一种方式，使用了 `function` 语句，它不是表达式；
- 第二种方法，你可以试试不使用变量名，如何将这个表达式当做 IIFE 执行，实际上根本没法执行，它不是真正的表达式；
  我利用了 JS 的一些语言特性，使它能运行，但并不代表这是真正的纯函数式实现。

可以看出，纯函数式实现递归，存在一个难以绕过的问题：**函数代码中如何使用一个标识符来代指函数自身，并用于下一轮执行。**



# 纯函数式实现递归

其实，这个问题倒不难解决：

既然在当前函数中，没有标识符能用来表示当前函数自身，**我们可以将当前函数放在另一个函数里，用这个新函数的一个参数作为标识符，来代指当前函数**：

```ts
// 原版本，代码中必须使用自身的变量名
const factorial1 =      n => n <= 1 ? n : n * factorial1(n - 1)
// 新写法，最左边加一个 f =>， 然后把函数中所有 factorial1 替换为 f
const factorial2 = f => n => n <= 1 ? n : n * f(n - 1)
```

此时，`factorial2` 是 `factorial1` 的高阶实现，它接受一个函数输入，返回一个新的已实现的递归函数，所以执行它时，需要先把自身传给自身，也就是 `factorial2(factorial2)`：

```ts
factorial2(factorial2)(5)
// 输出结果却是：NaN
```

这样调用结果仍然不对，这是因为，我们上面定义的 `factorial2`，它的定义方式结合 `factorial2(factorial2)` 的调用方式，其实和 `factorial1` 并不是等价的。

我们已经知道了 `factorial2` 本身并不是真正执行的函数，真正执行的时候，使用的是 `factorial2(factorial2)` 这种方式，所以表达式中的 `n * f(n - 1)` 肯定也是不对的，应该一并改成 `n * f(f)(n - 1)`，也就是把函数体中所有 `f` 替换成 `f(f)`。

继续改写函数：

```ts
// 这才是正确的：
const factorial3 = f => n => n <= 1 ? n : n * f(f)(n - 1)
```

此时这个函数就可以正确得出结果了：

```ts
factorial3(factorial3)(5)
// 输出结果：120
```

不过，这个函数每次调用时需要先传入自身，再输入数据，既麻烦又难看；
而且，这个函数要把自身作为变量传给自身，仍需要声明变量，所以还需要进一步改进。

下面给出两个方法：

**方法 1：**
既然这个函数需要先传入自身，我们可以直接在定义函数时把代码复制一遍，提前把这个步骤做了：

```ts
const factorial4 = 
  (f => n => n <= 1 ? n : n * f(f)(n - 1))
  (f => n => n <= 1 ? n : n * f(f)(n - 1))
```

这样，这个函数就可以直接调用，而不需要任何额外处理了：

```ts
factorial4(5)
// 输出结果：120
```

我们达成了需求，使用纯函数式来实现递归，这里的 `factorial4` 就是用纯函数来实现递归求阶乘的方式。

**方法 2：**
或者，我们也可以直接把这个函数转化为 “将自己作为参数执行过一次” 的版本：
准备一个新函数，它接受一个 `g` 函数，返回这个函数 “将自己作为参数执行过一次” 的版本：`g => g(g)`

我们复制 `factorial3` 函数的实现，并传给上面的 `g => g(g)` 当参数来执行，组合形成新函数，并测试：

```ts
const factorial5 = 
  (g => g(g))
  (f => n => n <= 1 ? n : n * f(f)(n - 1))
```

这样，这个函数也同样可以直接调用，而不需要任何额外处理了：

```ts
factorial5(5)
// 输出结果：120
```

我们再次达成了需求，使用纯函数式来实现了递归。

-----

回顾以下，我们发现，将递归函数改造使它无需自身标识符，流程如下：

- 步骤 ①，在递归函数外部套一层新函数，此函数接收参数 `f`，将递归函数中自身的函数名替换为 `f`；
  例如：你的递归函数是 `n => n <= 1 ? n : n * factorial(n - 1)`，
  操作后，修改为：`f => (n => n <= 1 ? n : n * f(n - 1))`；
- 步骤 ②，把递归函数中，所有 `f` 修改为 `f(f)`；
  修改前：`f => (n => n <= 1 ? n : n * f(n - 1))`；
  修改后：`f => (n => n <= 1 ? n : n * f(f)(n - 1))`；
- 步骤 ③，连带着前面的 `f =>`，把整个方法体套上括号，然后二选一：整体复制一遍 or 在前面加上 `(g => g(g))`；
  修改前：`f => (n => n <= 1 ? n : n * f(f)(n - 1))`；
  修改后：`(g => g(g))(f => (n => n <= 1 ? n : n * f(f)(n - 1)))`；

然后这个表达式就是你的递归函数的函数式实现，直接传入你想要的数据输入即可。

```ts
const done = (g => g(g))(f => (n => n <= 1 ? n : n * f(f)(n - 1)))

done(5)
// 输出结果：120
```

-----

为了严谨性，再测试一个递归函数，验证一下我们的想法：
需求是输入 `n`，返回斐波那契数列中第 `n` 位是多少。

普通递归实现和测试：

```ts
const fibonacci = 
  n => (n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2))

fibonacci(7) // 输出结果：13
fibonacci(9) // 输出结果：34
```

读到这里，我建议你别急着继续，先按照上面的步骤 ①、②、③，自己先实现一下这个斐波那契函数的函数式非递归版本，看看能不能运行。

<br />

以下是答案，两种方式任选其一即可：

函数式实现 1：

```ts
const fibonacci = 
  (f => n => (n <= 1 ? n : f(f)(n - 1) + f(f)(n - 2)))
  (f => n => (n <= 1 ? n : f(f)(n - 1) + f(f)(n - 2)))
```

函数式实现 2：

```ts
const fibonacci = 
  (g => g(g))
  (f => n => (n <= 1 ? n : f(f)(n - 1) + f(f)(n - 2)))
```



# Y 组合子

通过上文，可以看出把一个递归函数写成纯函数式，需要做非常多的改动。
因此，我们可以设计一个算法，只需要对递归函数进行简单的改造，并传给我们这个算法作为参数，就可以直接让它变为函数式形式。
而这个算法，就是 “Y 组合子”。

“[Y 组合子](https://en.wikipedia.org/wiki/Fixed-point_combinator)” 英文名为 Y combinator，偏学术的描述是这样的：“计算一个函数的不动点”。
这里 “不动点” 指的是：对于一个函数 `f`，存在某个值 `x` 使得 `f(x) = x` 成立，那么这个值就是函数的 “不动点”。例如，对于 `f(x) = 1 / x` 这个函数而言，`1`、`-1` 就是它的不动点。

我们可以寻找这个阶乘递归函数的不动点：

```ts
const factorial = n => n <= 1 ? n : n * factorial(n - 1)
```

可以发现，在 `n <= 1` 时，它返回值就是输入值（但我们肯定不会输入小于 `1` 的值），也就是说 `n` 为 `1` 就是它的不动点，此时不会再继续递归了，函数计算停止。
你可能已经看出来了，递归函数的**截止条件**，就是递归函数的不动点；而求出递归函数的不动点，其实就是在让递归函数朝着其截止条件来计算，直到达成截止条件——这其实就是在执行递归计算。

当然，Y 组合子无法直接应用于递归函数，毕竟递归函数没法写成表达式的形式，必须改写，我们会把递归函数按照上面步骤 ① 的方式改写为 `f => 递归函数代码` 这种形式，此时，这个新函数的不动点就是 `f(f) = f`，我们的目就是计算到这个条件满足为止。

> “Y 组合子” 的 lambda 演算的推导过程，可以参考 [这篇文章](https://blogs.nearsyh.me/2021/09/19/2021-09-19-y-combinator/)；“不动点” 的进阶知识，可以参考 [这篇文章](https://deathking.github.io/2015/03/21/all-about-y-combinator/)。
> 全网可以找到的 lambda 演算的文章非常多，但是却很少有直接用 JS 来演算，本文旨在提供简单直接的 JS 代码演算过程，无需 lambda 演算的知识即可看懂。

-----

Y 组合子，在 JS 中我们可以叫它 `Y` 函数，它就是为了实现求出传入函数的不动点这个目的。
接下来，我们尝试推导出 `Y` 函数的代码。

回顾之前改造递归函数的流程：

- 步骤 ①，在递归函数外部套一层新函数，此函数接收参数 `f`，将递归函数中自身的函数名替换为 `f`；
  例如：你的递归函数是 `n => n <= 1 ? n : n * factorial(n - 1)`，
  操作后，修改为：`f => (n => n <= 1 ? n : n * f(n - 1))`；
- 步骤 ②，把递归函数中，所有 `f` 修改为 `f(f)`；
  修改前：`f => (n => n <= 1 ? n : n * f(n - 1))`；
  修改后：`f => (n => n <= 1 ? n : n * f(f)(n - 1))`；
- 步骤 ③，连带着前面的 `f =>`，把整个方法体套上括号，然后二选一：整体复制一遍 or 在前面加上 `(g => g(g))`；
  修改前：`f => (n => n <= 1 ? n : n * f(f)(n - 1))`；
  修改后：`(g => g(g))(f => (n => n <= 1 ? n : n * f(f)(n - 1)))`；

我们从后往前反着来，一步一步得到 `Y` 函数的函数体。

步骤 ③ 的所做的变换过程，我们把它当做一个高阶函数 `Y3` 的话，它做的事情是：接受函数 `f` 返回它 `f(f)` 版本，用代码表示为：

```ts
const Y3 = f => {
  return function newFunction(input) {
    return f(f)(input)
  }
}

// 简化为箭头函数：
const Y3 = f => a => f(f)(a)

// 可以继续简化为：
const Y3 = f => f(f)
```

我们用步骤 ③ 执行前的表达式来测试这个 `Y3`：

```ts
Y3(f => (n => n <= 1 ? n : n * f(f)(n - 1)))(5)
// 输出结果：120
```

可见，我们自行封装的函数 `Y3` 正确还原了上面步骤 ③ 的操作。

继续封装步骤 ② 的操作，假设把这个步骤当做一个高阶函数 `Y2`，它做的事情是：接受一个形如 `a => b => a(b)` 的函数输入，将它改写为 `a => b => a(a)(b)` 的新函数并输出，用代码表示为：

```ts
const Y2 = rawFn => {
  return function newFunction(a) {
    // 这个新函数需要将原函数返回的结果函数，从 b => a(b) 改为 b => a(a)(b)
    // 所以我们直接对函数参数 a 来 “做手脚”，把它改成已把自身作为参数调用过一次的形式
    const newA = b => a(a)(b)

    // 用新的参数 newA 作为 a 传递给原函数 a => (b => a(b)) 执行，得到结果 b => newA(b)
    // 这个结果就是 b => a(a)(b)，至此所以我们的转换达成了目的
    return rawFn(newA)
  }
}

// 简化为纯箭头函数：
const Y2 = f => a => f(b => a(a)(b))
```

我们用步骤 ② 执行前的表达式来测试这个 `Y2`：

```ts
Y3(Y2(f => (n => n <= 1 ? n : n * f(n - 1))))(5)
// 输出结果：120
```

可见，我们自行封装的函数 `Y2` 正确还原了上面步骤 ② 的操作。

**步骤 ① 我们没法封装，因为这是在递归函数中消除标识符的必做步骤，这一步只能让使用者自己来做了。**

把 `Y3`、`Y2` 两个步骤结合起来，就得到了 `Y` 函数：

```ts
const Y = f => Y3(Y2(f))

const Y = f => (x => x(x))(a => f(b => a(a)(b)))
```

我们再用步骤 ② 执行前的表达式来测试（步骤 ① 必须由使用者来做）：

```ts
Y(f => (n => n <= 1 ? n : n * f(n - 1)))(5)
// 输出结果：120
```

可见，结果正确。
只需要将这两个函数组合起来，就得到了 `Y` 函数。

美化一下 `Y` 组合子的函数代码：

```ts
const Y = 
  f => 
    (t => t(t))
		(g => f(x => g(g)(x)))
```

将 `(t => t(t))` 展开，它也等价于：

```ts
const Y = 
  f => 
		(g => f(x => g(g)(x)))
		(g => f(x => g(g)(x)))
```

这便是 `Y` 组合子在 JS 中的实现。

我们也终于可以给出阶乘递归函数的纯函数式表达式：

```ts
const factorial = Y(f =>
  R.when(
    R.gt(R.__, 1), 
    R.pipe(
      R.juxt([R.identity, R.pipe(R.dec, f)]), 
      R.apply(R.multiply)
    )
  )
)
```



# 多参数的递归函数

虽然实现了 `Y` 组合子，但我们还有一个疑问，**如果递归函数包含多个参数该怎么办？**

我们尝试把刚才的阶乘递归函数进行尾递归优化：
优化前：

```ts
const factorial = n => n <= 1 ? n : n * factorial(n - 1)
```

优化后，尾递归版本需要接收两个参数：

```ts
const factorial = (n, total = 1) => n <= 1 ? total : factorial(n - 1, n * total)
```

改写为高阶形式，准备使用 `Y` 函数：

```ts
const factorial = f => (n, total = 1) => n <= 1 ? total : f(n - 1, n * total)
```

使用 `Y` 函数：

```ts
const factorial = Y(f => (n, total = 1) => n <= 1 ? total : f(n - 1, n * total))
```

测试：

```ts
factorial(5, 1) // 结果：1，不正确
factorial(5)    // 结果：1，不正确
```

可以发现，`Y()` 函数只能对单参数函数进行处理，多参数函数无法直接使用。

-----

这给了我们一种启发，如何将多参数函数转化为单参数函数？答案不言而喻了——**柯里化**。
我们把上面的流程重做：

初始版本：

```ts
const factorial = (n, total = 1) => n <= 1 ? total : factorial(n - 1, n * total)
```

我们手动为它柯里化，改写为依次接收两个参数的形式：

```ts
const factorial = n => total => n <= 1 ? total : factorial(n - 1, n * total)
```

这时候，函数体中的 `factorial()` 也应该改写：

```ts
const factorial = n => total => n <= 1 ? total : factorial(n - 1)(n * total)
```

消除自身变量名引用：

```ts
const factorial = f => n => total => n <= 1 ? total : f(n - 1)(n * total)
```

使用 `Y` 函数：

```ts
const factorial = Y(f => n => total => n <= 1 ? total : f(n - 1)(n * total))
```

测试，此时需要以下面这种方式连续传两个参数：

```ts
factorial(5)(1)
// 输出：120
```

这就是多参数函数使用 `Y` 函数的改造流程。

<br />

通过上面例子，得出结论，多参数的递归函数想应用 `Y` 函数实现纯函数式递归，改造流程如下

- **将原递归函数的参数列表，当做单参数柯里化的模式来写，也就是将多个参数拆分成多个函数相连的形式，例如 `(a, b, c) => ...` 改写为 `a => b => c => ...` 即可；**
- **在递归函数中调用自身标识符时，参数也要像单参数柯里化那样一次传一个，例如 `f(a, b, c)` 改写为 `f(a)(b)(c)` 即可。**



# 实践：遍历树形结构

在实际开发中，如果需要用到 `Y` 函数进行递归，直接从 `ramda-adjunct` 中导出 `Y` 即可：

```ts
import * as RA from 'ramda-adjunct'

const factorial = RA.Y(f => n => n <= 1 ? n : n * f(n - 1))
factorial(5)
// 输出：120
```

这也是 `ramda-adjunct` 提供的最重要的函数之一，推荐使用 `ramda` 的项目也一同使用 `ramda-adjunct`。

本文已经全局部署 `ramda-adjunct`，可以通过全局变量 `RA` 来访问，所以上述代码你可以直接在浏览器 F12 控制台中复制粘贴运行（注意不要复制 `import` 语句）。

-----

递归在实际项目开发中不常用，最多见的场景就是遍历树形结构。
以下给出一个使用 `Y` 函数以函数式编程的方式对树形结构做 `map` 变换的代码示例：

定义节点对象：

```ts
interface ITreeNode<TData = any> {
  data: TData
  children?: ITreeNode<TData>[]
}
```

写出一个简单的遍历函数：

```ts
import * as R from 'ramda'

function mapTree<TData = any, TResult = any>(
  tree: ITreeNode<TData>[],
  handleFn: (data: TData) => TResult
): ITreeNode<TResult>[] {
  function handleSubtree(subtree: ITreeNode<TData>[]): ITreeNode<TResult>[] {
    return R.map(
      R.pipe(
        R.when(R.complement(R.isEmpty), R.modify('children', handleSubtree)),
        R.modify('data', handleFn))
    )(subtree)
  }

  return handleSubtree(tree)
}
```

如果不使用 `Y`，那么不可避免的需要声明一个函数 `handleSubtree()`，导致 `mapTree` 无法写成纯表达式的形式。

利用 `Y` 来把它变为纯表达式形式：

```ts
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const mapTree = <TData = any, TResult = any>(
  tree: ITreeNode<TData>[],
  handleFn: (data: TData) => TResult
): ITreeNode<TResult>[] =>
  RA.Y((next: any) =>
    R.map(
  	  R.pipe(R.when(R.complement(R.isEmpty), R.modify('children', next)),
      R.modify('data', handleFn)
    )
  ))(tree)
```

测试代码：

```ts
const tree: ITreeNode<number>[] = [
  {
    data: 1,
    children: [
      { data: 11, children: [{ data: 111 }, { data: 112 }, { data: 113 }] },
      { data: 12, children: [{ data: 121 }, { data: 122 }, { data: 123 }] },
      { data: 13, children: [{ data: 131 }, { data: 132 }, { data: 133 }] },
    ],
  },
]

const newTree = mapTree2(tree, data => data + 10000)

console.log(newTree)
console.log(tree)
```
