import { openai } from "@ai-sdk/openai";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  CoreMessage,
  experimental_createMCPClient as createMCPClient,
  generateText,
} from "ai";
import dotenv from "dotenv";

let client: Awaited<ReturnType<typeof createMCPClient>>;

dotenv.config();

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL ?? "http://localhost:4001/sse";

// STEP 1: Initialize an MCP client to connect to the SSE MCP server
const connectToMcpServer = async (): Promise<
  | Promise<
      Awaited<ReturnType<Awaited<ReturnType<typeof createMCPClient>>["tools"]>>
    >
  | undefined
> => {
  try {
    console.log(`Connecting to MCP server at ${MCP_SERVER_URL}`);
    const transport = new SSEClientTransport(new URL(MCP_SERVER_URL));
    client = await createMCPClient({ transport });

    const tools = await client.tools();

    // List all available tools
    console.log("Available MCP Tools:");
    console.log(Object.keys(tools).join(", "));
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

  const messages: CoreMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant. After using tools, always provide a clear, conversational response explaining what you found.",
    },
    {
      role: "user",
      content: target,
    },
  ];

  try {
    let continueLoop = true;
    let stepCount = 0;
    const maxSteps = 5;

    while (continueLoop && stepCount < maxSteps) {
      stepCount++;
      console.log(`\n=== Step ${stepCount} ===`);

      const result = await generateText({
        model: openai("gpt-4o"),
        tools: tools,
        maxRetries: 3,
        messages,
      });

      const finishReason = result.finishReason;

      console.log(`\n[Finish reason: ${finishReason}]`);

      if (finishReason === "tool-calls") {
        // Add assistant's tool calls to messages
        const responseMetadata = result.response;
        messages.push(...responseMetadata.messages);
        console.log("Continuing after tool execution...");
      } else {
        // We got a final response
        continueLoop = false;
        console.log("\n\n=== Final AI Response ===");
        console.log(result.text);
      }
    }

    if (stepCount >= maxSteps) {
      console.log("\n⚠️  Reached max steps without final response");
    }
  } catch (error) {
    console.error("Error during AI generation:", error);
  } finally {
    console.log("\nClosing client");
    if (client) {
      await client.close();
    }
  }
}

async function main(): Promise<void> {
  await askAi(
    "what is the length of xxxxxxxxxxxxxx and tell me a joke about it"
  );
}

main();
