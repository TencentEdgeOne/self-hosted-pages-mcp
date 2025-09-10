# 自部署 EdgeOne Pages MCP 服务器

一个基于 MCP 协议的自部署解决方案，让 AI 助手能够直接部署和管理您的静态网站。无需复杂配置，开箱即用。

## 一键部署

点击下方按钮，即可在 EdgeOne Pages 上快速部署您的 MCP 服务器：

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?from=github&template=self-hosted-pages-mcp)

## 配置 MCP 服务

部署完成后，在您的 MCP Server 配置文件中添加以下配置：

```json
{
  "mcpServers": {
    "edgeone-pages": {
      "url": "https://你的自定义域名.com/mcp-server"
    }
  }
}
```

## 完成配置

为了让服务正常工作，您还需要：

1. **配置 KV 存储**：用于存储网站文件，[查看配置指南](https://pages.edgeone.ai/document/kv-storage)
2. **绑定自定义域名**：获得专属访问地址，[查看绑定指南](https://pages.edgeone.ai/document/custom-domain)

## 直接 API 调用

您也可以通过 API 直接部署内容：

```bash
curl -X POST https://你的自定义域名.com/kv/set \
  -H "Content-Type: application/json" \
  -d '{"value": "<html><body><h1>Hello, World!</h1></body></html>"}'
```
