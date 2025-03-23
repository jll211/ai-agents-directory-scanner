# AI Agents Directory Scanner

A tool to import AI agents from CSV files and scan directories for agent configurations.

## Features

- Import agents from CSV files
- Scan directories to find agent configuration files
- Support for JSON and YAML configuration formats
- Smart detection of agent configuration patterns
- Auto-mapping of fields to agent properties

## CSV Import

The CSV importer supports the following columns:

- `name` (required): The name of the agent
- `description`: A description of what the agent does
- `instructions`: The instructions for the agent
- `model`: The AI model to use (defaults to `gpt-3.5-turbo`)
- `temperature`: The temperature setting (defaults to `0.7`)
- `systemPrompt`: The system prompt for the agent

## Directory Scanner

The directory scanner recursively searches through directories for files that might contain agent configurations. It uses several heuristics:

1. File extensions: `.json`, `.yaml`, `.yml`, `.js`, `.ts`
2. Filename keywords: `agent`, `bot`, `assistant`, `ai`
3. Content analysis: Looks for fields like `name`, `instructions`, `prompt`, etc.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Usage

1. Click "Import Agents" button in the UI
2. Choose "Import From CSV" or "Scan Directory"
3. For CSV, select a CSV file with the supported columns
4. For directory scanning, enter the path to a directory containing agent configs
5. The agents will be imported and added to your agent list