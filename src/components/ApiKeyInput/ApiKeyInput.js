import React, { useState } from 'react';
import './ApiKeyInput.css';
import { LLM_MODELS } from '../../services';

function ApiKeyInput({ onModelSelect }) {
  const [selectedModel, setSelectedModel] = useState(LLM_MODELS[0].id);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    const modelInfo = LLM_MODELS.find(model => model.id === selectedModel);
    onModelSelect(selectedModel, apiKey, modelInfo.serviceClass);
    setError('');
  };

  const currentModel = LLM_MODELS.find(model => model.id === selectedModel);

  return (
    <div className="api-key-container">
      <h2>Choose Your AI Opponent</h2>
      <p>Select which AI model you'd like to play against and enter your API key.</p>
      
      <div className="model-selector">
        <label htmlFor="model-select">Select AI Model:</label>
        <select 
          id="model-select" 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          className="model-select"
        >
          {LLM_MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="model-info">
        <p>{currentModel.description}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={currentModel.apiKeyPlaceholder}
            className="api-key-input"
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
      
      <div className="info-box">
        <p>
          Don't have an API key? <a href={currentModel.apiKeyLink} target="_blank" rel="noopener noreferrer">
            Get one here
          </a>
        </p>
      </div>
    </div>
  );
}

export default ApiKeyInput;