---
title: Typescript 中的 Utility Types、intrinsic 和 infer
date: 2023-10-19 16:00:00
tags:
- JS
- TS
- Cheatsheet
categories: 
- JS
---

本篇介绍标题中提到的三个关键词。笼统来说，它们的作用大体上可以简介为：

- Utility Types 中文叫 “实用类型”，它们是由 Typescript 内置提供的一系列类型工具，用于实现一些类型操作；
- `intrinsic` 是表示 “占位” 意义的关键词，有些复杂类型必须由类型系统内部来实现，所以放这么一个关键词来占位；
- `infer` 表示 “推断”，可以理解为中学时期数学课解方程时使用的 “未知数”，也就是把某个类型当做 “未知数”。



# Utility Types 实用类型

以 VSCode 为例，在任一个 .ts 文件中随便输入一个实用类型，例如 `Omit`，然后左键点击并按下 F12，即可打开当前支持的所有实用类型的源码文件。这里可以看到所有内置的实用类型以及它们的实现源代码。

这个文件中也包含了当前环境下的很多全局变量、全局 API 的类型。
以下是各实用类型的介绍：



**字段可空性和访问性处理：**

`Partial<T>`：使对象 `T` 的所有字段变为非必须（可空）；
`Required<T>`：所有字段为必须（不可空）；
`Readonly<T>`：所有字段变为只读（添加 `readonly` 修饰符）。

> 这里的 `Partial` 和 `Required` 用到了 `+?`、`-?` 的[映射属性修饰符语法](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers)。
>
> 我们也可以使用 `-readonly` 修饰语法，来自己实现一个 `Readable` 以实现与上面的 `Readonly` 相反的功能：
>
> ```typescript
> // 把对象所有字段变为可写
> type Readable<T> = {
>   -readonly [P in keyof T]: T[P]
> }
> ```



**类型集合操作：**

`Extract<T, U>`：从集合 `T` 中**选取**符合 `U` 的所有项，用选取的项组成一个新集合；
`Exclude<T, U>`：从集合 `T` 中**删去**符合 `U` 的所有项，用剩余的项组成一个新集合；
`NonNullable<T>`：从集合 `T` 中删去所有 `null` 和 `undefined` 的项，用剩余的项组成一个新集合。

**对象字段：**

`Pick<T, K>`：从对象 `T` 中**选取**数个符合 `K` 的字段，选取的字段组成一个新对象；
`Omit<T, K>`：从对象 `T` 中**删去**数个符合 `K` 的字段，剩余的字段组成一个新对象；
`Record<K, V>`：得到一个对象，它所有的键都来自于 `K`，所有的值都是来自于 `V`。

>实用类型 `Pick` 就像 `lodash` 的 `_.pick`，而 `Omit` 就像 `_.omit`；
>实际上 `Omit` 是由 `Pick` 和 `Exclude` 组合而来。



**方法：**

`Parameters<T>`：通常配合 `typeof` 关键字使用，获取方法 `T` 的参数的类型，并组成一个数组返回；
`ReturnType<T>`：通常配合 `typeof` 关键字使用，获取方法 `T` 的返回值类型。



**面向对象**：

`ConstructorParameters<T>`：同上 `Parameters<T>`，只不过传入的 `T` 需要使用 `typeof` 接构造函数名（也就是类名）；
`InstanceType`：同上 `ReturnType<T>`，只不过传入的 `T` 需要使用 `typeof` 接构造函数名（也就是类名）；
`ThisType<T>`：返回一个对象，这个对象的方法中，`this` 的类型为 `T`。**现在有更好的语法来取代他，举例：**

```typescript
type User = {
  name: string
  age: number
}

// 第一个对象，必须使用 ThisType<User>，否则下面的 this.age 会提示错误
const user1: ThisType<User> = {
  name: 'user1',

  sayHello() {
    return `我叫${this.name}，年龄${this.age}`
  },
}

// 第二个对象
const user2 = {
  name: 'user2',
  
  // 注意这里的 this 是一个不存在的参数，它写在这里仅用于表示此方法中 this 的类型
  // 实际上 sayHello 的方法签名是 ()，不接受任何参数
  sayHello(this: User) {
    return `我叫${this.name}，年龄${this.age}`
  },
}
```



**字符串大小写处理：**

