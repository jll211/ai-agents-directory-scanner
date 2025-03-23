export interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}