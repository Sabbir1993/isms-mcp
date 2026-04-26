import "dotenv/config";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    server: "isms-integration-assistant",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.post("/mcp", async (req, res) => {
  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  res.on("close", () => {
    transport.close();
    mcpServer.close();
  });

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp",    (_req, res) => res.status(405).json({ error: "Use POST for MCP requests" }));
app.delete("/mcp", (_req, res) => res.status(405).json({ error: "Stateless mode — no session to delete" }));

app.listen(PORT, () => {
  console.log(`[isms-mcp] ISMSPLUS Integration Assistant running on http://localhost:${PORT}`);
  console.log(`[isms-mcp] MCP endpoint : http://localhost:${PORT}/mcp`);
  console.log(`[isms-mcp] Health check : http://localhost:${PORT}/health`);
});
