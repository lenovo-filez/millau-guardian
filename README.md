# <img src="public/icons/icon_48.png" width="45" align="left"> Chrome Extension

Filez millau guardian

## 功能：

- 开启灰度测试
- 创建被保护的分支
- 创建有配置命名空间的项目

## 开发

build: 构建最终build包

watch: 用于开发时加载到chrome-extension查看效果

start: 在本地以浏览器形式启项目，更方便开发

## 打包

```shell
npm run build 
```

## 配置
修改 `src/static/js/getdata.js` 中的 `baseUrl` 为你 millau 服务的地址，记得不要漏了后面的path：`/extension`
## 须知
打包前将manifest.json的version更新一个版本

到 chrome 扩展程序中进行扩展程序的的打包操作

将程序路径指向项目的build文件夹

密钥为根目录的`build.pem` 密钥

生成 crx 扩展文件，之后改名为millau_guardian_当前版本.zip

将chorme生成的crx文件修改为zip文件（很重要！！）

将文档和包更新到wiki的 https://wiki.lenovows.com/pages/viewpage.action?pageId=2033576 页面