import { openai } from "@ai-sdk/openai";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  experimental_createMCPClient as createMCPClient,
  generateText,
} from "ai";
import dotenv from "dotenv";

let client: Awaited<ReturnType<typeof createMCPClient>>;

dotenv.config();

// STEP 1: Initialize an MCP client to connect to the SSE MCP server
const connectToMcpServer = async (): Promise<
  | Promise<
      Awaited<ReturnType<Awaited<ReturnType<typeof createMCPClient>>["tools"]>>
    >
  | undefined
> => {
  try {
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

    return tools;
  } catch (error) {
    console.error("Error connecting to MCP server:", error);
  }
  return undefined;
};

// STEP 2: Ask the model to get the length of the provided string using the MCP tool
async function askAi(target: string): Promise<void> {
  console.log("Starting MCP consumer");

  const tools = await connectToMcpServer();

  if (!tools) {
    console.error("No MCP tools available; cannot proceed.");
    return;
  }

  try {
    const response = await generateText({
      model: openai("gpt-4o"),
      tools,
      toolChoice: "required",
      messages: [
        {
          role: "system",
          content:
            "Always use the available MCP tools for the queries asked by the users. And provide the answer in a descriptive format.",
        },
        {
          role: "user",
          content: target,
        },
      ],
    });

    console.log("AI Response:", response.text);
  } catch (error) {
    console.error("Error during AI generation:", error);
  } finally {
    console.log("Closing client");
    if (client) {
      await client.close();
    }
  }
}

async function main(): Promise<void> {
  await askAi("What is the length of 'Hello World'?");
}

main();
