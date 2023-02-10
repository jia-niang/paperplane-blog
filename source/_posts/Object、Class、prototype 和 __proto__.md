---
title: Object、Class、prototype 和 __proto__
date: 2018-05-07 08:24:25
tags:
- JS
categories:
- JS
---

# 类与对象



## ES5 以及之前的面向对象实现方式

在没有 ES6 的 `class` 关键字时，一般这样实现类：
``` js
// 构造函数
function Person(_name, _age) {
  this.name = _name
  this.age = _age
}

// 创建实例
const Jack = new Person('Jack', 18)
```
这里对象的构造流程可以理解为：

- `Person` 构造函数把它自身的 `.prototype` 拿出来当做 `this`，它在这个 `this` 上加了 `.name`、`.age` 等一堆属性；
- 这个构造函数没有返回值，但如果我们在调用它时使用 `new` 指令，即表示用它自身的 `this` 来作为返回值；同样调用此函数必须使用 `new`，不使用 `new` 直接调用得到的是一个 `undefined`，因为没有任何 `return`。

如果想给这个 `Person` 类添加一个名为 `halo` 的打招呼的方法属性，用于输出自己的名字 `.name` 属性，有几种实现方式：

最简单易懂的：

``` js
function Person(_name, _age) {
  this.name = _name
  this.age = _age
  // 直接在构造函数里给 this 加一个方法属性
  this.halo = function() {
    console.log(this.name)
  }
}
```
上面的代码直接在类内定义方法，因为这里使用了匿名函数，这会导致每个对象都独享一个单独的 `halo` 方法；

一般来说，类的方法应该是所有对象共享一个的，不应该是每个对象单独持有，因此这种方式不合理。让类的成员共享同一个方法、或是共享同一个属性，可以这样做：

``` js
// 将需要共享的属性抽离出来，放置在构造函数外：
function halo() {
  console.log(this.name)
}

function Person(_name, _age) {
  this.name = _name
  this.age = _age
  // 此时 halo 方法被定义在构造函数之外
  this.halo = halo
}
```


还有一种方法，将共享的属性定义在构造函数的原型上，因为构造函数初始的 `this` 就是用的它的 `.prototype` 原型，所以所有构造出的对象都共享构造函数的 `.prototype` 原型上的属性。写法：

``` js
function Person(_name, _age) {
  this.name = _name
  this.age = _age
}

// 把方法放置在构造函数的 .prototype 原型上
Person.prototype.halo = function() {
  console.log(this.name)
}
```



如果想要实现继承，则需要分别实现属性的继承（对象上）以及方法（构造函数原型）的继承。

代码可以这样写：

``` js
// 步骤1：属性继承
function Student(_name, _age, _school) {
  Person.call(this, _name, _age)
  this.school = _school
}

// 步骤2：原型继承，用来继承方法
Student.prototype = Object.create(Person.prototype)

// 步骤3：可选，构造器可不能跟着变成 Person 了，要改回来
Student.prototype.constructor = Student
```
这种使用构造函数来实现继承的方式，各个步骤的原理如下：

1、首先调用把自身的 `this` 交给 `Person` 这个构造函数，这样来继承 `Person` 的属性；

2、然后把 `Person` 的 `.prototype` 对象复制一份拿过来当做自己的 `.prototype`，这样来继承 `Person` 的方法；

3、因为上一步操作的把 `.prototype` 上的 `.constructor` 也一起改了，这个属性表示该原型的构造函数是哪个；`Student` 类的构造器肯定是 `Student` 构造函数本身，因此将它设置为 `Student`；如果省略这一步，别人对一个 `Student` 对象使用 `Object.create()` 构造出来的对象会是一个 `Person` 对象。

这些面向对象的实现方式都非常复杂，并不好理解，而且大多涉及到了 `.prototype`、`.constructor` 等概念。如果对 JS 面向对象和 JS 原型不甚了解，很容易被搞糊涂。



## ES6 新增的类和继承
ES6 带来了新的 `class` 语法：
``` js
class Person {
  constructor(_name, _age) {
    this.name = _name
    this.age = _age
  }
  
  halo() {
    console.log(this.name)
  }
}
```
ES6 的类必须使用 `new` 构建对象，这会调用它的构造器 `constructor` 方法，并返回其中的 `this`。

注意，JS 里没有真正的类这一概念，因此 `Person` 实际上是构造函数，`typeof Person` 的结果也是 `"function"`。

这种写法，类里面所有的方法都是定义在 `Person.prototype` 这个原型上的，不只有 `.halo()`，也包括了 `.constructor()`，因此它创建的所有对象上的实例方法都是相同的。

上面类声明代码，可以看做是等价于：

``` js
function Person() {}

Person.prototype.constructor = function(_name, _age) {
  this.name = _name
  this.age = _age
}

Person.prototype.halo = function() {
  console.log(this.name)
}
```



ES6 同样提供了类的继承：

