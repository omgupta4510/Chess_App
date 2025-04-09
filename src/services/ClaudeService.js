class ClaudeService {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.name = "Claude";
    }
  
    async getChessMove(fen, moveHistory) {
      try {
        const prompt = this.constructChessPrompt(fen, moveHistory);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 50,
            messages: [
              { role: "user", content: prompt }
            ]
          })
        });
  
        if (!response.ok) {
          throw new Error(`Claude API returned status: ${response.status}`);
        }
  
        const data = await response.json();
        const textResponse = data.content[0].text;
        
        // Extract the move from the response
        const movePattern = /[a-h][1-8][a-h][1-8][qrbnQRBN]?|[KQRBN][a-h][1-8]|[KQRBN]x[a-h][1-8]|O-O|O-O-O|[a-h]x[a-h][1-8]|[a-h][1-8]/;
        const moveMatch = textResponse.match(movePattern);
        
        if (moveMatch) {
          return moveMatch[0];
        } else {
          console.error("Could not extract a valid move from Claude response:", textResponse);
          return null;
        }
      } catch (error) {
        console.error("Error getting move from Claude:", error);
        throw error;
      }
    }
  
    constructChessPrompt(fen, moveHistory) {
      return `
      You are a chess AI assistant. You need to suggest the next best move for the current board position.
      
      Current board position (FEN notation): ${fen}
      
      Previous moves in the game: ${moveHistory.length > 0 ? moveHistory.join(', ') : 'No moves yet.'}
      
      Please analyze the position and provide ONLY the next move in standard chess notation (e.g., e2e4, g1f3, etc.).
      Return ONLY the move coordinates without ANY additional text or explanation.
      You must return a legal chess move according to standard chess rules.
      `;
    }
  }
  
  export default ClaudeService;