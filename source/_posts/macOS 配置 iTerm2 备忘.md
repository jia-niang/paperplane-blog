---
title: macOS 配置 iTerm2 备忘
date: 2022-05-03 19:00:00
tags: 
- DOC
categories: 
- DOC
no_toc: true
---

记录 macOS 配置 iTerm2 相关过程。本文的 iTerm2 和 zsh 配置部分，参考了 [这篇博文](https://pjchender.blogspot.com/2017/02/mac-terminal-iterm-2-oh-my-zsh.html)；命令行前缀定制部分，参考了 [这篇博文](https://github.com/solomonxie/blog-in-the-issues/issues/27)。



# 安装 Homebrew

[Homebrew](https://brew.sh/zh-cn/) 是 macOS 必备的软件包管理工具，类似于 apt-get。

安装命令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

如果你访问 GitHub 不畅通，也可以试试使用国内的镜像源，例如 [清华镜像源](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/)、[南大镜像源](https://mirror.nju.edu.cn/) 等。

安装完成后，通过以下指令确定是否成功：

```bash
brew --version
```



# 安装 iTrem2

[iTerm2](https://iterm2.com/) 就是本文的主体了，它可能是 macOS 上最好用的终端。

可以通过官网下载页面进行安装（推荐）；
或者通过 Homebrew 安装，执行以下指令（不推荐）：

```bash
brew install --cask iterm2
```



# 配色主题

安装完成后，我们可以为自己的终端挑选一套配色。
按下 `⌘` + `,` 组合键，打开首选项，选择 “Profiles” 选项卡，此页面记录着终端的各种配置，我们跳转到 “Colors” 配色方案页面。

![](../images/image-20240621171402866.png)

这个页面可以用于调节终端的配色主题，右下角那个菜单可以让我们导入/导出配置文件：

![](../images/image-20240621173529793.png)

其中预设的几种配色，我觉得都不满意。
可以通过这个网站从别人设计好的配色中挑选一套：https://iterm2colorschemes.com/ ，找到满意的配色后下载其配置文件。

我个人选用的是 [Blazer](https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/schemes/Blazer.itermcolors) 主题，下载其 .itermcolors 后缀的配置文件，存储在电脑上，然后从右下角那个 “Color Presets...” 中导入它并使用。

这个界面中，“Basic Colors” 可以指定终端背景颜色、粗体文字颜色、链接文字颜色、已选择文字颜色等，我的最终设置如图，其中设置了背景颜色 `0e2132`。

-----

修改了配色后，还可以对窗口进行定制化，切换到 “Windows” 选项卡，如图：

![](../images/image-20240621172044480.png)

图中是我自己的配置，我开启了窗口的半透明，并调整了 15% 透明度以及 10% 背景模糊，设置了新窗口的大小，还可以自定义窗口标题。



# 安装和配置 oh-my-zsh

现在的 macOS 默认就是使用 [zsh](https://www.zsh.org/)，我们只需要安装相关插件即可。
zsh 功能强大，配置多样，一般使用 [oh-my-zsh](https://ohmyz.sh/) 这个工具来管理其配置项。

对 oh-my-zsh 的第一个配置，就是更换主题，我使用名为 “agnoster” 的主题，它提供了对 Git 的更好的支持，只要终端位于 Git 目录中，便可以显示出便于阅读的符号。

安装 oh-my-zsh，执行以下命令：

```bash
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

然后，编辑 zsh 的配置文件：

```bash
open ~/.zshrc
```

找到以 “`ZSH_THEME`” 开头的内容，修改为：

```bash
ZSH_THEME="agnoster"
```

最后重新加载 zsh 配置即可：

```bash
source ~/.zshrc
```

配置此主题后，进入 Git 目录，或者是我们的指令运行成功 or 失败，都会以 icon 的形式显示在终端中。
不过，这通常要配合特定的字体，下文中会有讲到，请继续完成配置。



# oh-my-zsh 安装插件

我们还要安装两个插件：

- [zsh-completions](https://github.com/zsh-users/zsh-completions)（补全），这个插件可以为我们提供命令补全功能，提高效率；
- [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)（建议），它可以提供历史命令提示，让频繁使用的指令可以瞬间完成。

你可以阅读其官方文档寻找安装方式。
以下给出我使用的安装步骤：

运行以下指令，把插件代码克隆到 zsh 的插件目录下：

```bash
git clone git://github.com/zsh-users/zsh-completions $ZSH_CUSTOM/plugins/zsh-completions
git clone git://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```

然后，编辑 zsh 的配置文件：

```bash
open ~/.zshrc
```

找到 “`plugins=(...)`” 格式的插件配置，把这些插件添加进去：

```
plugins=(gits zsh-autosuggestions)
```

这里不需要添加 zsh-completions 到插件列表里，而是另外配置：找到 “`source "$ZSH/oh-my-zsh.sh"`” 这一行语句，然后在这一行语句之前，插入以下内容：

```
fpath+=${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-completions/src
```

最后重新加载 zsh 配置即可生效：

```bash
source ~/.zshrc
```

<br />

此外，自动建议插件提供的历史指令显示太过于暗淡，如果你的终端背景颜色比较深，那么文字可能很难看清；
通过以下指令打开自动建议插件的配置文件：

```bash
open -a TextEdit $ZSH_CUSTOM/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
```

在其最后一行之前，插入以下内容：

```
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=242'
```

其中的 “`fg=242`” 这个数字可以随便调，最高 `255`，数值越大文字便越亮。

-----

自动输入建议插件的使用方式为，只要你输入了一段历史输入过的命令的前半段，就会在后面用暗淡的颜色帮你补全完整的命令，使用方向键 `→` 快速输入：

![](../images/image-20240621191904523.png)

<br />

自动补全插件的使用方式为，只要你输入了指令，按下 `Tab` 键就会列出一个列表，表示可以使用的建议项目，具体而言：如果你的目录没打完，按下 `Tab` 会列出可用的目录；如果你的参数没打完，先打出一个横杠 `-` 并按下 `Tab`，则会列出所有可用的参数：

![补全参数](../images/image-20240621192223452.png)

![补全输入](../images/image-20240621192306380.png)



# 字体修改

默认的字体的 “功能性” 不强，所以一般会换用专为终端设计的字体，这是一种名为 “Powerline” 类型的字体，它能提供更好的显示。

可以在 [这个仓库](https://github.com/powerline/fonts) 中找到 Powerline 字体。
我使用 “Meslo LG L DZ for Powerline” 这一款字体，在这个仓库的 [这个目录](https://github.com/powerline/fonts/tree/master/Meslo%20Dotted) 中可以找到它的字体文件，下载后可以在系统中直接安装。

切换到 “Profiles / Texts” 选项卡，在此页面对字体进行配置，如下图：

![](../images/image-20240621172837443.png)

这张图中的配置比较重要，配置时请尽量完全匹配。

配置完成后，将终端进入到一个 Git 仓库中，应该显示成这样：

![](../images/image-20240621173221976.png)

可以看出，命令行标记、目录、Git 分支之间，使用了一种箭头形状的比背景，看起来非常清晰。

未提交的 Git 仓库：

![](../images/image-20240621173125181.png)

未提交的 Git 仓库，其分支名会变为黄色，还会有提交变更的 icon。

执行失败的指令，最左侧会出现一个叉号：

![](../images/image-20240621190848219.png)

如果上面都能如图正常显示，则表示配置正确。
这个箭头形状的符号，就是 “Powerline glyphs”，也就是上面的 “Use built-in Powerline glyphs” 配置项，必须开启它。

如果你对字号、间距等不满意，也可以在这个页面调整。



# 修改命令行前缀

你可能已经看到了，我的命令行前缀不是自己的用户名，而是一个苹果标志 “``”，实际上 zsh 可以自行定制命令行前缀的显示，甚至可以修改目录的显示方式，做到只显示最尾部的目录名。

此处给出我的做法：
首先编辑配置文件：

```bash
open -a TextEdit ~/.oh-my-zsh/themes/agnoster.zsh-theme
```

然后，全局搜索以下内容：

```
# Context: user@hostname (who am I and where am I)
```

找到对应代码 `if` 语句内的语句，原始是这样的：

```
prompt_segment black default "%(!.%{%F{yellow}%}.)%n@%m"
```

我们将它注释掉，自己添加一条：

```
prompt_segment black default ""
```

这样就完成了，执行以下命令接受：

```bash
source ~/.zshrc
```

