/**
 * index.js
 * This file is the main entrypoint for the application.
 * It handles communication with the Anthropic API and processes responses.
 * @author  AgentVoiceResponse
 * @see https://www.agentvoiceresponse.com
 */
const express = require("express");
const { Anthropic } = require("@anthropic-ai/sdk");
const { loadTools, getToolHandler } = require("./loadTools");

require("dotenv").config();

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * Handles a prompt stream from the client and uses the Anthropic API to generate
 * a response stream. The response stream is sent back to the client as a
 * series of Server-Sent Events.
 *
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 */
const handlePromptStream = async (req, res) => {
  const { uuid, messages } = req.body;

  // Validate required input
  if (!messages) {
    return res.status(400).json({ message: "Messages is required" });
  }

  // Set up SSE headers for streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Load available tools for the AI to use
    const tools = loadTools();
    console.log(`Loaded ${tools.length} tools for Anthropic`);

    anthropic.messages
      .stream({
        model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
        max_tokens: +process.env.ANTHROPIC_MAX_TOKENS || 1024,
        temperature: +process.env.ANTHROPIC_TEMPERATURE || 1,
        system:
          process.env.ANTHROPIC_SYSTEM_PROMPT || "You are a helpful assistant.",
        messages,
        tools,
      })
      .on("text", (text) => {
        res.write(JSON.stringify({ type: "text", content: text }));
      })
      .on("contentBlock", async (contentItem) => {
        if (contentItem.type === "tool_use") {
          try {
            const handler = getToolHandler(contentItem.name);
            if (!handler) {
              console.error(`No handler found for tool: ${contentItem.name}`);
              res.write(
                JSON.stringify({
                  type: "text",
                  content: `I'm sorry, I cannot retrieve the requested information.`,
                })
              );
            } else {
              console.log(
                `>> Tool call: ${contentItem.name}`,
                contentItem.input
              );
              const content = await handler(uuid, contentItem.input);
              console.log(`>> Tool response: ${contentItem.name} ->`, content);
              res.write(JSON.stringify({ type: "text", content }));
            }
          } catch (toolError) {
            console.error(
              `Error executing tool ${contentItem.name}:`,
              toolError
            );
            res.write(
              JSON.stringify({
                type: "text",
                content: `I'm sorry, I cannot retrieve the requested information.`,
              })
            );
          }
        } else if (contentItem.type === "text") {
          console.log(">> AI response:", contentItem.text);
        }        
      })
      .on("message", (message) => {
        console.log(">> AI message:", message);
        console.log(">> AI END");
        res.end();
      });
  } catch (error) {
    console.error("Error calling Anthropic API:", error.message);
    res.status(500).json({ message: "Error communicating with Anthropic API" });
  }
};

// Register the prompt-stream endpoint
app.post("/prompt-stream", handlePromptStream);

// Start the server
const port = process.env.PORT || 6014;
app.listen(port, () => {
  console.log(`Anthropic API server listening on port ${port}`);
});
