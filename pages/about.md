---
layout: page
title: About
description: 少摸鱼，多学习
keywords: about
comments: true
menu: 关于
permalink: /about/
---



少摸鱼，多学习。

博客内容是自己对学习内容的再整理，如果有错误请叫下我。

## 联系

<ul>
{% for website in site.data.social %}
<li>{{website.sitename }}：<a href="{{ website.url }}" target="_blank">@{{ website.name }}</a></li>
{% endfor %}
</ul>
<a href="https://www.flaticon.com/free-icons/magpie" title="magpie icons">Magpie icons created by bsd - Flaticon</a>

## Skill Keywords

{% for skill in site.data.skills %}
### {{ skill.name }}
<div class="btn-inline">
{% for keyword in skill.keywords %}
<button class="btn btn-outline" type="button">{{ keyword }}</button>
{% endfor %}
</div>
{% endfor %}
