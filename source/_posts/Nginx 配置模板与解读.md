---
title: Nginx 配置模板与解读
date: 2022-06-28 18:40:00
tags: 
- DevOps
- DOC
- Cheatsheet
- Scaffold
categories: 
- DevOps
---

持续更新，记录常用的 Nginx 配置模板，记录容易混淆和难以理解的配置项的含义和用法。

推荐访问：

- [在线 Nginx 配置](https://www.digitalocean.com/community/tools/nginx)；
- [Nginx 中文文档](https://tengine.taobao.org/nginx_docs/cn/docs/)；
- 强烈推荐：[中文 Nginx 入门教程](https://xuexb.github.io/learn-nginx/)。



# 禁用 IP 访问

以下示例中，将 IP 访问方式重定向到默认 404 页面：

```nginx
server {
  server_name _;
  listen 80 default_server;
  listen [::]:80 default_server;

  return 404;
}
```

这里出现了 `_` 这个主机名，它表示：接受未被任何其他 `server_name` 匹配到的主机名；

也出现了 `default_server` 这个端口监听的关键字，它表示：这个端口监听默认的服务器主机，也就是没有匹配到任何 `server` 时，使用这个监听来处理请求。



# 开启 HTTP2

新版本：

```nginx
server {
  # ...
  listen 80;
  listen 443 ssl;
  http2 on; # ← 新写法
}
```

-----

之前的版本：

```nginx
server {
  # ...
  listen 80 http2;      # ← 这里加上 http2
  listen 443 ssl http2; # ← 这里加上 http2
}
```

写法和 HTTP1.1 的写法完全不同。



# 跳转 https

```nginx
server {
  # ...
  listen 80;
  listen [::]:80;

  return 308 https://$host$request_uri;
}
```

请注意，这里的没有使用 `301` 永久重定向状态码，而是使用 `308` 状态码。好处是：

- `301` 状态码兼容性更好，但它会始终把请求改为 GET，也就是说 API 请求如果遇到 `301` 跳转，请求方法被改变，会导致出错；
- `308` 则表示永久重定向的同时，**还保持请求的方法**，目前浏览器已经支持了，但是 Postman 等工具支持的不太好。



# 自动添加或去除 www. 前缀

去除 www. 前缀：

```nginx
server {
  server_name www.your-domain.com;
  listen 443 ssl;
  listen [::]:443 ssl;

  ssl_certificate /path-to/fullchain.pem;
  ssl_certificate_key /path-to/key.pem;

  return 301 https://your-domain.com$request_uri;
}
```

-----

添加 www. 前缀：

```nginx
server {
  server_name your-domain.com;
  listen 443 ssl;
  listen [::]:443 ssl;

  ssl_certificate /path-to/fullchain.pem;
  ssl_certificate_key /path-to/key.pem;

  return 301 https://www.your-domain.com$request_uri;
}
```



# SPA 的配置

```nginx
location /subpath/ {
  alias /path-to-index-html/;
  try_files $uri $uri/ $uri/index.html;
}
```

这里给的示例是网站部署在子路径的写法，如果部署在根目录，直接写成 `location /` 即可。

记得 `location` 和 `alias` 尾缀的斜杠 `/`，都不要省略，否则可能会有 [安全问题](https://labs.hakaioffsec.com/nginx-alias-traversal/)。



# SPA 禁用 html 缓存

```nginx
location /subpath/ {
  alias /path-to-index-html/;
  try_files $uri @website-name;
  index index.html;
}

# 下面这条规则只对 index.html 生效
location @website-name {
  # ↓ 必须用 root，命名的 location 中不能使用 alias
  root /path-to-index-html/;
  try_files /index.html =404;
  
  # 下面就是禁用缓存相关的配置，本段参考了知乎、腾讯云的响应体
  expires -1;
  add_header Cache-Control "private, no-cache, no-store, max-age=0";
  add_header Pragma "no-cache";
  add_header Expires "0";
}
```

其中 `@website-name` 可以自定义，在两段配置中保持一致即可。



# 禁用 SourceMap

暴露 SourceMap 是极度危险的行为，其他人可以很容易的获得网站源码。

**如果你使用 create-react-app，推荐在打包时添加 `GENERATE_SOURCEMAP=false` 环境变量（或者写入 .env 文件中） ，这样就不会生成 SourceMap 了。或者是通过 CI/CD 配置，拷贝文件时跳过 .map 文件。**

如果使用必须使用 Nginx 配置，可以这样配置：

```nginx
location ~* \.map$ {
  deny all;
  return 404;
}
```

-----

如果希望在公司的 IP 地址可以访问 .map 文件，来方便调试，可以在 `deny all;` 这一行上面添加一行：

```nginx
allow 10.20.30.40;
```

把这里的数字改成公司的 IP 地址即可。



# WebSocket 配置

```nginx
location / {
  # ...
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```



# `location` 路由的几种配置的区别

**修饰符：**
对比以下配置：

```nginx
location /subpath { }
location = /subpath { }  # 需精确匹配 /subpath
location ~ /subpath { }  # 正则匹配，区分大小写
location ~* /subpath { } # 正则匹配，不区分大小写
location ^~ /subpath { } # 优先正则匹配，匹配到后立即停止向后搜索规则
```

-----

**路径：**
纯前端部署时，可以不管是否有尾缀斜杠 `/`；
但使用 `proxy_pass` 接入后端服务时，需注意：如果有尾缀斜杠 `/`，传入服务的流量路径会依据 `location` 中的路径进行截断。

例如某网站的后端 API 地址前缀为 `/api`，而后端服务直接接受不带前缀的 API 的路径，则需要配置为：

```nginx
location /api/ {
  proxy_pass service-host;
}
```

这里 `/api/` 尾缀的斜杠不能去掉，否则传入后端时，路径会以 `/api` 前缀开头。



# `root` 和 `alias` 的区别

网上很多文章说不清楚。实际上，Nginx 配置关键字 `root` 和 `alias` 的区别在于：

- `root` 指定根目录后，访问资源的 path 时基于 `root` + `location`；
- `alias` 指定根目录后，访问资源的 path 时基于 `alias`，“吃掉” 了 `location` 部分。

所以，只要你的网站不是部署在根目录下，那基本必须用到 `alias`，因为访问网站资源文件时要把网站的 “baseURL” 给去掉。

-----

如果还理解不了，这里举个例子，假设 Nginx 配置：

```nginx
location /path-a/ {
  alias /home/root/web-a/;
}

location /path-b/ {
  alias /home/root/web-b/;
}
```

访问 `/path-a/images/a.png` 时，实际在访问 `/home/root/web-a/path-a/images/a.png`；
访问 `/path-b/images/b.png` 时，实际在访问 `/home/root/web-b/images/b.png`。

可以看出区别，就是 `location` 的部分被 `alias` 给 “吃掉” 了。



# 图片防盗链

本段转载自 [xuexb 的中文 Nginx 教程](https://xuexb.github.io/learn-nginx/example/image-valid.html)。

```nginx
location ~* \.(gif|jpg|jpeg|png|bmp|webp)$ {
  valid_referers none blocked *.your-domain.com server_names;

  # 如果验证不通过则返回 403
  if ($invalid_referer) {
    return 403;
  }
}
```



# 验证 UA

```nginx
location / {
  if ($http_user_agent !~* "(Mozilla|Chrome)") {
    return 404;
  }
  
  # ...
}
```



# robots.txt 的配置

```nginx
location /robots.txt {
  alias /path-to-your/robots.txt;
}
```



# `proxy_set_` 系列配置

给后端服务配置 Nginx 时，通常会配置以下几条：

```nginx
location / {
  # ...
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

第一条写回真实的 `Host` 头，后面三条分别添加三个请求头，用于透传代理前这些请求的客户端 IP、途经 IP、协议等信息。



# 防超时

```nginx
# 如果服务收到请求要很久才能返回响应，那么调大下面这个值
proxy_read_timeout 90;

# 下面这两个不常用
# 将请求发送给服务的超时时间
proxy_send_timeout 90;

#与服务建立 TCP 连接的超时时间
proxy_connect_timeout 90;
```



# 身份认证

配置 nginx：

```nginx
location / {
  # 这个字符串是提示语，可以自行修改
  auth_basic "Restricted Area";
  auth_basic_user_file /path/to/your/app.htpasswd;
}
```

此时需要提供一个 `.htpasswd` 的用户名密码文件，这个文件需要使用 `httpd` 指令来生成。
此处给出使用 Docker 来生成的指令：

```bash
docker run --rm --entrypoint htpasswd httpd -Bbn <用户名> <密码>
```

运行后会输出用户名和哈希过的密码，可以将它追加到 `.htpasswd` 文件中。
这段指令执行后，会自动删除 Docker 容器，没有其他副作用。
