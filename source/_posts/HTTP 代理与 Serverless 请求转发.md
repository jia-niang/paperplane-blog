---
title: 搭建 HTTP 代理与 Serverless 请求转发
date: 2025-06-13 10:00:00
tags: 
- DevOps
- Node
categories: 
- DevOps
---

我一直通过 [OpenRouter](https://openrouter.ai/) 购买和使用 AI 服务，但 AI 服务提供商往往会有服务地区限制，例如 OpenAI 不对亚洲大部分地区提供服务；而 OpenRouter 作为代理商，也遵守此规则，会把用户的 IP 透传给上游。

因此，需要一种中转代理的方式，使我们的 AI 调用的出口 IP 改为欧美国家。

有这么几种思路：

- 直接使用国内中转商提供的 AI 服务，有中转商跑路、服务可用性低速度慢、提供低价 AI 模型输出以次充好这几方面的顾虑；
- 选购欧美国家的云服务器作为代理，这种方式一劳永逸，但成本高；
  因为很多便宜的云服务供应商的 IP 已经被严重滥用了，无法用做 OpenAI 中转；
- 使用云服务供应商的 Serverless 服务来转发，这种方式成本低，按量计费，非常推荐；
  但 Cloudflare Workers 无法使用，可以尝试阿里云或腾讯云，我就是用的腾讯云的 **硅谷** 地区的云函数。

本文介绍我自己的配置方式，同时对现在常见的各种代理、中转方案的原理、搭建方式进行介绍，方便有同类需求的开发者。



# HTTP 代理服务器

很多软件支持设置代理，例如腾讯 QQ 登录界面右上角设置里就可以开启代理； 有些 JS 库、SDK 等工具也支持配置代理。

以 Foxmail 为例，它的配置界面如下：

![](../images/image-20251025160312533.png)

使用 HTTP 代理时，需要填写代理服务器地址和端口，以及用户名和密码。

再举一个 JS 库的例子，在 Node.js 运行的 `axios` 便支持代理，不过还需要安装 `https-proxy-agent` 这个库；
以下是用法：

```typescript
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

const client = axios.create({
  httpsAgent: new HttpsProxyAgent(
    'https://username:password@example.com:1234'
  ),
})
```

可以看到，这里的服务器、端口、用户名、密码，其实和上面 Foxmail 配置时填写的是一样的。

而 OpenAI 等 SDK 也是基于 `axios` 这类工具，因此这个配置也可以直接应用给 OpenAI：

```typescript
import { HttpsProxyAgent } from 'https-proxy-agent'
import OpenAI from 'openai'

const openAI = new OpenAI({
  httpsAgent: new HttpsProxyAgent(
    'https://username:password@example.com:1234'
  )
  // 其它配置 ...
})
```

这样配置后，我们的 AI 请求就会经过这台服务器中转，达成替换 IP 的效果。

<br />

这种代理的全名叫做 “HTTP 正向透明代理”，下面是它的原理介绍。



## 被代理的请求是怎样的


对于 HTTP 和 HTTPS 的请求，代理的实现方式存在区别，以下会分别介绍。

首先明确一点，工具配置了代理后，请求是直接发给这个代理服务器的，不会直接发送给目标；
以下示例中，我们假设请求要发送给 `http(s)://target.com`，但配置了代理服务器 `proxy.com`。

**代理 HTTP 请求：**
在工具未配置代理时，请求直接发给 `http://target.com`，此时请求体首行是这样的：

```http
GET / HTTP/1.1
```

而配置了代理后，请求改为发送给 `proxy.com`，请求体首行也会发生变化：

```http
GET http://target.com/ HTTP/1.1
```

可以看出，原本只有子路径的首行，现在是一个完整 URL；
代理服务器收到后，就能意识到这是一个代理请求，便会帮助来源把请求转发出去，同时在收到目标响应后回传。

注意，代理服务器在转发请求时，可能会添加一些额外的请求头。

<br />

**代理 HTTPS 请求：**
因为 HTTPS 请求是非对称加密的，代理服务器也无法解开，此时便不可解读请求体；
此时，会向代理服务器 `proxy.com` 发出一个 `CONNECT` 请求，第一行是这样的：

```http
CONNECT target.com:443 HTTP/1.1
```

这会和代理服务器建立一个 SSL/TLS 隧道，后续的所有数据都通过原始字节流传输；
代理服务器在此过程中只能充当桥梁，无法得知任何请求和响应的内容。



## 使用 Node.js 搭建 HTTP 代理

从上面的例子可以看出，HTTP 和 HTTPS 的代理是不一样的。如果用 Node.js 来搭建搭理，也是需要针对这两种情况分别处理。

以下是源码：

```typescript
const http = require('http')
const net = require('net')

const httpProxy = http.createServer((req, res) => {
  const targetUrl = new URL(req.url)

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 80,
    path: targetUrl.pathname,
    method: req.method,
    headers: req.headers,
  }

  const proxyReq = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', err => {
    console.error('HTTP Proxy Error:', err.message)
    res.writeHead(500)
    res.end('Internal Server Error')
  })

  req.pipe(proxyReq)
})

httpProxy.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = new URL(`https://${req.url}`)

  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
    serverSocket.write(head)
    serverSocket.pipe(clientSocket)
    clientSocket.pipe(serverSocket)
  })

  serverSocket.on('error', err => {
    console.error('HTTPS Proxy Error:', err.message)
    clientSocket.end()
  })

  clientSocket.on('error', err => {
    console.error('HTTPS Proxy Error:', err.message)
    serverSocket.end()
  })
})

