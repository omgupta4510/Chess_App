import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { LLM_MODELS } from '../../services';
import './ChessBoard.css';
import ApiKeyInput from '../ApiKeyInput/ApiKeyInput';

function ChessBoard() {
  // Initialize the chess game
  const [game, setGame] = useState(new Chess());
  
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  
  // LLM state
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [llmService, setLLMService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playMode, setPlayMode] = useState('human'); // 'human' or 'ai'
  const [playerColor, setPlayerColor] = useState('w'); // Player is white by default
  const [invalidMovesHistory, setInvalidMovesHistory] = useState(new Map());
  
  // Effect to handle AI moves
  // useEffect(() => {
  //   async function handleAIMove() {
  //     if (
  //       playMode === 'ai' && 
  //       llmService && 
  //       currentPlayer !== playerColor && 
  //       !game.isGameOver()
  //     ) {
  //       setIsLoading(true);
  //       setStatusMessage(`${selectedLLM} is thinking...`);
        
  //       try {
  //         const currentFen = game.fen();
  //         // const invalidMovesForPosition = invalidMovesHistory.get(currentFen) || [];
          
  //         // Pass invalid moves history to the service
  //         console.log(currentFen);
  //         console.log(moveHistory);
  //         console.log(game);
  //         console.log(invalidMovesHistory);
          
  //         const aiMove = await llmService.getChessMove(
  //           currentFen,
  //           moveHistory,
  //           game,
  //           invalidMovesHistory// Pass the invalid moves for this position
  //         );
  //         console.log(aiMove);
          
  //         if (aiMove.valid && aiMove.move.length >= 4) {
  //           const moveObj = {
  //             from: aiMove.substring(0, 2),
  //             to: aiMove.substring(2, 4),
  //             promotion: aiMove.length > 4 ? aiMove.substring(4, 5) : 'q'
  //           };
            
  //           const validMove = makeAMove(moveObj);
            
  //           if (!validMove) {
  //             // Add to invalid moves history
  //             addInvalidMove(currentFen, aiMove, "Move validation failed");
  //             setErrorMessage(`${selectedLLM} suggested an invalid move: ${aiMove}`);
  //           }
  //         } else {
  //           addInvalidMove(currentFen, aiMove.move, "Invalid move format");
  //           setErrorMessage(`${selectedLLM} provided an invalid move format`);
  //         }
  //       } catch (error) {
  //         setErrorMessage(`${selectedLLM} error: ${error.message}`);
  //         console.error("AI move error:", error);
  //       } finally {
  //         setIsLoading(false);
  //         setInvalidMovesHistory(new Map());
  //         setStatusMessage('');
  //       }
  //     }
  //   }
    
  //   handleAIMove();
  // }, [currentPlayer, playMode, llmService, playerColor, game, selectedLLM, moveHistory, invalidMovesHistory]);
  useEffect(() => {
    async function handleAIMove() {
      if (
        playMode === 'ai' && 
        llmService && 
        currentPlayer !== playerColor && 
        !game.isGameOver()
      ) {
        setIsLoading(true);
        // setStatusMessage(`${selectedLLM} is thinking...`);
        
        try {
          // Pass the current game state to validate moves properly
          const aiMove = await llmService.getChessMove(
            game.fen(), 
            moveHistory,
            game // Pass the actual chess.js game instance for validation
          );
          
          if (aiMove.valid) {
            // Create move object
            const moveObj = {
              from: aiMove.move.substring(0, 2),
              to: aiMove.move.substring(2, 4),
              promotion: aiMove.move.length > 4 ? aiMove.move.substring(4, 5) : undefined
            };
            
            // Final validation before applying
            const validMove = makeAMove(moveObj);
            
            if (!validMove) {
              setErrorMessage(`${selectedLLM} suggested an invalid move (${aiMove.move}). Please reset the game.`);
            }
          } else {
            setErrorMessage(`${selectedLLM} could not make a valid move. Please reset the game.`);
          }
        } catch (error) {
          setErrorMessage(`${selectedLLM} error: ${error.message}`);
          console.error("AI move error:", error);
        } finally {
          setIsLoading(false);
          setStatusMessage('');
        }
      }
    }
    
    handleAIMove();
  }, [currentPlayer, playMode, llmService, playerColor, game, selectedLLM, moveHistory]);
  const addInvalidMove = (fen, move, reason) => {
    setInvalidMovesHistory(prevHistory => {
      const newHistory = new Map(prevHistory); // Create a new Map to trigger re-render
      const invalidMoves = newHistory.get(fen) || [];
      newHistory.set(fen, [...invalidMoves, {
        move: move,
        reason: reason,
        timestamp: new Date().toISOString()
      }]);
      return newHistory;
    });
  };
  
 
  
  // Handle model selection
  const handleModelSelect = (modelId, key, ServiceClass) => {
    setApiKey(key);
    const selectedModelInfo = LLM_MODELS.find(model => model.id === modelId);
    setSelectedLLM(selectedModelInfo.name);
    setLLMService(new ServiceClass(key));
  };
  
  // Function to make a move
  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    
    try {
      // Make the move
      const result = gameCopy.move(move);
      
      // If the move is invalid, return null
      if (result === null) {
        setErrorMessage('Invalid move! Please try again.');
        setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3 seconds
        return false;
      }
      
      // Clear any existing error messages
      setErrorMessage('');
      
      // Update the game state
      setGame(gameCopy);
      
      // Update move history
      const moveMade = `${currentPlayer} - ${result.from}${result.to}${result.promotion || ''}`;
      setMoveHistory([...moveHistory, moveMade]);
      
      // Update the current player
      setCurrentPlayer(gameCopy.turn());
      
      // Update game status
      updateGameStatus(gameCopy);
      
      return true;
    } catch (e) {
      setErrorMessage('Invalid move! Please try again.');
      setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3 seconds
      return false;
    }
  }
  
  // Function to handle piece drop (drag and drop)
  function onDrop(sourceSquare, targetSquare) {
    // Don't allow moves when it's not the player's turn
    if (playMode === 'ai' && currentPlayer !== playerColor) {
      setErrorMessage("It's the AI's turn now. Please wait.");
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }
    
    // Don't allow moves during AI thinking
    if (isLoading) {
      setErrorMessage("AI is thinking. Please wait.");
      return false;
    }
    
    // Try to make the move
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });
    
    // If the move is invalid, return false
    return move;
  }
  
  // Function to update game status messages
  function updateGameStatus(currentGame) {
    if (currentGame.isCheckmate()) {
      setStatusMessage(`Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins!`);
    } else if (currentGame.isDraw()) {
      setStatusMessage("Game ended in a draw!");
    } else if (currentGame.isCheck()) {
      setStatusMessage(`Check! ${currentGame.turn() === 'w' ? 'White' : 'Black'} is in check.`);
    } else {
      setStatusMessage('');
    }
  }
  
  // Function to reset the game
  function resetGame() {
    setGame(new Chess());
    setCurrentPlayer('w');
    setErrorMessage('');
    setStatusMessage('');
    setMoveHistory([]);
  }
  
  // Function to start a game with AI
  function startAIGame(color) {
    resetGame();
    setPlayMode('ai');
    setPlayerColor(color);
    
    // If AI goes first (player is black)
    if (color === 'b') {
      // setStatusMessage(`${selectedLLM} is thinking...`);
      setIsLoading(true);  // This will trigger the useEffect for AI move
    }
  }
  
  // Function to change the AI opponent
  function changeAIOpponent() {
    setApiKey('');
    setLLMService(null);
    setSelectedLLM(null);
    setPlayMode('human');
  }
  
  // If no API key is provided for AI mode, show the model selection form
  if (playMode === 'ai' && !apiKey) {
    return <ApiKeyInput onModelSelect={handleModelSelect} />;
  }
  
  return (
    <div className="chess-board">
      <div className="game-info">
        <h2>Chess Game</h2>
        {playMode === 'human' ? (
          <p>Mode: Human vs Human</p>
        ) : (
          <p>Mode: Human ({playerColor === 'w' ? 'White' : 'Black'}) vs {selectedLLM} ({playerColor === 'w' ? 'Black' : 'White'})</p>
        )}
        
        <p>Current Player: {currentPlayer === 'w' ? 'White' : 'Black'}</p>
        
        {/* Status and error messages */}
        {statusMessage && <p className="status-message">{statusMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isLoading && <p className="status-message">{selectedLLM} is thinking...</p>}
        
        {/* Game controls */}
        <div className="game-controls">
          <button className="reset-button" onClick={resetGame}>Reset Game</button>
          
          {playMode === 'human' && (
            <div className="ai-controls">
              <button className="playerai-button" onClick={() => startAIGame('w')}>Play as White vs AI</button>
              <button className="playerai-button" onClick={() => startAIGame('b')}>Play as Black vs AI</button>
            </div>
          )}
          
          {playMode === 'ai' && (
            <>
              <button className="playerhuman-button" onClick={() => setPlayMode('human')}>Switch to Human vs Human</button>
              <button className="changeai-button"onClick={changeAIOpponent}>Change AI Opponent</button>
            </>
          )}
        </div>
      </div>
      
      <div className="board-container" style={{ width: '500px', margin: '0 auto' }}>
        <Chessboard 
          position={game.fen()} 
          onPieceDrop={onDrop} 
          boardWidth={500}
        />
      </div>
      
      {/* Move history display */}
      <div className="move-history">
        <h3>Move History</h3>
        <div className="move-list">
          {moveHistory.length === 0 ? (
            <p>No moves yet</p>
          ) : (
            <ol>
              {moveHistory.map((move, index) => (
                <li key={index}>{move}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChessBoard;