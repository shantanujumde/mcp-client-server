import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Length MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
