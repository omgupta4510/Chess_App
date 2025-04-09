import React,{useState} from 'react';
import {Chessboard} from 'react-chessboard';
import {Chess} from 'chess.js';
import './ChessBoard.css';
function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [errorMessage,setErrorMessage]=useState('');

  //to make move
  function makeMove(move){
    const gameCopy=new Chess(game.fen());
    try{
        const result=gameCopy.move(move);//move maked
        if(result==null){ 
            setErrorMessage('Invalid move! Please try again.');
            setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3 seconds
            return false;
        }
        setErrorMessage(''); // celar mssg is valid
        setGame(gameCopy);
        setCurrentPlayer(gameCopy.turn());
        return true;
    }catch(e){
        setErrorMessage('Invalid move! Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
        return false;
    }
    
  }

  //to handle drag and drop
  function onDrop(sourceSquare, targetSquare) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    };
    if (!makeMove(move)) return false;
    return true;
  }

  function resetGame() {
    setGame(new Chess());
    setCurrentPlayer('w');
    setErrorMessage(''); 
  }

  function gameStatus(){
    if(game.isCheckmate()){
        return currentPlayer === 'w' ? 'Black wins!' : 'White wins!';
    }else if(game.isDraw()){
        return 'Game is Draw!';
    }
    if (game.isCheck()) {
    return `Check! ${currentPlayer === 'w' ? 'White' : 'Black'} is in check.`;
    }
    else {
    return (
        <>    
            <>Current Player:</>    
            <span style={{ color: currentPlayer === 'w' ? 'white' : 'black' }}>
            {currentPlayer === 'w' ? 'White' : 'Black'}
            </span>
        </>

    );
    }
  }
  return (
    <div className="chess-board">
      <div className="game-info">
        {gameStatus() && <p className='status-message'>{gameStatus()}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
      </div>
      <div className="board-container" style={{ width: '500px', margin: '0 auto 20px' }}>
        <Chessboard 
          position={game.fen()} 
          onPieceDrop={onDrop} 
          boardWidth={500}
        />
      </div>
      <button onClick={resetGame} className='reset-button'>Reset Game</button>
    </div>
  );

}

export default ChessBoard;