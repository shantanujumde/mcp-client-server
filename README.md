# MCP Server & Consumer

This workspace contains a minimal Model Context Protocol (MCP) server (`mcp-server`) and a companion consumer (`mcp-consumer`). The server exposes a simple `get_length` tool over Server-Sent Events (SSE). The consumer connects to the server, enumerates available tools, and calls the length tool through OpenAI's `gpt-4o` model using the `ai` SDK.

## Project Layout

- `mcp-server` – Express + MCP server that registers the `get_length` tool and serves an SSE endpoint on port `4001`.
- `mcp-consumer` – Node.js script that connects to the MCP server, lists the tools, and requests the length of `"Hello World"` via OpenAI.

## Prerequisites

- Node.js 22 or later (tested with Node 22).
- npm 10 or later (bundled with Node 22).
- An OpenAI API key with access to the `gpt-4o` model.

## Setup

1. Install dependencies for each package:

   ```bash
   cd mcp-server
   npm install

   cd ../mcp-consumer
   npm install
   ```

2. Create a `.env` file in `mcp-consumer/` with the required environment variables (see below).

## Environment Variables

Create `mcp-consumer/.env` containing the following key:

| Key              | Required | Description                                                            |
| ---------------- | -------- | ---------------------------------------------------------------------- |
| `OPENAI_API_KEY` | Yes      | OpenAI API key used by the consumer to call `gpt-4o` via the `ai` SDK. |

Optional overrides:

- `MCP_SERVER_URL` – Set to a custom SSE endpoint (defaults to `http://localhost:4001/sse`). If you use this variable, update `index.ts` accordingly.
- `PORT` – Change the HTTP port used by `mcp-server` (defaults to `4001`). Update the consumer to match if you change it.

## Running the Server

From `mcp-server/`:

- `npm run dev` – Start the MCP server with `nodemon` (auto-restarts on file changes).
- `npm run build` – Compile TypeScript to `dist/`.
- `npm start` – Run the built server from `dist/index.js`.

The server logs the listening URL and exposes:

- SSE endpoint: `http://localhost:4001/sse`
- Message relay endpoint: `http://localhost:4001/messages`

## Running the Consumer

From `mcp-consumer/`:

- `npm run dev` – Start the consumer with `ts-node` and `nodemon`.
- `npm run build` – Compile TypeScript to `dist/`.
- `npm start` – Run the compiled consumer.

When the consumer runs it:

1. Connects to the SSE endpoint.
2. Lists available MCP tools in the console.
3. Uses `gpt-4o` to call the `get_length` tool and prints the tool output.
4. Closes the MCP client gracefully.

## Development Notes

- TypeScript configs in each package emit CommonJS output under `dist/`.
- The server currently registers a single tool. Add additional tools via `server.tool(...)` in `mcp-server/index.ts`.
- The consumer invokes `generateText` with `toolChoice: "required"`, forcing the model to use MCP tools for each request.

## Troubleshooting

- **Connection errors** – Ensure the server is running on `http://localhost:4001` before starting the consumer.
- **401/403 responses** – Verify `OPENAI_API_KEY` is present and valid.
- **Model mismatch** – Adjust the model name in `mcp-consumer/index.ts` if your key does not support `gpt-4o`.
