const fs = require('fs');
const path = require('path');

function loadTools() {
  const dir = path.join(__dirname, 'tools');
  const files = fs.readdirSync(dir);

  const tools = files.map(file => {
    const tool = require(path.join(dir, file));
    return {
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    };
  });

  return tools;
}

function getToolHandler(name) {
  const tool = require(path.join(__dirname, 'tools', `${name}.js`));
  return tool.handler;
}

module.exports = { loadTools, getToolHandler };