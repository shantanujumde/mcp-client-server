import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { experimental_createMCPClient } from "ai";

type MCPClient = {
  tools: () => Promise<Record<string, { description?: string }>>;
  close: () => Promise<void>;
};

async function main() {
  console.log("Starting MCP consumer");
  let client: MCPClient | undefined;

  try {
    // Initialize an MCP client to connect to the SSE MCP server:
    const transport = new SSEClientTransport(
      new URL("http://localhost:4001/sse")
    );

    client = await experimental_createMCPClient({
      transport,
    });

    const tools = await client.tools();

    // List all available tools
    console.log("Available MCP Tools:");
    console.log("==================");

    if (Object.keys(tools).length === 0) {
      console.log("No tools available");
    } else {
      for (const [toolName, toolInfo] of Object.entries(tools)) {
        console.log(
          `• ${toolName}: ${toolInfo.description || "No description"}`
        );
      }
    }

    console.log("==================");
    console.log(`Total tools: ${Object.keys(tools).length}`);

    // Example usage - you can uncomment this to test a tool
    /*
    const response = await generateText({
      model: openai("gpt-4o"),
      tools,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is the length of 'Hello World'?" },
          ],
        },
      ],
    });

    console.log("AI Response:", response.text);
    */
  } catch (error) {
    console.error("Error:", error);
  } finally {
    console.log("Closing client");
    if (client) {
      await client.close();
    }
  }
}

main();
