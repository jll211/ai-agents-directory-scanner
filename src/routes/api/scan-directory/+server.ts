import { json } from '@sveltejs/kit';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { Agent } from '../../../types/agents';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { path: directoryPath } = await request.json();
    
    if (!directoryPath) {
      return json({ message: 'Directory path is required' }, { status: 400 });
    }
    
    // Security check to prevent traversal attacks
    const normalizedPath = path.normalize(directoryPath);
    if (!fs.existsSync(normalizedPath)) {
      return json({ message: 'Directory not found' }, { status: 404 });
    }
    
    if (!fs.statSync(normalizedPath).isDirectory()) {
      return json({ message: 'Path is not a directory' }, { status: 400 });
    }
    
    // Find potential agent configuration files
    const agents = await scanDirectory(normalizedPath);
    
    return json({ agents });
  } catch (error) {
    console.error('Error scanning directory:', error);
    return json(
      { message: error instanceof Error ? error.message : 'Failed to scan directory' },
      { status: 500 }
    );
  }
};

async function scanDirectory(directoryPath: string): Promise<Agent[]> {
  const agents: Agent[] = [];
  const files = fs.readdirSync(directoryPath);
  
  // Extensions we're interested in
  const validExtensions = ['.json', '.yaml', '.yml', '.js', '.ts'];
  
  // Keywords that might indicate agent configs
  const agentKeywords = ['agent', 'bot', 'assistant', 'ai'];
  
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    
    // Recursively scan subdirectories
    if (stats.isDirectory()) {
      const subDirAgents = await scanDirectory(filePath);
      agents.push(...subDirAgents);
      continue;
    }
    
    // Check if file extension is interesting
    const ext = path.extname(file).toLowerCase();
    if (!validExtensions.includes(ext)) continue;
    
    // Check if filename might contain agent keywords
    const fileName = path.basename(file, ext).toLowerCase();
    const mightBeAgentConfig = agentKeywords.some(keyword => fileName.includes(keyword));
    
    if (mightBeAgentConfig || ext === '.json' || ['.yaml', '.yml'].includes(ext)) {
      try {
        // Try to parse the file
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (ext === '.json') {
          const data = JSON.parse(content);
          
          // Check if the content looks like an agent config
          if (isLikelyAgentConfig(data)) {
            agents.push(convertToAgent(data, filePath));
          }
        } else if (['.yaml', '.yml'].includes(ext)) {
          const data = yaml.load(content);
          
          if (data && typeof data === 'object' && isLikelyAgentConfig(data)) {
            agents.push(convertToAgent(data, filePath));
          }
        }
      } catch (e) {
        console.warn(`Failed to parse file ${filePath}:`, e);
        // Continue with other files
      }
    }
  }
  
  return agents;
}

function isLikelyAgentConfig(data: any): boolean {
  // Check for common agent config properties
  return (
    data && 
    typeof data === 'object' &&
    (data.name && typeof data.name === 'string') &&
    (
      (data.instructions && typeof data.instructions === 'string') ||
      (data.prompt && typeof data.prompt === 'string') ||
      (data.system_prompt && typeof data.system_prompt === 'string') ||
      (data.systemPrompt && typeof data.systemPrompt === 'string')
    )
  );
}

function convertToAgent(data: any, filePath: string): Agent {
  return {
    id: data.id || crypto.randomUUID(),
    name: data.name,
    description: data.description || `Imported from ${path.basename(filePath)}`,
    instructions: data.instructions || data.prompt || '',
    model: data.model || 'gpt-3.5-turbo',
    temperature: typeof data.temperature === 'number' ? data.temperature : 0.7,
    systemPrompt: data.systemPrompt || data.system_prompt || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}