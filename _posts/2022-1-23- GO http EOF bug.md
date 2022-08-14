---
layout: post
title: GO http post unexpected EOF问题的解决方案
date: 2022-1-23 9:00:00 +0900
description: GO http post EOF问题的解决方案
img: post-1.jpg # Add image post (optional)
tags: [solution]
essays: true  
---

GO http post unexpected EOF问题的解决方案

# 解决方案

## req.Close = true

```go
req, err := http.NewRequest("POST", url, formBytesReader)
req.Close = true
```

## go 1.16

将项目的GO版本提升至1.16

# 原理

GO的post默认携带header`Connection: Keep-Alive`，保持链接存活，然后复用链接进行下一次的请求，然而此时如果服务端关闭了链接，GO的下一次请求，读取body的时候就会报一个EOF的错。

`req.Close = true`让链接在每次使用后直接关闭，阻止复用。

>Go by default will send requests with the header `Connection: Keep-Alive` and persist connections for re-use. The problem that I ran into is that the server is responding with `Connection: Keep-Alive` in the response header and then immediately closing the connection.
>
>As a little background as to how go implements connections in this case (you can look at the full code in net/http/transport.go). There are two goroutines, one responsible for writing and one responsible for reading (`readLoop` and `writeLoop`) In most circumstances `readLoop` will detect a close on the socket, and close down the connection. The problem here occurs when you initiate another request before the readLoop actually detects the close, and the EOF that it reads get interpreted as an error for that new request rather than a close that occurred prior to the request.
>
>Given that this is the case the reason why sleeping in between requests works is that it gives readLoop time to detect the close on the connection before your new request and shut it down, so that your new request will initiate a new connection. (And the reason why it would intermittently fail is because there is some amount code running between your requests and depending of scheduling of goroutines, sometimes the EOF will be properly handled before your next request, sometimes not). And the `req.Close = true`, solution works because it prevents the connection from being re-used.

然而我的项目中还是会报错，查了查，好像GO 1.16修复了这个bug。

> net/http: retry idempotent HTTP reqs on dead reused conns 
>
> If we try to reuse a connection that the server is in the process of closing, we may end up successfully writing out our request (or a portion of our request) only to find a connection error when we try to read from (or finish writing to) the socket. This manifests as an EOF returned from the Transport's RoundTrip. 
>
> The issue, among others, is described in [#4677](https://golang.org/issue/4677). 
>
> This change follows some of the Chromium guidelines for retrying idempotent requests only when the connection has been already been used successfully and no header data has yet been received for the response.
>
>  As part of this change, an unexported error was defined for errMissingHost, which was previously defined inline. errMissingHost is the only non-network error returned from a Request's Write() method. 
>
> Additionally, this breaks TestLinuxSendfile because its test server explicitly triggers the type of scenario this change is meant to retry on. Because that test server stops accepting conns on the test listener before the retry, the test would time out. To fix this, the test was altered to use a non-idempotent test type (POST). 

在GO升级到1.16后解决。

# reference

## stackoverflow

[Golang HTTP Concurrent Requests POST EOF](https://stackoverflow.com/questions/28046100/golang-http-concurrent-requests-post-eof)

## github issue

[net/http: Client does not retry idempotent requests on transport failure #4677](https://github.com/golang/go/issues/4677)

[net/http: Consecutive Get requests in quick succession sometimes fail when remote server closes connection after responding with keep-alive #8122](https://github.com/golang/go/issues/8122)

## go-review

[3210: net/http: retry idempotent HTTP reqs on dead reused conns](https://go-review.googlesource.com/c/go/+/3210)