'use client';

import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const pacManRef = useRef<Position>({ x: 10, y: 10 });
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const dotsRef = useRef<boolean[][]>([]);
  const ghostsRef = useRef<Position[]>([]);
  const mouthOpenRef = useRef(true);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Initialize dots grid
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;

    // Initialize ghosts
    ghostsRef.current = [
      { x: 5, y: 5 },
      { x: 14, y: 5 },
      { x: 5, y: 14 },
      { x: 14, y: 14 },
    ];

    // Reset Pac-Man position
    pacManRef.current = { x: 10, y: 10 };
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      // Update direction
      directionRef.current = nextDirectionRef.current;

      // Move Pac-Man
      const newPos = { ...pacManRef.current };
      switch (directionRef.current) {
        case 'UP':
          newPos.y = (newPos.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          newPos.y = (newPos.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          newPos.x = (newPos.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          newPos.x = (newPos.x + 1) % GRID_SIZE;
          break;
      }
      pacManRef.current = newPos;

      // Check dot collision
      if (dotsRef.current[newPos.y]?.[newPos.x]) {
        dotsRef.current[newPos.y][newPos.x] = false;
        setScore((s) => s + 10);
      }

      // Move ghosts
      ghostsRef.current = ghostsRef.current.map((ghost) => {
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        
        const newGhost = { ...ghost };
        switch (randomDir) {
          case 'UP':
            newGhost.y = (newGhost.y - 1 + GRID_SIZE) % GRID_SIZE;
            break;
          case 'DOWN':
            newGhost.y = (newGhost.y + 1) % GRID_SIZE;
            break;
          case 'LEFT':
            newGhost.x = (newGhost.x - 1 + GRID_SIZE) % GRID_SIZE;
            break;
          case 'RIGHT':
            newGhost.x = (newGhost.x + 1) % GRID_SIZE;
            break;
        }
        return newGhost;
      });

      // Check ghost collision
      for (const ghost of ghostsRef.current) {
        if (ghost.x === pacManRef.current.x && ghost.y === pacManRef.current.y) {
          setGameOver(true);
          return;
        }
      }

      // Toggle mouth animation
      mouthOpenRef.current = !mouthOpenRef.current;

      // Draw game
      drawGame(ctx);
    }, INITIAL_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver]);

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw dots
    ctx.fillStyle = '#FFF';
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (dotsRef.current[y]?.[x]) {
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw Pac-Man
    const pacMan = pacManRef.current;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    if (mouthOpenRef.current) {
      switch (directionRef.current) {
        case 'RIGHT':
          startAngle = 0.2 * Math.PI;
          endAngle = 1.8 * Math.PI;
          break;
        case 'LEFT':
          startAngle = 1.2 * Math.PI;
          endAngle = 0.8 * Math.PI;
          break;
        case 'UP':
          startAngle = 1.7 * Math.PI;
          endAngle = 1.3 * Math.PI;
          break;
        case 'DOWN':
          startAngle = 0.7 * Math.PI;
          endAngle = 0.3 * Math.PI;
          break;
      }
    }
    
    ctx.arc(
      pacMan.x * CELL_SIZE + CELL_SIZE / 2,
      pacMan.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      startAngle,
      endAngle
    );
    ctx.lineTo(
      pacMan.x * CELL_SIZE + CELL_SIZE / 2,
      pacMan.y * CELL_SIZE + CELL_SIZE / 2
    );
    ctx.fill();

    // Draw ghosts
    ghostsRef.current.forEach((ghost, index) => {
      ctx.fillStyle = GHOST_COLORS[index];
      ctx.beginPath();
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 2,
        ghost.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        Math.PI,
        0
      );
      ctx.lineTo(
        ghost.x * CELL_SIZE + CELL_SIZE - 2,
        ghost.y * CELL_SIZE + CELL_SIZE - 2
      );
      ctx.lineTo(
        ghost.x * CELL_SIZE + CELL_SIZE - 5,
        ghost.y * CELL_SIZE + CELL_SIZE / 2 + 3
      );
      ctx.lineTo(
        ghost.x * CELL_SIZE + CELL_SIZE / 2,
        ghost.y * CELL_SIZE + CELL_SIZE - 2
      );
      ctx.lineTo(
        ghost.x * CELL_SIZE + 5,
        ghost.y * CELL_SIZE + CELL_SIZE / 2 + 3
      );
      ctx.lineTo(ghost.x * CELL_SIZE + 2, ghost.y * CELL_SIZE + CELL_SIZE - 2);
      ctx.closePath();
      ctx.fill();

      // Ghost eyes
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 2 - 3,
        ghost.y * CELL_SIZE + CELL_SIZE / 2 - 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 2 + 3,
        ghost.y * CELL_SIZE + CELL_SIZE / 2 - 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted && !gameOver) {
        setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          nextDirectionRef.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          nextDirectionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          nextDirectionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          nextDirectionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  const handleRestart = () => {
    initializeGame();
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">PAC-MAN</h1>
      <div className="mb-4 text-2xl">Score: {score}</div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-4 border-blue-500 rounded"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded">
            <div className="text-center">
              <p className="text-xl mb-2">Press any arrow key to start</p>
              <p className="text-sm text-gray-400">Use arrow keys or WASD to move</p>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded">
            <div className="text-center">
              <p className="text-3xl mb-4 text-red-500">GAME OVER!</p>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-gray-400">
        <p>Eat all the dots and avoid the ghosts!</p>
      </div>
    </div>
  );
}

