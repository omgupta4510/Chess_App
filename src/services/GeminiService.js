import { Chess } from "chess.js";
class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = "Gemini";
    this.maxRetries = 25;
  }

  async getChessMove(fen, moveHistory, game) {
    let retries = 0;
    let invalidMove = [];
    let move = null;
    
    while (retries <= this.maxRetries) {
      try {
        console.log(`Attempt ${retries + 1}: Getting move from Gemini...`);
        console.log(invalidMove,"hiiiiiiiiii");
        
        
        const prompt = this.constructChessPrompt(fen, moveHistory, invalidMove);
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 50
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
          invalidMove.push({ data, reason: "Invalid response structure from Gemini API" });
          throw new Error("Invalid response structure from Gemini API");
        }
        
        const textResponse = data.candidates[0].content.parts[0].text.trim();
        console.log("Raw Gemini response:", textResponse);
        
        // Extract move pattern
        const movePattern = /([a-h][1-8][a-h][1-8][qrbnQRBN]?|[a-h][1-8]|[KQRBN][a-h][1-8]|[KQRBN]x[a-h][1-8]|O-O|O-O-O|[a-h]x[a-h][1-8])/i;
        const moveMatch = textResponse.match(movePattern);
        
        if (!moveMatch) {
          console.error("No move pattern found in response:", textResponse);
          invalidMove.push({ textResponse, reason: "No move pattern found" });
          retries++;
          continue;
        }
        
        let extmove= moveMatch[0];
        console.log("Extracted move:", extmove);
        
        // Convert to standard format if needed
        let standardMove = this.standardizeMove(extmove);
        if (!standardMove) {
          console.error("Could not standardize move:", move);
          invalidMove.push({ extmove, reason: "Could not standardize move" });
          retries++;
          continue;
        }
        
        // Validate the move
        if (!this.validateMove(game, standardMove)) {
          console.error("Move validation failed:", standardMove);
          invalidMove.push({ extmove, reason: "Move validation failed" });
          retries++;
          continue;
        }
        
        console.log("Valid move found:", standardMove);
        move= standardMove;
        retries= this.maxRetries*2; // Exit loop
      } 
      catch (error) {
        console.error(`Error getting move from Gemini (attempt ${retries + 1}/${this.maxRetries + 1}):`, error);
        // invalidMove = error.message;
        retries++;
      }
    }
    if(retries==this.maxRetries*2){
      return {valid:true,move: move}; // Return the valid move
    }
    return {valid:false,move: Error(`Failed to get a valid move after ${this.maxRetries + 1} attempts`)};
  }

  validateMove(game, moveString) {
    if (!moveString || moveString.length < 4) return false;
    
    try {
      // Create move object
      const moveObj = {
        from: moveString.substring(0, 2),
        to: moveString.substring(2, 4),
        promotion: moveString.length > 4 ? moveString.substring(4, 5) : undefined
      };
      
      // Check square validity
      if (!this.isValidSquare(moveObj.from) || !this.isValidSquare(moveObj.to)) {
        console.error("Invalid square notation:", moveObj);
        return false;
      }
      
      // Try the move on a copy of the game
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(moveObj);
      return result !== null;
    } catch (e) {
      console.error("Move validation error:", e);
      return false;
    }
  }

  isValidSquare(square) {
    if (!square || square.length !== 2) return false;
    return /^[a-h][1-8]$/.test(square);
  }
  
  standardizeMove(move) {
    // Already in correct format
    if (/^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/i.test(move)) {
      return move.toLowerCase();
    }
    
    // Handle castling
    if (move.toUpperCase() === "O-O") return "e1g1"; 
    if (move.toUpperCase() === "O-O-O") return "e1c1";
    
    // Handle standard algebraic notation (e.g., "e4", "Nf3")
    // This requires the game state to convert properly
    
    return null;
  }

  constructChessPrompt(fen, moveHistory, invalidMove=[]) {
    let prompt = `
    You are a chess engine assistant. I need you to analyze this position and provide one valid move.
    
    Current board (FEN): ${fen}
    
    Previous moves: ${moveHistory.length > 0 ? moveHistory.join(', ') : 'None'}
    
    CRITICAL INSTRUCTIONS:
    1. Respond with ONLY a single chess move in the format "e2e4" (from square + to square)
    2. Both squares must use valid chess notation (a letter a-h followed by a number 1-8)
    3. The move must be legal according to chess rules for the current position
    4. DO NOT include any explanations, analysis, or additional text
    `;

    if (invalidMove) {
      prompt += `
    ERROR: Your previous suggested move "${invalidMove}" was invalid!
    
    Common mistakes to avoid:
    - Using invalid square notation (must be a letter a-h followed by a number 1-8)
    - Suggesting a move for a piece that doesn't exist or can't move there
    - Moving in a way that leaves your king in check
    - Moving to a square occupied by your own piece
    
    Please carefully analyze the position and provide a different, legal move.
    `;
    }

    return prompt;
  }
}

export default GeminiService;