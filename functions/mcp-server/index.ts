import { deployHtmlToKv } from "../kv/set";
import { KV_ERROR_MESSAGE, isKvError } from "../shared/constants";

export async function deployHtml(value: string, baseUrl: string) {
  // Use the shared deployment logic from kv/set.ts
  return await deployHtmlToKv(value, baseUrl);
}

const handleApiError = (error: any) => {
  console.error("API Error:", error);

  // Check if it's a KV-related error
  if (isKvError(error) || error.message?.includes(KV_ERROR_MESSAGE)) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${KV_ERROR_MESSAGE}`,
        },
      ],
      isError: true,
    };
  }

  const errorMessage = error.message || "Unknown error occurred";
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${errorMessage}`,
      },
    ],
    isError: true,
  };
};

// Handle initialization request
const handleInitialize = (id: string) => {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: "2024-11-05",
      serverInfo: {
        name: "edgeone-pages-deploy-mcp-server",
        version: "1.0.0",
      },
      capabilities: {
        tools: {},
      },
    },
  };
};

// Handle tools list request
const handleToolsList = (id: string) => {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      tools: [
        {
          name: "deploy_html",
          description:
            "Deploy HTML content to EdgeOne Pages, return the public URL",
          inputSchema: {
            type: "object",
            properties: {
              value: {
                type: "string",
                description:
                  "HTML or text content to deploy. Provide complete HTML or text content you want to publish, and the system will return a public URL where your content can be accessed.",
              },
            },
            required: ["value"],
          },
        },
      ],
    },
  };
};

// Handle deploy HTML request
const handleDeployHtml = async (id: string, params: any, request: any) => {
  try {
    const value = params.arguments?.value;

    if (!value) {
      throw new Error("Missing required argument: value");
    }

    // Get baseUrl from the request
    const url = new URL(request.url);
    const baseUrl = url.protocol + "//" + url.host;

    const result = await deployHtml(value, baseUrl);

    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      },
    };
  } catch (e: any) {
    const error = handleApiError(e);
    return {
      jsonrpc: "2.0",
      id,
      result: error,
    };
  }
};

// Handle resources or prompts list request
const handleResourcesOrPromptsList = (id: string, method: string) => {
  const resultKey = method.split("/")[0];
  return {
    jsonrpc: "2.0",
    id,
    result: {
      [resultKey]: [],
    },
  };
};

// Handle unknown method
const handleUnknownMethod = (id: string) => {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: "Method not found",
    },
  };
};

// Handle streaming request
const handleStreamingRequest = () => {
  return new Response("Not implemented", { status: 405 });
};

// Handle CORS preflight request
const handleCorsRequest = () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
};

// Process JSON-RPC request
const processJsonRpcRequest = async (body: any, request: any) => {
  if (body.method === "initialize") {
    return handleInitialize(body.id);
  }

  if (body.method === "tools/list") {
    return handleToolsList(body.id);
  }

  if (body.method === "tools/call" && body.params?.name === "deploy_html") {
    return await handleDeployHtml(body.id, body.params, request);
  }

  if (body.method === "resources/list" || body.method === "prompts/list") {
    return handleResourcesOrPromptsList(body.id, body.method);
  }

  return handleUnknownMethod(body.id);
};

export const onRequest = async ({ request }: { request: any }) => {
  const method = request.method.toUpperCase();

  try {
    // Handle SSE streaming requests
    if (
      method === "GET" &&
      request.headers.get("accept")?.includes("text/event-stream")
    ) {
      return handleStreamingRequest();
    }

    // Handle JSON-RPC requests
    if (method === "POST") {
      const contentType = request.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return new Response("Unsupported Media Type", { status: 415 });
      }

      const body = await request.json();
      const responseData = await processJsonRpcRequest(body, request);

      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Handle CORS preflight requests
    if (method === "OPTIONS") {
      return handleCorsRequest();
    }

    // Method not allowed
    return new Response("Method Not Allowed", { status: 405 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "Internal server error",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
