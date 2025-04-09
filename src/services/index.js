import GeminiService from './GeminiService';
import OpenAIService from './OpenAIService';
import DeepseekService from './DeepseekService';
import ClaudeService from './ClaudeService';

export {
  GeminiService,
  OpenAIService,
  DeepseekService,
  ClaudeService
};

// Available LLM models information
export const LLM_MODELS = [
    {
        id: 'google-gemini',
        name: 'Google Gemini',
        description: 'Google Gemini AI model',
        serviceClass: GeminiService,
        apiKeyPlaceholder: 'Enter your Google Gemini API key'
    },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    description: 'OpenAI\'s GPT model',
    serviceClass: OpenAIService,
    apiKeyPlaceholder: 'Enter your OpenAI API key',
    apiKeyLink: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Anthropic\'s Claude model',
    serviceClass: ClaudeService,
    apiKeyPlaceholder: 'Enter your Claude API key',
    apiKeyLink: 'https://console.anthropic.com/keys'
  },
  {
    id: 'deepseek',
    name: 'Deepseek',
    description: 'Deepseek language model',
    serviceClass: DeepseekService,
    apiKeyPlaceholder: 'Enter your Deepseek API key',
    apiKeyLink: 'https://platform.deepseek.com/'
  }
];