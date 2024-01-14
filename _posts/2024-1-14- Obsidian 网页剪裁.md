---
layout: post
title: Obsidian 网页剪裁解决方案
date: 2024-1-14 9:00:00 +0900
categories: [Obsidian, solution]
description: 我将笔记从印象笔记迁移至 Obsidian 后已经一段时间了，使用体验良好。但印象笔记的网页剪裁功能十分便利，我迁移完成后没有来得及找到替代品。
keywords: solution, Obsidian
essays: true 
---

# 前言

我将笔记从印象笔记迁移至 Obsidian 后已经一段时间了，使用体验良好。但印象笔记的网页剪裁功能十分便利，我迁移完成后没有来得及找到替代品。

这是在我进行搜索，尝试后，得到的最佳解决方案。

# 问题描述

网页浏览时，可以一键将选中的网页内容裁剪，自动新建笔记，收集。

对应使用体验就是 印象笔记 网络裁剪 浏览器插件。

# 解决方案

Markdownload 浏览器插件 -> Obsidian 社区插件 Advanced Obsidian URI（Local Images Plus 可选） -> 新建笔记

Markdownload 是一个简单用于将网页保存为 md 文件的插件，开始时并不是专门为 Obsidian 开发。之后为了 Obsidian 进行了额外的开发，适配。Advanced Obsidian URI 是一个社区插件，通过打开一些 URI 来控制 Obsidian 中的许多不同功能，经常用于自定义用户自己的自动化工作流程。

这也是一个低耦合的两个部件组合为一个新功能的实际案例。

## 1. 浏览器 Markdownload 插件

从你的浏览器的插件商店获取 Markdownload 插件并启用。

我的浏览器是 edge，其他浏览器需要你根据自己情况进行调整。

![Markdownload](/images/Obsidian/1705202078074.png)

对 Markdownload 按自己需要进行配置

- 配置存放裁剪内容的 Vault

![Markdownload](/images/Obsidian/1705203677631.png)

- 配置存放裁剪内容的文件夹名称
  - 开启 Obsidian 集成开关
  - 保证在 Obsidian 中存在对应的 Valut
  - 我按照时间建立文件夹进行分类，插件作者在配置页面提供了其他的替换占位符，可以根据自己的需要进行配置使用。

![Markdownload](/images/Obsidian/1705204155676.png)

- 配置笔记 template（可选）

按需调整模板，同样是利用占位符，默认的模板信息对我已经足够

![Markdownload](/images/Obsidian/1705205326212.png)

- 配置插件快捷键（可选）

![Markdownload](/images/Obsidian/1705205169683.png)

## 2. Obsidian Advanced Obsidian URI 插件

从 Obsidian 社区插件商店获取 Advanced Obsidian URI 插件，安装，启用，即可。

![Advanced Obsidian URI](/images/Obsidian/1705202043053.png)

## 3. Obsidian Local Images Plus 插件

将网络剪裁中的图片文件自动转化为本地图片文件，永久保存。直接裁剪笔记中的图片仍然是网络外链的形式，如果在服务器上失效，本地也会失效。

![Advanced Obsidian URI](/images/Obsidian/1705204560268.png)

# reference

[MarkDownload  github]([deathau/markdownload: A Firefox and Google Chrome extension to clip websites and download them into a readable markdown file. (github.com)](https://github.com/deathau/markdownload?tab=readme-ov-file))

Markdownload 插件的 github 地址，有不同浏览器对应的下载地址

[MarkDownload - Markdown Web Clipper](https://forum.obsidian.md/t/markdownload-markdown-web-clipper/173)
[Configuring the Web Clipper MarkDownload for a seamless workflow with Obsidian](https://forum.obsidian.md/t/configuring-the-web-clipper-markdownload-for-a-seamless-workflow-with-obsidian/62441/1)

两个社区讨论串，如果遇到问题可以尝试来这里找答案。
