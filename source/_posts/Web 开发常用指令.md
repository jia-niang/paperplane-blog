---
title: Web 开发常用指令
date: 2021-08-18 16:43:00
tags:
- npm
- Cheatsheet
categories:
- DOC
---

# 使用 npm

``` bash
# 换淘宝源
npm config set registry https://registry.npmmirror.com
# 换回官方源
npm config set registry https://registry.npmjs.org
# 查看当前源
npm config get registry
```



# 使用 Yarn

```bash
# 安装 yarn
npm i -g yarn

# 换淘宝源
yarn config set registry https://registry.npmmirror.com
# 换回官方源
yarn config set registry https://registry.yarnpkg.com
# 查看当前源
yarn config get registry
```



# 遇到 sass 等库安装失败

``` bash
# 推荐：
# 在项目根目录创建 .npmrc 文件，写入以下内容：
# sass_binary_site=https://npmmirror.com/mirrors/node-sass/
echo "sass_binary_site=https://npmmirror.com/mirrors/node-sass/" >> .npmrc

# 或者用 cnpm 安装：
cnpm i sass

# 也可以这样全局设置：
# npm
npm config set sass-binary-site https://registry.npmmirror.com/node-sass
# yarn
yarn config set sass-binary-site https://registry.npmmirror.com/node-sass

```



# Git 相关

```bash
# 生成 SSH RSA 密钥（存储在用户目录下）
ssh-keygen -t rsa -b 4096 -C "git"

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

# 代码有多个远程仓库
git remote add 名称 地址

# 为一个远程仓库添加多个 url
git remote set-url --add 名称 地址

# 给 Git 设置代理
git config --global http.proxy http://127.0.0.1:7890 
git config --global https.proxy http://127.0.0.1:7890

# 取消 Git 的代理
git config --global --unset http.proxy
git config --global --unset https.proxy

# Windows 克隆仓库行尾换行符一直是 CRLF
git config --global core.autocrlf false

# Windows 提交代码时自动转为 LF，但检出时不转换
git config --global core.autocrlf input

# 本地 SSH 设置密码，需要去除密码
ssh-keygen -p
```



# 其他常用指令

```bash
# macOS 给 npm 全局包运行权限
sudo chown -R $USER /usr/local

# 使用代理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890

# 打开或编辑 hosts 文件
# macOS
sudo vim /etc/hosts
# Windows
# 注意编码必须是 ANSI，不能使用 UTF-8 等
notepad c:\windows\system32\drivers\etc\hosts
```



# Windows 疑难问题

```powershell
# 遇到 PowerShell 被禁用（管理员终端）
set-ExecutionPolicy RemoteSigned

# 项目启动提示 3000 端口被占用
# 可以找到占用的进程的 PID：
netstat -ano | findstr "3000"

# 如果还找不到任何进程，依次执行（管理员终端）：
net stop winnat
net start winnat

# Windows 网络问题修复
# 也可以解决上面找不到占用端口进程的问题
netsh winsock reset

# 刷新 DNS 缓存，可能会用到
ipconfig /flushdns

# 开关虚拟化（管理员终端）
# 开启虚拟化，可以使用 HyperV、WSL2，关闭虚拟化可以优化性能、运行 XTU
bcdedit /set hypervisorlaunchtype auto
bcdedit /set hypervisorlaunchtype off
```
