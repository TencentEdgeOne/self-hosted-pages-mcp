# Self-Hosted EdgeOne Pages MCP Server

A self-hosted MCP (Model Context Protocol) solution that enables AI assistants to deploy and manage your static websites directly. Simple setup, ready to use out of the box.

## One-Click Deploy

Click the button below to quickly deploy your MCP server on EdgeOne Pages:

[![Deploy with EdgeOne Pages](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?from=github&template=self-hosted-pages-mcp)

## Configure MCP Server

After deployment, add the following configuration to your MCP server config file:

```json
{
  "mcpServers": {
    "edgeone-pages": {
      "url": "https://your-custom-domain.com/mcp-server"
    }
  }
}
```

## Complete Setup

To get the service running properly, you'll also need to:

1. **Set up KV Storage**: For storing website files, [view setup guide](https://pages.edgeone.ai/document/kv-storage)
2. **Bind Custom Domain**: Get your dedicated access URL, [view binding guide](https://pages.edgeone.ai/document/custom-domain)

## Direct API Access

You can also deploy content directly via API:

```bash
curl -X POST https://your-custom-domain.com/kv/set \
  -H "Content-Type: application/json" \
  -d '{"value": "<html><body><h1>Hello, World!</h1></body></html>"}'
```