``` js
class Student extends Person {
  constructor(_name, _age, _school) {
    super(_name, _age)
    this.school = _school
  }
}
```
如果类使用了继承，它必须在 `constructor` 中首先调用 `super()`，这是强制的；因为 ES6 实现的原理是先用 `super` 调用父类的构造器，在 `this` 上添加父类的属性，然后再在 `this` 上添加子类的属性。

如果想要在子类中访问父类的成员，则要使用 `super.prop` 这种形式。



# JS 原型的概念



## 显式原型 `.prototype`

显示原型具备以下特点：

- 它是一个 JS 引擎自动实现的对象，只有函数（类也是函数）具备 `.prototype`，而 JS 值、对象均不具备这个属性；

- 它一般用于实现属性的继承：当一个方法开始执行的时候，他会把自己的 `.prototype` 这个对象复制一份拿过来当做 `this`，所以说在一个函数的 `.prototype` 对象上添加新的属性、添加函数，所有由该函数构造出的对象都会具备这些新添的属性或函数。



例如，我们已经知道 ES6 类中所有方法均是定义在其类构造函数的原型上的，包括 `constructor` 也是，所以用 ES6 类构造出的对象也具备 `constructor` 方法：
``` js
class A {
  constructor() {}
}

const a1 = new A()
const a2 = new A()

// 以下均为 true 成立

// 所有 A 的实例共享相同的方法，它们都来自构造函数 A 的 .prototype 原型
a1.constructor === a2.constructor
a1.constructor === A.prototype.constructor
```



## 隐式原型 `.__proto__`

隐式原型具备以下特点：

- 它是几乎任何 JS 对象、方法、值都具有的属性，它表示变量被创建时的来源；

- 因为原生对象 `Object`、`Function` 等是由 JS 引擎自动创建的，因此它们的 `.__proto__` 也是由 JS 自动创建的；

- 它用于实现**原型链**，如果在一个对象上找不到某个属性，JS 引擎就会去它的原型链上依次向上寻找；同时 `instanceof` 关键字也会沿着原型链依次向上搜寻。



例如，以下表达式结果均为 `true`：
``` js
class A {}
let a = new A()

// 对象的来源是它的构造器
a.__proto__ === A.prototype
// 字面量对象，由系统自动调用 Object.create 创建
({}).__proto__ === Object.prototype

// 方法的来源
(function() {}).__proto__ === Function.prototype
A.__proto__ === Function.prototype

// 数值、字符串的来源
(1).__proto__ === Number.prototype
("~").__proto__ === String.prototype
```



# 原型的应用

以下代码构造一个名为 `stuA` 对象，并调用其 `.halo()` 方法发送问候：
``` js
const stuA = new Student('Jack', 17, 'SunSchool')
stuA.halo()
```
我们知道 `sutA` 本身具备了 `.name`、`.age` 和 `.shcool` 三个属性，这是构造函数赋予它的；

但是它本身不具备 `.halo()` 方法属性，因此 JS 引擎会先从 `Student` 的原型开始搜寻，`.__proto__` 属性指向着对象的构造函数的原型，也就是原型链的上一级，此时 JS 会访问 `stuA.__proto__` 并尝试搜寻 `.halo()` 方法属性。

``` js
// 以下表达式成立，返回 true
stuA.__proto__ === Student.prototype
```


而实际上，`Student.prototype` 上也没有具备 `.halo()` 方法属性，因此 JS 引擎会继续搜寻原型链的上一级，这一次搜寻的范围便是 `Person` 的原型 `Person.prototype`，`Student.prototype` 的 `.__proto__` 指向着它被创建的来源：

``` js
// 以下表达式成立，返回 true
Student.prototype.__proto__ === Person.prototype
```


而 `.halo()` 函数确实是定义在 `Person.prototype` 上的，因此找到了`.halo()`，JS 引擎便会执行之。

-----

假设我们调用的不是 `.halo()` 而是 `.toString()` 方法，此时 `Person.prototype` 上依然找不到这个方法，JS 引擎还会继续沿着原型链去寻找：

`Person `本身没有继承别的类，但是 JS 和 Java、C# 等编程语言的行为类似——如果一个对象不继承其他类，那么它默认继承了 `Object` 类。因此 `Person.prototype.__proto__` 指向了下一步要搜索的作作用域 `Object.prototype`：

``` js
// 以下表达式成立，返回 true
Person.prototype.__proto__ === Object.prototype
```
因为 `.toString()` 确实定义在这里，所以 `.toString()` 可以成功调用。



如果到了 `Object.prototype` 这里还是没有找到想要的属性，JS 引擎会再沿着原型链向上查找：

``` js
// 以下表达式成立，返回 true
Object.prototype.__proto__ === null
```


因为 `Objcect` 是几乎所有对象的基类，而它本身是没有基类的，它的原型链再往上就没有了，值为 `null`，JS 引擎判断到这里，发现 `.__proto__` 为 `null` 了，就知道到头了，如果此时还没有找到要找的属性，就会返回一个 `undefined`。

