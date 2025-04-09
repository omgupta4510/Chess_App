import logo from './logo.svg';
import './App.css';
import ChessBoard from './ChessBoard/ChessBoard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chess Game</h1>
      </header>
      <main>
        <ChessBoard/>
      </main>
      <footer>
        <p>Created for BharatX Tech Intern Task By ❤️</p>
      </footer>
    </div>
  );
}

export default App;
