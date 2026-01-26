import { html, state, createComponent } from 'reona';
import Timer from './timer';
import './styles/index.css';

export default function TicTacToe() {
  const data = state({
    trigger: false,
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    winner: '',
    winTile: [] as number[],
  });

  const reset = () => {
    data.trigger = false;
    data.board = ['', '', '', '', '', '', '', '', ''];
    data.currentPlayer = 'X';
    data.winner = '';
    data.winTile = [];
  };

  const handleClick = (index: number) => {
    if (!data.trigger) {
      data.trigger = true;
    }

    if (data.board[index] || data.winner) return;

    const newBoard = [...data.board];
    newBoard[index] = data.currentPlayer;
    data.board = newBoard;

    const gameResult = checkWinner()
    if (gameResult?.isEndGame) {
      data.winner = data.currentPlayer;
      data.winTile = gameResult.lines;
      data.trigger = false;
      return;
    }

    if (data.board.every((cell) => cell !== '')) {
      data.winner = 'Draw';
      return;
    }

    data.currentPlayer = data.currentPlayer === 'X' ? 'O' : 'X';
  };

  const checkWinner = () => {
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return wins.map((pattern, idx) => {
      const [a, b, c] = pattern;
      const result = (
        data.board[a] &&
        data.board[a] === data.board[b] &&
        data.board[a] === data.board[c]
      );

      if (result) {
        return {
          isEndGame: true,
          lines: wins[idx],
        }
      }
      return null
    }).find((item) => !!item);
  };

  const getClassWinTile = (index: number) => data.winTile.includes(index) ? 'win' : '';

  return html`
    <div class="container">
      <header>
      <h1>Tic Tac Toe</h1>
        ${createComponent(Timer, {
          props: {
            beginCountTrigger: data.trigger,
          },
        })}
      </header>
      <ul class="board">
        ${data.board.map((cell, idx) => 
          html`
            <li>
              <button ${data.winner ? 'disabled' : ''} @click=${() => handleClick(idx)} class="cell ${getClassWinTile(idx)}">
                ${cell}
              </button>
            </li>`)
        }
      </ul>
      <footer>
        <button class="reset" type="button" @click=${reset}>다시 시작하기</button>
      </footer>
    </div>
  `;
}