httpProxy.listen(9000, () => {})
```

可以看到，上面的代码中，HTTP 和 HTTPS 的请求完全不同。

你可以把它存为 `index.js`，并运行 `node index.js`，运行后便会在 `9000` 端口开放代理；
你可以通过 `http://127.0.0.1:9000` 来使用这个代理服务器。

如果你是 Linux 或者 macOS 系统，可以通过以下命令来测试：

```bash
curl -x http://127.0.0.1:9000 http://www.baidu.com
curl -x http://127.0.0.1:9000 https://www.baidu.com
```

如果是 Windows 系统，可以再写一个 `test.js` 文件：

```typescript
const axios = require('axios')
const { HttpsProxyAgent } = require('https-proxy-agent')

axios
  .get('https://www.baidu.com', {
    httpAgent: new HttpsProxyAgent('http://127.0.0.1:9000'),
    httpsAgent: new HttpsProxyAgent('http://127.0.0.1:9000'),
    headers: { 'User-Agent': 'Chrome' },
  })
  .then(res => res.data)
  .then(console.log)
```

然后运行 `node test.js` 便可测试。

-----

如果你拥有一台 Node.js 服务器，那么可以尝试这种方法。但是海外云服务器的成本较高，更优的选择应该是 Serverless 云函数。

以上代码无法在 Cloudflare Workers、腾讯云等 Serverless 端运行，因为云函数通常禁止 `CONNECT` 连接，而且云函数的用户协议通常也不允许代理行为，甚至可能内置了一些检测机制。

 

## 使用 Docker 搭建 HTTP 代理

上述 Node.js 示例太过简陋，实际上一般也不会使用它来当做代理；
以下给出两个可用于搭建 HTTP 正向透明代理的 Docker 镜像。



**镜像 `ubuntu/squid`：**
这是一个用于搭建 HTTP 代理的镜像，配置简单。

以下是 `docker-compose.yml` 配置：

```yaml
services:
  squid:
    image: ubuntu/squid
    container_name: squid
    volumes:
      - ./squid.conf:/etc/squid/squid.conf
    ports:
      - '1234:1234'
```

与之配套的是一个 `squid.conf` 配置文件，内容如下：

```nginx
# 端口号要和上面保持一致
http_port 1234
http_access allow all
```

这样就可以把服务器的域名或者 IP 地址，以及 `1234` 端口号作为代理服务器了。

<br />

不过，这样的代理服务器没有鉴权，任何人都可以匿名使用，非常不推荐，如果被黑客扫描到，用作恶意用途，我们可能要负法律责任。
因此，下面给出需要简单 HTTP 登录认证的配置方式。

先想好用户名和密码，然后运行以下命令，生成哈希后的密码：

```bash
docker run --rm --entrypoint htpasswd httpd -Bbn 用户名 密码
```