同样，`a instanceof A` 运算符也是依次沿着运算符 `a` 的 `.__proto__` 往上遍历，直到找到任何一个对象与 `A.prototype` 这个原型对象相等为止，返回 `true`；如果遍历到原型链最顶层的 `null` 还没有找到，返回 `false`。

综合上面的举例来看，我们的搜索路径是：
``` js
// 直接在对象上找
stuA
// 对象上找不到，去原型链 .__proto__ 上找
stuA.__proto__ === Student.prototype
// 还是找不到，继续沿着 .__proto__ 寻找
Student.prototype.__proto__ === Person.prototype
// 同上
Person.prototype.__proto__ === Object.prototype
// 同上，此时找到头了，原型链的末端是 null
Object.prototype.__proto__ === null
```
由此可见，任何对象都默认具备 `Object.prototype` 上的属性，例如 `.toString()`、`.valueOf()` 这些属性，因为寻找属性时沿着原型链搜寻最终都会找到 `Object.prototype` 这一级，再往上找就没了。

-----

对于类而言：

- 如果一个类没有继承任何其它的类，那么它的 `.prototype` 原型上的 `.__proto__` 便是 `Object.prototype`，所以类派生出的实例都有 `.toString()` 等属性；

- 如果一个类没有继承任何其它的类，那么它的构造函数（类名）的 `.__proto__` 便是 `Function.prototype`，这和 JS 中所有函数的行为相同；如果它继承了某一个类，它的 `.__proto__` 便是它继承的类的构造函数本身；

- 如果某个类继承了另一个类，它的 `.prototype` 原型上的 `.__proto__` 便是它继承的类的 `.prototype`；因此子类派生的实例可以使用父类上的方法。

上面这些话，用代码来描述就是这样：

``` js
// 普通的类，不继承任何类
// 它的构造方法来自于 Function.prototype，属性来自于 Object.prototype
class Person {}

// 以下表达式均为 true
Person.__proto__ === Function.prototype
Person.prototype.__proto__ === Object.prototype


// 类有继承的情况
// 子类构造方法和属性都来自于父类
class Student extends Person {}

// 以下结果均为 true
Student.__proto__ === Person
Student.prototype.__proto__ === Person.prototype
```
-----

ES6 的 `extends` 关键字只接受一个具备 `.prototype` 属性的对象（或者 `null`，此时类不能 `new` 实例化，不讨论这种场景），子类的原型的构造函数会自动指向为父类的原型。

也有一些特殊的对象和方法，他们可能没有原型，例如：
``` js
// obj 是真正的空对象，没有任何属性且不继承任何属性，包括 .__proto__
const obj = Object.create(null)

// 使用 bind() 创建的函数没有 .prototype 对象
const func = (function() {}).bind({})
```



# 在开发中使用原型



## 慎用 `.__proto__`

注意 `.__proto__` 并不是一个标准属性。

ES6 规定浏览器环境必须部署 `.__proto__` 这个属性，但是实际上还是不推荐使用这种用法，因为 JS 代码经常要运行在 Node.js 端或者其他平台上，无法保证所有运行环境都有这个属性。

标准化的写法应该是：
``` js
// 视同使用 obj.__proto__
Object.getPrototypeOf(obj)

// 视同使用 obj.__proto__ = prop
Object.setPrototypeOf(obj, prop)
```



## 对原生类的扩展

可以使用 `extends` 关键字来扩展JS原生对象的构造函数，并且使用 `super(...args)` 来生成同样的实例，例如：
``` js
class MyArray extends Array {
  // 构造函数中必须先调用super()
  constructor(...args) {
    super(...args)
    //...
  }
  
  // 自己定义一个给数组求和的函数
  sum() {
    return this.reduce((a, b) => a + b )
  }
  
  // 【可选操作】
  // 如果你想让这个自己的数组在 instanceof Array 时依然返回 true
  // 那么加上下面这个属性即可实现，不过这只在扩展 JS 原生类型时有用
  static get [Symbol.species]() {
    return Array
  }
  
  //...
}
```
这样便实现了对原生类型的扩展。

可以这样使用这个原生对象：

``` js
const myArray= new MyArray()

// 调用 Array 类的方法，放入数组成员
myArray.push(100)
myArray.push(88)

// 调用 Array 类的方法
myArray.length === 2

// 调用自己定义的方法
myArray.sum() === 188
```



## 使用实例来构造对象

任何构造函数都具备 `.prototype` 原型对象，而该原型对象具备一个 `.constructor` 属性表示它原本的构造函数；

而一个对象的 `.__proto__` 即表示它的原型对象。代码如下：

``` js
// 使用已有的 person 对象创造一个新的 newPerson
const newPerson = new person.__proto__.constructor()
```



## `Object.create()` 的用法

`Objcet.create(obj)` 返回一个新对象，它的原型链 `.__proto__` 指向这里的 `obj` 参数。

可以理解为：它创建了一个以 `obj` 作为原型链上一级的对象。

`Object.create(null)` 会创造一个真正意义上的空对象，甚至没有 `.toString()` 等方法。