import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import z from "zod";

// Create server instance
const server = new McpServer({
  name: "length",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Track active SSE transports by session ID for routing POST messages
const transportsBySessionId = new Map<string, SSEServerTransport>();

server.tool(
  "get_length",
  "Get length of a string",
  {
    state: z.string().describe("The string to get the length of"),
  },
  async ({ state }) => {
    const length = state.length;
    console.log(`The length of the string is ${length}`);

    return {
      content: [
        { type: "text", text: `The length of the string is ${length}` },
      ],
    };
  }
);

async function main() {
  const app = express();
  const PORT = 4001;
  // Parse JSON payloads for POST message handling
  app.use(express.json());

  // Legacy SSE endpoint: establish SSE connection and register transport by session
  app.get("/sse", async (req, res) => {
    // The path here is the POST endpoint used for client->server messages
    const transport = new SSEServerTransport("/messages", res);
    transportsBySessionId.set(transport.sessionId, transport);
    res.on("close", () => {
      transportsBySessionId.delete(transport.sessionId);
    });
    await server.connect(transport);
  });

  // Legacy messages endpoint: route POST to the existing SSE transport
  app.post("/messages", async (req, res) => {
    const sessionId = (req.query.sessionId as string) || "";
    const transport = transportsBySessionId.get(sessionId);
    if (!transport) {
      res.status(400).send("No transport found for sessionId");
      return;
    }
    await transport.handlePostMessage(req, res, req.body);
  });

  app.listen(PORT, () => {
    console.log(`Length MCP Server running on http://localhost:${PORT}`);
    console.log(`SSE endpoint available at http://localhost:${PORT}/sse`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