记录下这一行，把它存储在文件 `auth.htpasswd` 中；
然后修改 `docker-compose.yml`，我们需要把这个文件挂载进去，让 `squid` 能访问到：

```yaml
services:
  squid:
    image: ubuntu/squid
    container_name: squid
    volumes:
      - ./squid.conf:/etc/squid/squid.conf
      # 这里 ↓
      - ./auth.htpasswd:/etc/squid/auth.htpasswd
    ports:
      - '1234:1234'
```

然后，我们需要修改 `squid.conf`，开启身份认证：

```nginx
http_port 1234

auth_param basic program /usr/lib/squid/basic_ncsa_auth /etc/squid/auth.htpasswd
auth_param basic children 5
auth_param basic realm Auth
auth_param basic credentialsttl 2 hours
auth_param basic casesensitive on

acl authenticated proxy_auth REQUIRED
http_access allow authenticated
http_access deny all
```

以上配置表示用户名区分大小写、有 5 个子进程负责认证、认证的有效时间是 2 小时等，还会拒绝任何未认证的代理请求。
配置完成后记得重启这个 Docker 容器。

此后，你配置代理服务器时就需要填写用户名和密码了，不过这也避免了代理服务器被滥用。

-----

**镜像 `v2fly/v2fly-core`：**
这个镜像也有基本 HTTP 代理服务器的功能，不过部分云服务提供商可能会禁用这个进程名，不太推荐使用它。

以下是 `docker-compose.yml` 配置：

```yaml
services:
  v2fly:
    image: v2fly/v2fly-core
    container_name: v2fly
    volumes:
      - ./config.json:/etc/v2fly/config.json
    ports:
      - '1234:1234'
    command: 'run -config=/etc/v2fly/config.json'
```

与之配套的是一个 `config.json` 配置文件，内容如下：

```json
{
  "inbounds": [
    {
      "port": 1234,
      "protocol": "http",
      "settings": {
        "allowTransparent": false,
        "accounts": [
          {
            "user": "username",
            "pass": "password"
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
```

此时用户名和密码可以直接在配置文件里设置，也支持多个；
这里的 `allowTransparent` 可以开启，这会启用 “透明模式”，如果你的请求工具或目标无法正常运作，可以尝试开启它。



# Serverless 中转

有时我们能在网上见到这种 “代理” 服务：

![](../images/image-20251025170850612.png)

实际上这并不是一种 “代理”，而只能称得上是 “转发”，我喜欢称之为 “URL 前缀转发”。

我们把目标 URL 作为子目录接在某个服务 URL 的后面，请求发给这个服务，这个服务接收到请求后，内部执行了这样的逻辑：

- 解析 URL，提取出目标 URL；
- 根据我们请求时的方法、请求头、参数、Body 等，构建一个新的请求，但覆写其中的 `Host` 等头；
- 把这个新的请求发给目标 URL；
- 收到响应后，把响应回传给我们，有可能会加工一下响应内容。

可以看出，这只能称得上是 “转发”，而不是 “代理”。

这种方式，这个第三方服务对请求和响应完全可见，安全性较差。
不过，我们可以自己用 Node.js 来搭建一个，而且这种方式可以使用 Serverless 来搭建，来节约成本。



## Cloudflare Workers 搭建 URL 前缀转发

在 Cloudflare 中新建 Worker，然后把代码替换为：

```typescript
export default {
  async fetch(request, env, ctx) {
    const targetUrl = new URL(request.url.replace('<你的Worker的URL>', ''))

    const reqHeaders = Object.fromEntries(request.headers.entries().filter(([k]) => !k.startsWith('cf-')))

    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: {
        ...reqHeaders,
        Host: targetUrl.host,
      },
    })

    const response = await fetch(modifiedRequest)

    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })

    return modifiedResponse
  },
}
```

你还要再修改一处，代码中的 `'<你的Worker的URL>'` 要换成这个 Worker 的访问地址。

注意，经过 Cloudflare Workers 的请求，会被附加一些 `cf-` 开头的请求头，为了避免请求被过度修改，代码中已尽可能做了滤除；但还会有一些类似于 `cf-ray` 的请求头，由 Cloudflare Worker 强制添加，无法避免。

完成后，便可以通过在这个 Worker 的访问地址后面拼接你需要访问的 URL，然后就能成功访问了；
例如：`https://xxxx.xxxx.workers.dev/https://github.com`。

