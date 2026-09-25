#!/bin/bash
# 双击这个文件即可启动 Carousel Studio，并自动打开浏览器。关闭这个终端窗口就会停止服务。
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
( sleep 4; open "http://localhost:3456" ) &
npm run dev