`Uppercase<T>`：字符串 `T`  的全大写格式；
`Lowercase<T>`：字符串 `T`  的全小写格式；
`Capitalize<T>`：字符串 `T`  的首字母大写格式；
`Uncapitalize<T>`：字符串 `T`  的首字母小写格式。



通常 `Uppercase`、`Lowercase` 的使用场景比较少，此处给出一个使用示例：

```typescript
/** 将指定对象的所有键转为大写，并添加 REACT_APP_ 前缀 */
type ReactAppEnvType<T extends object> = {
  [K in keyof T as `REACT_APP_${Uppercase<string & K>}`]: T[K]
}

// 原始对象
const envVarObject = {
  apiRoot: '',
  openAiKey: '',
}

// 经过 ReactAppEnvType 转化后
// 此对象的键必须使用此格式，更换前缀或大小写都会导致错误
const reactEnvVarObject: ReactAppEnvType<typeof envVarObject> = {
  REACT_APP_APIROOT: '',
  REACT_APP_OPENAIKEY: '',
}
```

-----

而 `Capitalize` 和 `Uncapitalize` 使用场景会更多一点，给出一个使用示例：

```typescript
/** 为指定对象中所有的键添加 getter 和 setter 方法 */
type ModelType<T extends object> = T & {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (p: T[K]) => void
}

// 原始对象
const user = {
  name: '',
}

// 经过 ModelType 转化后的对象
// 此对象的键必须使用此格式，更换前缀或大小写都会导致错误
const userModel: ModelType<typeof user> = {
  name: '',
  getName: () => '',
  setName: p => {},
}
```

以上便是这些实用类型的用法。



# `intrinsic` 关键字

上文中讲到了 `Uppercase`、`Lowercase`、`Capitalize` 和 `Uncapitalize` 四个实用类型。
可以看到它们的源码：

```typescript
// 注：源码中含有注释，此处为了简洁，删除了所有注释

type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;
```

这里便出现了 `intrinsic` 关键字，而且 `intrinsic` 作为关键字在源码中总共就出现了这四次。

可以看出，这四个实用类型**很难用其它实用类型和 Typescript 语法组合来实现，实际上它是由 Typescript 语言内部直接实现的，所以此处没有源码**。
也就是说 `intrinsic` 关键字只是起到一个**占位**的作用，这也是 [官方的说法](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#intrinsic-string-manipulation-types)。



# `infer` 关键字

前面说过，`infer` 实际上用于类型推断的功能。
`infer` 必须和 `extends` 配合写成三目运算符的格式，用于推断出现在占位符位置的类型。

简单来说：

- 代码 `infer X` 表示在当前这个位置放置 “未知数” `X`，让 Typescript 来推断位于此处的 `X` 的类型；
- 因为需要推断，所以 `infer` 需要配合三目运算符，它表示如果此类型可推断和无法推断时的类型取值。

光是这么说很难去理解，这里给出几个代码示例：

举例1，已知一个数组，获取它的成员类型：

```typescript
// 一般来说数组会写成 User[] 这种形式，那么想推测 User 的类型，则写成 (infer U)[]
// 使用 infer U 来作为 User 这个类型的占位符，让 Typescript 来推测 U

// 代码如下：
type TypeofArray<T extends any[]> = T extends (infer U)[] ? U : never
```



举例2，已知一个 `Promise`，获取它成功后的值：

```typescript
// 显而易见，直接将 infer 放在 Promise 的尖括号里
type TypeofPromise<T> = T extends Promise<infer R> ? R : never
```



举例3，Typescript 内置实用类型 `ReturnType<T>` 的实现：

```typescript
// 一般来说方法会写成 () => T 这种形式，那么想推测 T 类型，则写成：
// (...args: any) => infer R ? R : any

// 使用 infer R 来作为返回值类型的占位符，让 TS 来推测 R

// 代码如下
type ReturnType<T> = T extends (...args: any) => infer R ? R : any
```



> Typescript 中，`infer` 定义的 “未知数” 类型如果放置在**函数参数**的位置，它遵循逆变规则，例如推断方法参数时存在多个类型 `A` 和 `B`，那么最终结果是 `A & B`（更具体的参数兼容较为抽象的参数）；
> 如果放在数组、对象字段、函数返回值等位置，它遵循协变规则，此时若存在多个类型则最终结果为 `A | B`（较为抽象类型可用于接收更具体的返回值）。
