import { openai } from "@ai-sdk/openai";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  experimental_createMCPClient as createMCPClient,
  generateText,
} from "ai";
import dotenv from "dotenv";

let client: Awaited<ReturnType<typeof createMCPClient>>;

dotenv.config();

async function initAndAskStringLength(target: string): Promise<void> {
  console.log("Starting MCP consumer");
  try {
    // STEP 1: Initialize an MCP client to connect to the SSE MCP server
    const transport = new SSEClientTransport(
      new URL("http://localhost:4001/sse")
    );
    client = await createMCPClient({ transport });

    const tools = await client.tools();

    // List all available tools
    console.log("Available MCP Tools:");
    console.log(JSON.stringify(tools, null, 2));
    console.log("==================");
    console.log(`Total tools: ${Object.keys(tools).length}`);

    // STEP 2: Ask the model to get the length of the provided string using the MCP tool
    const response = await generateText({
      model: openai("gpt-4o"),
      tools,
      toolChoice: "required",
      messages: [
        {
          role: "system",
          content:
            "Always use the MCP tool 'get_length' to compute the length of any provided string.",
        },
        {
          role: "user",
          content: `What is the length of '${target}'?`,
        },
      ],
    });

    console.log("AI Response:", response.text);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    console.log("Closing client");
    if (client) {
      await client.close();
    }
  }
}

async function main(): Promise<void> {
  await initAndAskStringLength("Hello World");
}

main();
