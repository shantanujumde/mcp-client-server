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

server.tool(
  "get_length",
  "Get length of a string",
  {
    state: z.string().describe("The string to get the length of"),
  },
  async ({ state }) => {
    const length = state.length;

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

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/sse", res);
    await server.connect(transport);
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
