# Agent Voice Response - Anthropic Integration

This repository showcases the integration between **Agent Voice Response** and **Anthropic's Claude AI**. The application leverages Anthropic's powerful language models to process text input from users, providing intelligent, context-aware responses that enhance the virtual agent's capabilities.

## Prerequisites

To set up and run this project, you will need:

1. **Node.js** and **npm** installed.
2. An **Anthropic API key**.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/agentvoiceresponse/avr-llm-anthropic.git
cd avr-llm-anthropic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project to store your API keys and configuration. You will need to add the following variables:

```bash
PORT=6014
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-haiku-20240307
ANTHROPIC_MAX_TOKENS=1024
ANTHROPIC_TEMPERATURE=1
ANTHROPIC_SYSTEM_PROMPT="You are a helpful assistant."
```

Replace `your_anthropic_api_key` with your actual Anthropic API key.

### 4. Running the Application

Start the application by running the following command:

```bash
npm start
```

The server will start on the port defined in the environment variable (default: 6014).

## How It Works

The **Agent Voice Response** system integrates with Anthropic's Claude AI to provide intelligent text-based responses to user queries. The server receives text input from users, forwards it to Anthropic's API, and then returns the model's response to the user in real time. This allows the virtual agent to simulate conversational abilities, improving the overall user experience.

### Key Components

- **Express.js Server**: The server handles incoming requests from clients and sends them to Anthropic's API for processing.
- **Anthropic API Integration**: The application sends text queries to Anthropic and receives generated responses, which are relayed back to the user.
- **Tool Integration**: The system can use custom tools to extend Claude's capabilities, allowing it to perform specific actions based on user requests.
- **Conversation Handling**: The system can maintain the context of conversations for more interactive and dynamic exchanges.

### Example Code Overview

1. **Anthropic API Request**: The application sends user input to Anthropic and specifies the model (e.g., `claude-3-haiku-20240307`) to be used for generating responses.
2. **Response Streaming**: The server streams the response back to the client, allowing real-time interaction.
3. **Tool Handling**: When Claude requests to use a tool, the system executes the appropriate handler and returns the result.
4. **Conversation Context**: You can implement conversation handling by storing previous interactions and passing them as part of the messages for more contextual responses.

## API Endpoints

### POST `/prompt-stream`

This endpoint accepts a JSON payload containing the user's messages and returns a response generated by Anthropic's Claude AI.

## Customizing Anthropic API Requests

In `index.js`, you can modify the parameters sent to Anthropic, such as changing the model or adjusting the `temperature` and `max_tokens` to control the creativity and length of the responses:

```javascript
const response = await anthropic.beta.messages.create({
  model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
  max_tokens: +process.env.ANTHROPIC_MAX_TOKENS || 1024,
  temperature: +process.env.ANTHROPIC_TEMPERATURE || 1,
  system: process.env.ANTHROPIC_SYSTEM_PROMPT || "You are a helpful assistant.",
  messages,
  tools,
});
```

## Adding Custom Tools

The system supports custom tools that can be used by Claude to perform specific actions. To add a new tool:

1. Create a new JavaScript file in the `tools` directory.
2. Define the tool with the following structure:

```javascript
module.exports = {
  name: 'toolName',
  description: 'Description of what the tool does',
  input_schema: {
    type: 'object',
    properties: {
      // Define the input parameters
    },
    required: ['param1', 'param2']
  },
  handler: async (input) => {
    // Implement the tool's functionality
    return 'Result of the tool execution';
  }
};
```

The tool will be automatically loaded and made available to Claude.

## Docker Support

The project includes Docker support for easy deployment. To build and run the Docker container:

```bash
# Build the Docker image
npm run dc:build

# Push the Docker image to Docker Hub
npm run dc:push
```

## License

This project is licensed under the terms specified in the LICENSE.md file.
