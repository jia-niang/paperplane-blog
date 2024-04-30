---
title: Docker Engine API 通过 HTTP 接口来控制 Docker
date: 2022-10-30 10:00:00
tags: 
- Docker
- DevOps
categories: 
- Docker
---

我们可能会有这种需求：让某个服务作为监控服务，监控和管理各个 Docker 容器的状态。有一种思路是：服务通过 SSH 连接到宿主机，然后远程执行命令。这种方式效率不高但开发量反而不小，并不推荐。

Docker 提供了名为 Docker Engine API 的交互 API，让我们可以通过 HTTP 请求来获取容器的状态、执行相关的 Docker 命令，它提供 RESTful 的 API，返回 JSON 格式数据，便于我们使用 Node.js 等程序进行访问。

可以参考 [Docker Engine API 文档](https://docs.docker.com/engine/api/latest/)，此外，大部分编程语言都有对应的 SDK，可以在官网的 [SDK 列表](https://docs.docker.com/engine/api/) 找到。



# 端口号和测试方式

Docker Engine API 的端口号是 `2375` 和 `2376`。通常只用前者；后者是基于 TLS 连接，需要额外配置证书。

可以使用这个指令判断 API 是否开启：

```bash
curl http://localhost:2375/version
```

如果 API 已经正确开启，会返回一段 JSON 数据：

```
{"Platform":{"Name":"Docker Engine - Community"}, ...（省略） 
```



# Windows 系统的 Docker Desktop

Docker Desktop 的设置页面，可以直接开启 Docker Engine API（在 macOS 上没有），如下图：

![](../images/image-20240315225827908.png)

开启后，**需要关闭并重新打开 Docker Desktop**。只点击右下角的 “Apply & restart”，或者是右键任务栏图标选择 “Restart” 可能会不生效。



# Linux 系统上的 Docker

在 Linux 上，Docker 不会默认把基于 TCP 的控制端口放开，而是要通过配置来告诉 Docker 使用哪种类型的 Socket 来监听请求。
默认情况，Docker 只在 `/var/run/docker.sock` 提供 `unix` 的 Socket，也就是我们常用的 `docker` 终端命令。

**第一种方式：**
Docker 支持 unix、tcp、fd 这三种协议的通讯，我们可以修改 dockerd 的启动指令，令其开放 tcp 协议的通讯。
阅读 [Docker Daemon CLI 文档](https://docs.docker.com/reference/cli/dockerd/#daemon-socket-option) 可以看到，使用 `-H ` 参数来配置 dockerd 监听 API 请求的方式。

编辑 Docker 的服务配置文件（路径中的 `lib` 也可能是 `etc`）：

```bash
sudo vim /lib/systemd/system/docker.service
```

可以看到，Docker 启动指令是这样的：

```ini
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
```

这里的 `-H fd://` 表示监听文件描述符 Socket，以实现 Docker 的服务激活功能。
我们需要添加 `-H tcp://0.0.0.0:2375` 来让 Docker 监听 `2375` 端口，但只添加这一个参数会使我们无法使用 `docker` 终端命令，所以再添加一个 `-H unix:///var/run/docker.sock` 来保持对终端指令的响应。

最终编辑为：

```ini
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock --containerd=/run/containerd/containerd.sock
```

然后重启 Docker：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker.service
```

此时便可以通过本机的 `2375` 端口来进行使用 API 操作 Docker 引擎了。
也可以将上面的 `0.0.0.0` 改为 `127.0.0.1`，此时只有本机的服务才能访问 API，外部传入的请求无法访问。

**第二种方式：**
通过文档可以得知，dockerd 的 `-H` 启动指令其实对应了 `daemon.json` 中的 `hosts` 配置项，所以我们可以通过 `daemon.json` 来配置，这样就不需要修改 dockerd 的服务配置了。

编辑 `daemon.json`，如果没有则先创建：

```bash
sudo vim /etc/docker/daemon.json
```

添加以下键值对并保存：

```json
{
  "hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"]
}
```

这样操作，达成的效果和第一种方法中的添加 `-H` 是一样。

但是，存在 [一个问题](https://github.com/moby/moby/issues/25471) 一直没有解决，那就是因为 dockerd 的服务配置默认有一个 `-H fd://` 配置，在 `daemon.json` 中配置 `hosts` 会导致和启动指令冲突，而我们的目的是避免修改服务配置，所以，需要使用一种方式覆盖原始的服务配置。解决方法：

创建一个配置文件：`/etc/systemd/system/docker.service.d/override.conf`，这一步可能要切换成 `root` 用户来进行；
编辑填入以下内容：

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd
```

然后重启 Docker 服务即可。
这种方式不用修改 dockerd 的原始服务配置。

-----

以上的方式均不适用 macOS，因为 macOS 并不是通过 systemd 启动 docker，且 macOS 的 Docker Desktop 也没有开放 2375 端口的选项。



# 各平台通用的推荐方式

**这种方式适用于各个平台，且不需要更改 Docker 的任何配置，是最推荐的做法。**

了解了原理，那么就存在一种思路，将 tcp 的连接转为 unix 的连接，也就是将 `tcp://0.0.0.0:2375` 的连接转发到 `unix:///var/run/docker.sock`，这样便可以实现开放 Docker Engine API 的 HTTP 访问了。

这种方法需使用名为 `bobrik/socat` 的镜像来启动一个容器。它的 Docker Compose 配置如下：

```yaml
services:
  docker-api:
    image: bobrik/socat
    container_name: docker-api
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock'
    command: TCP-LISTEN:2375,fork UNIX-CONNECT:/var/run/docker.sock
    # 将端口绑定到宿主机。如果不需要，下面两行可以注释掉
    ports:
    - '2375:2375'
```

这样便可以通过 `2375` 端口来访问 Docker Engine API 了。

从配置文件中可以看出，启动容器后提供指令，使得其中的程序将 `2375` 端口的 tcp 连接转发到 `docker.sock`；而又配置了 `volumes` 卷映射，将宿主机的 `docker.sock` 透传给容器，所以 tcp 连接被直接发送到了宿主机的 Docker 服务上。
如果需要绑定到宿主机的端口上，则可以使用 `ports` 端口映射。

-----

注意，上面例子中，`bobrik/socat` 这个镜像版本太旧，现在可能已经无法拉取。
可以改用 [`paperplanecc/socat`](https://hub.docker.com/r/paperplanecc/socat) 这个镜像，这是我按照它的 [源代码](https://github.com/bobrik/docker-socat/blob/master/Dockerfile) 构建而来的。

也可以自己构建，此处给出 Dockerfile 文件：

```dockerfile
FROM alpine:3.1

RUN apk --update add socat

ENTRYPOINT ["socat"]
```

你也可以使用 [`paperplanecc/docker-api`](https://hub.docker.com/r/paperplanecc/docker-api) 这个镜像，它是我专门为了访问 Docker Engine API 而构建的。
它的用法和 `paperplanecc/socat` 相同，但是它额外预设好了 `command` 启动指令，所以你不需要在使用时再提供 `command` 配置了，只需要正确挂载 `/var/run/docker.sock` 即可通过 `2375` 端口访问 Docker Engine API。