不过，中国大陆地区可能无法使用 `workers.dev` 域名，因此，你可能需要准备一个域名并由 Cloudflare 托管，然后把它绑定到这个 Worker 上，使用自己的域名；
绑定自己的域名时，上面代码中的 URL 也要改成自己的域名。

> Cloudflare Workers 无法用于 OpenAI。



## 腾讯云云函数搭建 URL 前缀转发

创建云函数时，选择 Node.js 18，类型选择 Web 函数；
在网页中的在线 IDE 中，打开终端，先输入 `cd src`，然后输入 `npm add express`，这样来安装依赖项；
然后，把代码替换为：

```typescript
const express = require('express')
const https = require('https')
const http = require('http')

const app = express()

app.use((req, res) => {
  const targetUrl = req.originalUrl.slice(1)
  const parsedUrl = new URL(targetUrl)

  const client = parsedUrl.protocol === 'https:' ? https : http

  const headers = {
    ...req.headers,
    host: parsedUrl.hostname,
  }
  for (const key in headers) {
    if (key.startsWith('x-scf-') || key.startsWith('x-cube-')) {
      delete headers[key]
    }
  }
  delete headers['x-forwarded-for']
  delete headers['x-real-ip']

  const proxy = client.request(
    parsedUrl,
    {
      method: req.method,
      headers,
    },
    proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res, { end: true })
    }
  )

  req.pipe(proxy, { end: true })

  proxy.on('error', err => {
    console.error('Proxy error:', err)
    res.status(500).send('Proxy error:\r\n' + err.message)
  })
})

app.listen(9000, () => {})
```

这样即可完成，注意一点都不用改，端口必须是 `9000`。

使用腾讯云的云函数 URL 即可，如果有需求，可以绑定自己的

注意，腾讯云的云函数也会给请求添加很多请求头，大部分以 `x-scf-` 和 `x-cube-` 开头，这些请求头甚至还包含腾讯云账户 ID 等敏感信息，一定要去除，代码中已经提供了去除的逻辑；
此外，还有 `x-real-ip` 和 `x-forwarded-for` 两个请求头，这两个似乎是 `express` 加上的，代码中也已做去除。

> 可以在硅谷地区创建腾讯云云函数，此地区可以使用 OpenAI。



## 通过 express 中间件中转 OpenRouter

上面的例子中，请求目标 URL 可以自己随便填写。
但实际上，我们可以只代理针对某个特定 URL 的请求，不需要每次都从 URL 中提取；创建一个云函数或 Node.js 服务，代理发给某个地址的请求，把请求原样发过去、得到响应后原样传回，这样非常简便。

这很适合 OpenRouter 或者其他 AI 服务的代理，因为大部分 AI 工具都允许我们自定义 Endpoint，我们只需要修改一下 Endpoint 到我们自己的云函数 URL 即可。

这里可以用到 `express` 和 `http-proxy-middleware`，这个中间件的行为就如同上面描述的一样，且使用简单，只需要配置目标 URL 和是否更换 `Origin` 即可。
这种方式既可以通过 Node.js 服务器运行，也可以通过 Serverless 云函数来运行。

以下是实例部分，也是我正在用的方式，在腾讯云上进行操作：
创建云函数时，地区选择 **硅谷**，语言为 Node.js 18 以及 **Web 函数**，配置方面，固定出口 IP 可以打开，超时时间建议设置为 30 秒或更长。

代码填入：

```typescript
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express()

app.use('/',
  createProxyMiddleware({
    target: 'https://openrouter.ai/api', changeOrigin: true,
  })
);

app.listen(9000, () => { })
```

然后，在在线 IDE 中打开终端，运行 `cd src` 进入目录，然后运行 `npm add express http-proxy-middleware` 添加依赖项；
依赖项安装完成后，便可以部署这个云函数。

之后，只需要记录下这个云函数的公网访问 URL 即可，在所有需要填写 Endpoint 的地方，使用这个函数的 URL 取代 `https://openrouter.ai/api`，这样便可以畅通无阻使用 OpenRouter。
这也是我正在使用的做法，虽然会产生费用，但每天不超过 1 分钱，成本可以忽略不计。
