---
title: Web 开发常用指令
date: 2021-08-18 16:43:00
tags:
- npm
- Cheatsheet
categories:
- DOC
---

# 使用 cnpm

``` bash
# 安装 cnpm
npm i -g cnpm --registry=https://registry.npmmirror.com

# 换淘宝源
npm config set registry https://registry.npmmirror.com
# 换回官方源
npm config set registry https://registry.yarnpkg.com
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
notepad c:\windows\system32\drivers\etc\hosts
```



# Windows 遇到 PowerShell 被禁用

```powershell
set-ExecutionPolicy RemoteSigned
```

