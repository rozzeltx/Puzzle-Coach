import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import './style.css';

const PuzzleCoach = () => {
  const [gridSize, setGridSize] = useState(3);
  const [puzzle, setPuzzle] = useState([]);
  const [goalState, setGoalState] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [coachSuggestion, setCoachSuggestion] = useState(null);
  const [coachMessage, setCoachMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('top-row');
  const [targetTile, setTargetTile] = useState(1);
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false);
  const [coachStrategy, setCoachStrategy] = useState('');
  const [currentTargetTile, setCurrentTargetTile] = useState(null);

  // Mobile audio unlock on first touch/click
  useEffect(() => {
    const handleFirstTouch = () => {
      Tone.start().then(() => {
        console.log("🔈 Audio unlocked");
      });
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('mousedown', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch);
    window.addEventListener('mousedown', handleFirstTouch); // also works on desktop
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('mousedown', handleFirstTouch);
    };
  }, []);

  // Initialize goal states
  useEffect(() => {
    if (gridSize === 3) {
      setGoalState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    } else {
      setGoalState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]);
    }
  }, [gridSize]);

  // Get valid moves for a given position
  const getValidMoves = (blankIndex, size) => {
    const moves = [];
    const row = Math.floor(blankIndex / size);
    const col = blankIndex % size;
    
    if (row > 0) moves.push(blankIndex - size);
    if (row < size - 1) moves.push(blankIndex + size);
    if (col > 0) moves.push(blankIndex - 1);
    if (col < size - 1) moves.push(blankIndex + 1);
    
    return moves;
  };

  // Generate solvable puzzle
  const generatePuzzle = useCallback(() => {
    const goal = gridSize === 3 ? 
      [1, 2, 3, 4, 5, 6, 7, 8, 0] : 
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    
    let newPuzzle = [...goal];
    
    // Shuffle by making random valid moves
    for (let i = 0; i < 1000; i++) {
      const blankIndex = newPuzzle.indexOf(0);
      const validMoves = getValidMoves(blankIndex, gridSize);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [newPuzzle[blankIndex], newPuzzle[randomMove]] = [newPuzzle[randomMove], newPuzzle[blankIndex]];
    }
    
    setPuzzle(newPuzzle);
    setMoveCount(0);
    setCoachSuggestion(null);
    setCoachMessage('');
    setCoachStrategy('');
    setCurrentPhase('top-row');
    setTargetTile(1);
    setIsPuzzleComplete(false);
    setCurrentTargetTile(null);
  }, [gridSize]);

  // Initialize puzzle on mount and grid size change
  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // OPTIMIZED: Fast BFS solver (based on version 2)
  const solvePuzzleBFS = (currentPuzzle, goal) => {
    const queue = [{ state: currentPuzzle, path: [] }];
    const visited = new Set();
    visited.add(currentPuzzle.join(','));
    
    while (queue.length > 0) {
      const { state, path } = queue.shift();
      
      if (state.join(',') === goal.join(',')) {
        return path;
      }
      
      const blankIndex = state.indexOf(0);
      const validMoves = getValidMoves(blankIndex, gridSize);
      
      for (const moveIndex of validMoves) {
        const newState = [...state];
        [newState[blankIndex], newState[moveIndex]] = [newState[moveIndex], newState[blankIndex]];
        
        const stateKey = newState.join(',');
        if (!visited.has(stateKey)) {
          visited.add(stateKey);
          queue.push({ state: newState, path: [...path, moveIndex] });
        }
      }
    }
    
    return [];
  };

  // ENHANCED: 3x3 coaching with expanded phrases
  const get3x3CoachSuggestion = () => {
    const solution = solvePuzzleBFS(puzzle, goalState);
    if (solution.length === 0) return null;
    
    const phrases = [
      `According to my calculations... only ${solution.length} moves left!`,
      `That's it Champ, thinking like a puzzle pro!`,
      `Optimal path detected. ${solution.length} moves to victory!`,
      `My algorithms suggest this move. Trust the math!`,
      `Efficiency mode engaged. ${solution.length} steps remaining.`,
      `Puzzle probability: 100% solvable in ${solution.length} moves!`,
      `Data analysis complete. This is the way!`,
      `Computing... Computing... This move is mathematically sound!`,
      `Beep boop! ${solution.length} moves in my database. Execute this one!`,
      `Neural networks activated! Path optimized to ${solution.length} moves.`,
      `Quantum computing says: move this tile for ${solution.length}-step victory!`,
      `Logic circuits firing! ${solution.length} moves to puzzle domination!`,
      `Error 404: Losing not found! ${solution.length} moves remaining.`,
      `Running puzzle.exe... ${solution.length} operations until completion!`,
      `Artificial intelligence recommends: click here for ${solution.length}-move win!`,
      `Downloading victory.zip... ${solution.length}% complete. Click this tile!`,
      `System alert: Optimal move detected! ${solution.length} steps to success.`,
      `Calculating brilliance... Result: ${solution.length} moves. Execute!`
    ];
    
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCoachMessage(randomPhrase);
    setCoachStrategy('Following the shortest path algorithm to minimize total moves.');
    
    return { tileIndex: solution[0], isCorrect: false };
  };

  // ENHANCED: 4x4 strategy for tiles 3 and 4 rotation
  const handleTiles3and4Strategy = () => {
    const tile3Pos = puzzle.indexOf(3);
    const tile4Pos = puzzle.indexOf(4);
    
    if (puzzle[2] !== 4) {
      setTargetTile(4);
      setCurrentTargetTile(4);
      setCoachMessage("Next, we're going to place tiles 3 and 4, but first we need to set them up properly. Place tile 4 first in the tile 3 position (left of its final spot).");
      setCoachStrategy("Setting up the horizontal rotation technique. We position both tiles strategically before executing the rotation sequence.");
      return { tileIndex: tile4Pos, isCorrect: false };
    }
    
    if (puzzle[6] !== 3) {
      setTargetTile(3);
      setCurrentTargetTile(3);
      setCoachMessage("Perfect! Now place tile 3 below its final position (position 7) to complete the setup.");
      setCoachStrategy("Both tiles are now positioned for the rotation. This creates a 2x2 workspace for the swapping sequence.");
      return { tileIndex: tile3Pos, isCorrect: false };
    }
    
    if (puzzle[2] === 4 && puzzle[6] === 3) {
      const blankPos = puzzle.indexOf(0);
      
      if (blankPos !== 3) {
        setCoachMessage("Excellent setup! Now put the blank space in the corner (position 4) and we'll rotate tiles 4 and 3 into place.");
        return { tileIndex: 3, isCorrect: false };
      } else if (puzzle[7] !== 0) {
        setCoachMessage("Great! Now move tile 4 down - this starts the rotation sequence.");
        return { tileIndex: 2, isCorrect: false }; // Move tile 4 right first
      } else if (puzzle[3] !== 0) {
        setCoachMessage("Perfect! Now move tile 3 up into its final position.");
        return { tileIndex: 6, isCorrect: false }; // Move tile 3 up second
      } else {
        setCoachMessage("Final step: Move the blank down to complete the rotation magic!");
        return { tileIndex: 7, isCorrect: false };
      }
    }
    
    return null;
  };

  // ENHANCED: 4x4 left column strategy with vertical rotation
  const handleLeftColumnStrategy = () => {
    if (puzzle[4] !== 5) {
      setTargetTile(5);
      setCurrentTargetTile(5);
      setCoachMessage("Working on tile 5 for the left column - this one's straightforward!");
      return { tileIndex: puzzle.indexOf(5), isCorrect: false };
    }
    
    const tile9InPlace = puzzle[8] === 9;
    const tile13InPlace = puzzle[12] === 13;
    
    if (tile9InPlace && tile13InPlace) {
      return null;
    }
    
    if (puzzle[8] !== 13) {
      setTargetTile(13);
      setCurrentTargetTile(13);
      setCoachMessage("Now we're going to place tiles 9 and 13 using the vertical rotation technique. First, put tile 13 into position 9 (above its final position).");
      setCoachStrategy("Setting up the vertical rotation technique. We stack the tiles vertically before executing the rotation sequence.");
      return { tileIndex: puzzle.indexOf(13), isCorrect: false };
    }
    
    if (puzzle[9] !== 9) {
      setTargetTile(9);
      setCurrentTargetTile(9);
      setCoachMessage("Perfect! Now put tile 9 to the right of tile 13 (position 10) to complete the vertical setup.");
      setCoachStrategy("Both tiles are now stacked vertically - ready for the rotation sequence that will swap them into their correct positions.");
      return { tileIndex: puzzle.indexOf(9), isCorrect: false };
    }
    
    if (puzzle[8] === 13 && puzzle[9] === 9) {
      const blankPos = puzzle.indexOf(0);
      
      if (blankPos !== 12) {
        setCoachMessage("Excellent setup! Now put the blank in the bottom-left corner (position 13) and we'll rotate them into place!");
        setCoachStrategy("The vertical rotation: blank bottom-left → move tile 13 down → move tile 9 left → move blank up. This swaps them into correct positions!");
        return { tileIndex: 12, isCorrect: false };
      } else if (puzzle[12] !== 0) {
        setCoachMessage("Great! Now move tile 13 down into its final position.");
        return { tileIndex: 8, isCorrect: false };
      } else if (puzzle[8] !== 0) {
        setCoachMessage("Perfect! Now move tile 9 left into the middle-left position.");
        return { tileIndex: 9, isCorrect: false };
      } else {
        setCoachMessage("Final step: Move the blank up to complete the vertical rotation!");
        return { tileIndex: 12, isCorrect: false };
      }
    }
    
    return null;
  };

  // OPTIMIZED: 4x4 coaching system (fixed iOS reload issue)
  const get4x4CoachSuggestion = () => {
    if (currentPhase === 'top-row') {
      const tile3InPlace = puzzle[2] === 3;
      const tile4InPlace = puzzle[3] === 4;
      
      if (tile3InPlace && tile4InPlace) {
        // FIXED: Don't recursively call - let useEffect handle it
        setCurrentPhase('left-column');
        setTargetTile(5);
        setCurrentTargetTile(5);
        return null; // Let useEffect trigger on next frame
      }
      
      if (puzzle[0] !== 1) {
        setTargetTile(1);
        setCurrentTargetTile(1);
        setCoachMessage("Let's get tile 1 into the top-left corner first.");
        return { tileIndex: puzzle.indexOf(1), isCorrect: false };
      }
      
      if (puzzle[1] !== 2) {
        setTargetTile(2);
        setCurrentTargetTile(2);
        setCoachMessage("Now let's place tile 2 next to tile 1.");
        return { tileIndex: puzzle.indexOf(2), isCorrect: false };
      }
      
      if (!tile3InPlace || !tile4InPlace) {
        return handleTiles3and4Strategy();
      }
    }
    
    if (currentPhase === 'left-column') {
      const leftColumnResult = handleLeftColumnStrategy();
      if (leftColumnResult) {
        return leftColumnResult;
      }
      
      // FIXED: Don't recursively call - let useEffect handle it
      setCurrentPhase('remaining');
      return null; // Let useEffect trigger on next frame
    }
    
    if (currentPhase === 'remaining') {
      // Extract the 3x3 subpuzzle from positions [5,6,7,9,10,11,13,14,15]
      const subPuzzlePositions = [5, 6, 7, 9, 10, 11, 13, 14, 15];
      const subPuzzleValues = subPuzzlePositions.map(pos => puzzle[pos]);
      
      // Map 4x4 values to 3x3 format: 6→1, 7→2, 8→3, 10→4, 11→5, 12→6, 14→7, 15→8, 0→0
      const valueMap = { 6: 1, 7: 2, 8: 3, 10: 4, 11: 5, 12: 6, 14: 7, 15: 8, 0: 0 };
      const mapped3x3Puzzle = subPuzzleValues.map(val => valueMap[val]);
      const goal3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      
      // Check if already solved
      if (mapped3x3Puzzle.join(',') === goal3x3.join(',')) {
        return null;
      }
      
      // Solve the 3x3 subpuzzle using size 3
      const solve3x3Subpuzzle = (puzzle3x3, goal) => {
        const queue = [{ state: puzzle3x3, path: [] }];
        const visited = new Set();
        visited.add(puzzle3x3.join(','));
        
        while (queue.length > 0) {
          const { state, path } = queue.shift();
          
          if (state.join(',') === goal.join(',')) {
            return path;
          }
          
          const blankIndex = state.indexOf(0);
          const validMoves = getValidMoves(blankIndex, 3); // Use size 3 for 3x3 grid!
          
          for (const moveIndex of validMoves) {
            const newState = [...state];
            [newState[blankIndex], newState[moveIndex]] = [newState[moveIndex], newState[blankIndex]];
            
            const stateKey = newState.join(',');
            if (!visited.has(stateKey)) {
              visited.add(stateKey);
              queue.push({ state: newState, path: [...path, moveIndex] });
            }
          }
        }
        
        return [];
      };
      
      const solution3x3 = solve3x3Subpuzzle(mapped3x3Puzzle, goal3x3);
      
      if (solution3x3.length > 0) {
        // Map 3x3 solution back to 4x4 position
        const subIndex = solution3x3[0];
        const actual4x4Position = subPuzzlePositions[subIndex];
        
        const phrases = [
          `Perfect! Now we have a 3x3 puzzle remaining. According to my calculations... only ${solution3x3.length} moves left!`,
          `Excellent! The remaining area is now a classic 3x3. Optimal path detected: ${solution3x3.length} moves to victory!`,
          `Great work! We've reduced this to a 3x3 puzzle. My algorithms suggest ${solution3x3.length} moves remaining!`,
          `Outstanding! Now it's just a standard 3x3. Trust the math - ${solution3x3.length} steps to completion!`,
          `Brilliant! The final 3x3 section awaits. Computing optimal path... ${solution3x3.length} moves detected!`
        ];
        
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setCoachMessage(randomPhrase);
        setCoachStrategy('Extracted 3x3 subpuzzle and solving it independently for optimal performance!');
        
        return { tileIndex: actual4x4Position, isCorrect: false };
      }
    }
    
    return null;
  };

  // OPTIMIZED: Coach mode logic (minimal overhead)
  useEffect(() => {
    if (!isCoachMode || isPuzzleComplete) return;

    setIsThinking(true);
    
    const timer = setTimeout(() => {
      let suggestion = null;
      
      if (gridSize === 3) {
        suggestion = get3x3CoachSuggestion();
      } else {
        suggestion = get4x4CoachSuggestion();
      }
      
      setCoachSuggestion(suggestion);
      setIsThinking(false);
    }, 400); // Slightly faster response

    return () => clearTimeout(timer);
  }, [puzzle, isCoachMode, isPuzzleComplete, currentPhase, targetTile, gridSize, goalState]);

  // REVERTED: Audio system back to working version
  const playMoveSound = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      const synth = new Tone.Synth().toDestination();
      
      const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      synth.triggerAttackRelease(randomNote, '8n');
    } catch (error) {
      // Silent fail
    }
  };

  const playSuccessSound = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      const synth = new Tone.Synth().toDestination();
      
      const successChord = ['C5', 'E5', 'G5'];
      successChord.forEach((note, index) => {
        setTimeout(() => {
          synth.triggerAttackRelease(note, '4n');
        }, index * 100);
      });
    } catch (error) {
      // Silent fail
    }
  };

  const playCelebrationSound = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      const synth = new Tone.Synth().toDestination();
      
      const celebration = ['C4', 'E4', 'G4', 'C5', 'G4', 'C5'];
      celebration.forEach((note, index) => {
        setTimeout(() => {
          synth.triggerAttackRelease(note, '4n');
        }, index * 150);
      });
    } catch (error) {
      // Silent fail
    }
  };

  // REVERTED: Simple completion check with original audio
  const checkCompletion = (currentPuzzle) => {
    const isComplete = currentPuzzle.join(',') === goalState.join(',');
    
    if (isComplete && !isPuzzleComplete) {
      setIsPuzzleComplete(true);
      setCoachMessage('🎉 Puzzle Complete! Great job!');
      setCoachStrategy('Congratulations! You\'ve mastered the computational thinking behind sliding puzzles!');
      playCelebrationSound();
    }
    return isComplete;
  };

  // OPTIMIZED: Handle tile click (minimal overhead)
  const handleTileClick = async (index) => {
    if (isPuzzleComplete) return;

    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    const blankIndex = puzzle.indexOf(0);
    const validMoves = getValidMoves(blankIndex, gridSize);
    
    if (!validMoves.includes(index)) return;

    const newPuzzle = [...puzzle];
    [newPuzzle[blankIndex], newPuzzle[index]] = [newPuzzle[index], newPuzzle[blankIndex]];
    
    setPuzzle(newPuzzle);
    setMoveCount(prev => prev + 1);
    playMoveSound();

    // Check if a tile reached its home position (for success sound)
    const tileReachedHome = goalState[index] === newPuzzle[index] && goalState[index] !== 0;
    
    if (tileReachedHome) {
      playSuccessSound();
    }

    // ENHANCED: Coach feedback with more personality
    if (isCoachMode && coachSuggestion && coachSuggestion.tileIndex === index) {
      const successPhrases = [
        "That's it Champ, thinking like a puzzle pro!",
        "Excellent calculation! You're getting the hang of this!",
        "Perfect move! My algorithms approve!",
        "Boom! That's exactly what I computed!",
        "Nice work! You're following the optimal path!",
        "Stellar move! Keep that momentum going!",
        "Calculated perfectly! You're a natural!",
        "Brilliant! My circuits are impressed!",
        "Outstanding execution! Logic level: Expert!",
        "Superb choice! You're thinking like a computer!",
        "Magnificent! That's textbook puzzle solving!",
        "Flawless! My databases approve this move!",
        "Incredible! You're reading my mind!",
        "Phenomenal! Efficiency rating: 100%!",
        "Spectacular! You've cracked the code!",
        "Amazing! That's exactly what I would do!"
      ];
      
      const randomSuccess = successPhrases[Math.floor(Math.random() * successPhrases.length)];
      setCoachMessage(randomSuccess);
      setCoachStrategy('Great execution of the optimal strategy!');
      
    } else if (isCoachMode && coachSuggestion && coachSuggestion.tileIndex !== index) {
      const alternativePhrases = [
        "Interesting approach! Let me recalculate...",
        "That works too! Multiple paths to victory!",
        "Creative thinking! I'll adapt my strategy.",
        "Not my first choice, but let's see where this goes!",
        "Different route detected! Adjusting calculations...",
        "Hmm, plot twist! Recalibrating my algorithms...",
        "Ooh, going rogue! I like your style!",
        "Unexpected move! My neural nets are learning...",
        "Bold choice! Let me run the numbers again...",
        "Curve ball detected! Adapting strategy matrix...",
        "Interesting gambit! Processing alternative pathways...",
        "Wild card move! Updating probability models...",
        "Surprise factor: High! Recomputing optimal route..."
      ];
      
      const randomAlternative = alternativePhrases[Math.floor(Math.random() * alternativePhrases.length)];
      setCoachMessage(randomAlternative);
      setCoachStrategy('Adapting to your approach...');
      
      // Clear suggestion to recalculate immediately
      setTimeout(() => {
        setCoachSuggestion(null);
      }, 600); // Slightly longer to ensure recalculation
    }

    checkCompletion(newPuzzle);
  };

  // Render tile content
  const renderTileContent = (value, index) => {
    if (value === 0) return null;

    const imagePath = gridSize === 3 ? 
      `/${value}.png` : 
      `/logo_tile_${value}.png`;

    return (
      <div className="tile-content">
        <img 
          src={imagePath} 
          alt={`Tile ${value}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <span className="tile-number" style={{display: 'none'}}>{value}</span>
      </div>
    );
  };

  // FIXED: Highlighting system - completed tiles override coach suggestions
  const getTileClassName = (value, index) => {
    let className = 'tile';
    
    if (value === 0) {
      className += ' blank';
      return className;
    }
    
    if (gridSize === 3) {
      if (isCoachMode && coachSuggestion && coachSuggestion.tileIndex === index) {
        className += ' coach-highlight';
      }
      return className;
    }
    
    if (gridSize === 4 && isCoachMode) {
      // GREEN for tiles in final position (highest priority!)
      if (puzzle[index] === goalState[index]) {
        className += ' completed';
      }
      // RED highlight only if NOT in final position AND coach suggests it
      else if (coachSuggestion && coachSuggestion.tileIndex === index) {
        className += ' coach-highlight';
      }
    }
    
    return className;
  };

  return (
    <div className="puzzle-coach">
      <div className="header">
        <h1>🧩 Puzzle Coach</h1>
        <div className="stats">
          <span>Moves: {moveCount}</span>
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={isCoachMode}
              onChange={(e) => setIsCoachMode(e.target.checked)}
            />
            Coach Mode {gridSize === 3 ? '(Auto-Solver)' : '(Strategic)'}
          </label>
        </div>

        <div className="control-group">
          <button 
            type="button"
            onClick={() => setGridSize(3)} 
            className={gridSize === 3 ? 'active' : ''}
          >
            3x3
          </button>
          <button 
            type="button"
            onClick={() => setGridSize(4)} 
            className={gridSize === 4 ? 'active' : ''}
          >
            4x4
          </button>
        </div>

        <button 
          type="button" 
          onClick={generatePuzzle} 
          className="reset-btn"
        >
          New Puzzle
        </button>
      </div>

      <div className={`puzzle-grid grid-${gridSize}`}>
        {puzzle.map((value, index) => (
          <div
            key={index}
            className={getTileClassName(value, index)}
            onClick={() => handleTileClick(index)}
          >
            {renderTileContent(value, index)}
          </div>
        ))}
      </div>

      {isPuzzleComplete && (
        <div className="completion-message">
          🎉 Congratulations! Puzzle solved in {moveCount} moves!
        </div>
      )}

      {isCoachMode && (
        <div className="coach-panel">
          <div className="coach-message">
            <div className="coach-icon">🤖</div>
            <div className="message-content">
              <div className="message-text">
                {isThinking ? '🧠 Coach analyzing puzzle state...' : (coachMessage || 'Ready to help!')}
              </div>
              {coachStrategy && !isThinking && (
                <div className="strategy-explanation">
                  <strong>📋 Strategy:</strong> {coachStrategy}
                </div>
              )}
            </div>
          </div>
          
          {gridSize === 4 && isCoachMode && !isThinking && (
            <div className="progress-indicator">
              <div className="phase-info">
                <span className="phase-label">
                  Phase: {currentPhase === 'top-row' ? '1 - Top Row' : 
                          currentPhase === 'left-column' ? '2 - Left Column' : 
                          '3 - Remaining Tiles'}
                </span>
                <span className="target-info">Target: Tile {targetTile}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PuzzleCoach;