import { openai } from "@ai-sdk/openai";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import { experimental_createMCPClient, generateText, stepCountIs } from "ai";

async function main() {
  let client;

  try {
    // Initialize an MCP client to connect to the stdio MCP server:
    const transport = new StdioClientTransport({
      command: "node",
      args: ["../mcp-server/dist/index.js"],
    });

    client = await experimental_createMCPClient({
      transport,
    });

    const tools = await client.tools();

    const response = await generateText({
      model: openai("gpt-4o"),
      tools,
      stopWhen: stepCountIs(5),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is the length of 'Hello World'?" },
          ],
        },
      ],
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main();
