---
title: Web 开发常用指令
date: 2021-08-18 16:43:00
tags:
- npm
- Cheatsheet
categories:
- DOC
---

# 配置 npm

``` bash
# 换淘宝源
npm config set registry https://registry.npmmirror.com
# 换回官方源（https://registry.npmjs.org）
npm config delete registry
# 查看当前源
npm config get registry

# 查看缓存目录
npm config get cache

# 更新 npm
npm install -g npm@latest
```



# 配置 Yarn

```bash
# 安装 yarn
npm i -g yarn

# 换淘宝源
yarn config set registry https://registry.npmmirror.com
# 换回官方源（https://registry.yarnpkg.com）
yarn config delete registry
# 查看当前源
yarn config get registry

# 查看缓存目录
yarn cache dir
```

注意，现在默认安装的还是 v1 的 `yarn`；从 2.0 开始有很大的改变：
不再提供 `yarn global` 相关的指令，也就是说全局包需要使用 `npm i -g` 来安装；
不再提供 `yarn create` 之类的指令，需要使用 `yarn dlx`。



# 配置 pnpm

```bash
# 安装 pnpm
npm i -g pnpm

# 换淘宝源
pnpm config set registry https://registry.npmmirror.com
# 换回官方源（https://registry.npmjs.org）
pnpm config delete registry
# 查看当前源
pnpm config get registry

# 查看缓存目录
pnpm store path
```



# 遇到 sass 等库安装失败

`node-sass` 容易出错，新项目建议换用 sass（也就是 dart-sass）。
如果是老项目没法换，以下方法选择一个即可：

**方法1：**

在项目根目录创建 `.npmrc` 文件，写入以下内容：

```ini
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
```

或者全局配置 npm 和 yarn：

```bash
npm config set sass-binary-site https://registry.npmmirror.com/node-sass
yarn config set sass-binary-site https://registry.npmmirror.com/node-sass
```



**方法2：**

使用 `cnpm` 来安装依赖：

```bash
# 全局安装 cnpm
npm i -g cnpm

# 用 cnpm 来安装依赖
cnpm i
```



# Git 相关

```bash
# 生成 SSH RSA 密钥（存储在用户目录下）
ssh-keygen -t rsa -b 4096 -C "git"

# 本地 SSH 密钥设置了密码，需要设置或去除密码
ssh-keygen -p

# 代码有多个远程仓库
git remote add <名称> <地址>

# 为一个仓库添加多个远程 url，自动向多个 url 推代码
git remote set-url --add <名称> <远程地址>
```



## 设置用户名和邮箱

```bash
# 配置用户名和邮箱
# 本项目：
git config user.name "username"
git config user.email "mail@domain.com"
# 全局：
git config --global user.name "username"
git config --global user.email "mail@domain.com"

# 查看用户名和邮箱
git config user.name
git config user.email
```



## 设置代理

```bash
# 给 Git 设置代理
git config --global http.proxy http://127.0.0.1:7890 
git config --global https.proxy http://127.0.0.1:7890

# 取消 Git 的代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```



## Windows 换行符问题

```bash
# Windows 克隆仓库行尾换行符一直是 CRLF
#（安装 Git 的时候有这个选项，可以直接设置好）
git config --global core.autocrlf false

# Windows 提交代码时自动转为 LF，但检出时不转换
#（安装 Git 的时候有这个选项，可以直接设置好）
git config --global core.autocrlf input
```



# macOS 常用命令

```bash
# 给 npm 全局包运行权限
sudo chown -R $USER /usr/local

# 使用代理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890

# 打开或编辑 hosts 文件
sudo vim /etc/hosts
```



# Windows 常用命令

```powershell
# 遇到 PowerShell 被禁用（管理员终端）
set-ExecutionPolicy RemoteSigned

# 开关虚拟化（管理员终端）
# 开启后可以使用 Hyper-V、WSL2，关闭虚拟化可以优化性能，一般不建议关闭
bcdedit /set hypervisorlaunchtype auto
bcdedit /set hypervisorlaunchtype off

# 刷新 DNS 缓存，可能会用到
ipconfig /flushdns

# 编辑 hosts，注意编码必须是 ANSI，不能使用 UTF-8 等格式
#（推荐使用 PowerToys 来管理 hosts）
notepad c:\windows\system32\drivers\etc\hosts

# 解除 Windows 系统对 FTP 传输速度的限制
netsh int tcp set global autotuninglevel=restricted
netsh interface tcp set heuristics disabled

# 修改终端编码为 UTF-8（默认是 GBK）
chcp 65001
# 修改回 GBK
chcp 936
```



## 端口占用问题

```bash
# 项目启动提示 3000 端口被占用
# 可以找到占用的进程的 PID：
netstat -ano | findstr "3000"

# 如果还找不到任何进程，依次执行（管理员终端）：
# WSL 用户请勿执行，会导致 WSL 无法联网，见下文
net stop winnat
net start winnat

# Windows 网络问题修复
# 也可以解决上面找不到占用端口进程的问题
# WSL 用户请勿执行，会导致 WSL 无法联网，见下文
netsh winsock reset
```

注意，上文中一部分指令标注了 “WSL 用户请勿执行” 的指令，如果执行了，请重启电脑，单纯重启 WSL 是仍然无法联网的。

WSL 用户遇到端口被占用，但是查不到进程时；或者是 Docker 用户遇到 `permission denied 0.0.0.0:3000` 这类端口问题时，参考以下解决方法：

Windows 系统存在一种 “TCP 动态端口范围” 的名词，这个范围内的端口号有时会被一些服务占用。Windows Vista 和以前的系统，这个范围是 `1025` - `5000`；之后的操作系统，这个范围是 `49152` - `65535`；我们现在用的都是 Windows 10、11，所以基本不再会受到这些影响了。

而且，如果启用了 Hyper-V，它也会保留一些随机端口号供 Windows 容器主机网络服务使用，它预留的端口号一般都很大，不太会对用户造成影响。**但是 Windows 自动更新有时会出错（万恶的自动更新），把 “TCP 动态端口范围” 起始端口被重置为 `1024`，导致 Hyper-V 在预留端口的时候占用了常用端口号，使得一些常用端口因为被预留而无法使用。**

查看当前的 “TCP 动态端口范围”：

```powershell
# 如果是 1024 开头，就是出现了上文中的问题
netsh int ipv4 show dynamicport tcp
```

解决方法：

```bash
netsh int ipv4 set dynamic tcp start=49152 num=16384
netsh int ipv6 set dynamic tcp start=49152 num=16384
```

执行后，请重新启动电脑。

此外，操作系统会保留一部分端口，这个指令可以查看哪些端口号被保留：

```bash
# 查看系统排除了哪些端口号
netsh interface ipv4 show excludedportrange protocol=tcp
```

