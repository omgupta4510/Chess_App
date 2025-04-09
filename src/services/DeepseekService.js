class DeepseekService {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.name = "Deepseek";
    }
  
    async getChessMove(fen, moveHistory) {
      try {
        const prompt = this.constructChessPrompt(fen, moveHistory);
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 20
          })
        });
  
        if (!response.ok) {
          throw new Error(`Deepseek API returned status: ${response.status}`);
        }
  
        const data = await response.json();
        const textResponse = data.choices[0].message.content.trim();
        
        // Extract the move from the response
        const movePattern = /[a-h][1-8][a-h][1-8][qrbnQRBN]?|[KQRBN][a-h][1-8]|[KQRBN]x[a-h][1-8]|O-O|O-O-O|[a-h]x[a-h][1-8]|[a-h][1-8]/;
        const moveMatch = textResponse.match(movePattern);
        
        if (moveMatch) {
          return moveMatch[0];
        } else {
          console.error("Could not extract a valid move from Deepseek response:", textResponse);
          return null;
        }
      } catch (error) {
        console.error("Error getting move from Deepseek:", error);
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
  
  export default DeepseekService;