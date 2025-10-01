import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({
  name: "MyJSClient",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3001/mcp")
);

client.connect(transport);
