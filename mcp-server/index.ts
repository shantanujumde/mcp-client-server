import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { serve } from "bun";

const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
  description: "A simple MCP server",
});

server.registerTool(
  "weather",
  {
    title: "Weather Tool",
    description: "Get the weather for a given location",
  },
  async () => ({
    content: [{ type: "text", text: "The weather is sunny" }],
  })
);

serve({
  port: 3001,
  // `routes` requires Bun v1.2.3+
  routes: {
    "/mcp": async (req: Request, server: any) => {
      // In stateless mode, create a new instance of transport and server for each request
      // to ensure complete isolation. A single instance would cause request ID collisions
      // when multiple clients connect concurrently.

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      // ensure cleanup on disconnect
      const cleanup = () => {
        try {
          transport.close();
        } catch {}
        try {
          server.close();
        } catch {}
      };
      if (req.signal.aborted) cleanup();
      else req.signal.addEventListener("abort", cleanup, { once: true });

      try {
        await server.connect(transport);

        // If your transport exposes a fetch-style handler that returns a Response:
        // e.g. handle(req) or handleFetch(req)
        // Replace with the actual method name your SDK provides.
        // @ts-expect-error adjust for your SDK
        await transport.handle(req);
        return new Response("OK");
      } catch (error) {
        console.error("Error handling MCP request:", error);
        cleanup();

        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null,
          }),
          { status: 500, headers: { "content-type": "application/json" } }
        );
      }
    },

    "/api/status": () => {
      console.log("status");
      return new Response("OK");
    },
  },
});
