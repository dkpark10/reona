import { component, html, createComponent } from 'reona';
import Timer from './timer';
import './styles/index.css';

export default component({
  name: 'tic-tac-toe',

  data() {
    return {
      trigger: false,
      board: ['', '', '', '', '', '', '', '', ''],
      currentPlayer: 'X',
      winner: '',
    }
  },

  methods: {
    reset() {
      this.trigger =  false;
      this.board = ['', '', '', '', '', '', '', '', ''];
      this.currentPlayer = 'X';
      this.winner= '';
    },

    handleClick(index: number) {
      if (!this.trigger) {
        this.trigger = true;
      }

      if (this.board[index] || this.winner) return;

      const newBoard = [...this.board];
      newBoard[index] = this.currentPlayer;
      this.board = newBoard;

      if (this.checkWinner()) {
        this.winner = this.currentPlayer;
        return;
      }

      if (this.board.every((cell) => cell !== '')) {
        this.winner = 'Draw';
        return;
      }

      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    },

    checkWinner() {
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

      return wins.some((pattern) => {
        const [a, b, c] = pattern;
        return (
          this.board[a] &&
          this.board[a] === this.board[b] &&
          this.board[a] === this.board[c]
        );
      });
    },
  },

  template() {
    return html`
      <div class="container">
        <header>
        <h1>Tic Tac Toe</h1>
          ${createComponent(Timer, {
            props: {
              beginCountTrigger: this.trigger,
            },
          })}
        </header>
        <ul class="board">
          ${this.board.map((cell, index) => 
            html`<li @click=${() => this.handleClick(index)} class="cell">${cell}</li>`)
          }
        </ul>
        <footer>
          <button class="reset" type="button" @click=${this.reset}>다시 시작하기</button>
        </footer>
      </div>
    `;
  },
});
