import React from 'react';
import './App.css';
import ChessBoard from './components/ChessBoard/ChessBoard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chess LLM App</h1>
        <p>Play chess against your choice of language model AI</p>
      </header>
      <main>
        <ChessBoard />
      </main>
      <footer>
        <p>Created for BharatX Tech Intern Task By ❤️</p>
      </footer>
    </div>
  );
}

export default App;