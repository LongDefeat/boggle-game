"use strict";

class BoggleGame {
  /* make a new game */

  constructor(boardId, seconds = 60) {
    this.seconds = seconds; // timer for game
    this.showTimer();
    this.score = 0;
    this.board = $("#" + boardId);
    this.words = [];

    // every 1000 milliseconds, a "tick"
    this.timer = setInterval(this.tick.bind(this), 1000);
    $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
  }
  /* will show word in list of words */
  showWord(word) {
    $(".words", this.board).append($("<li>", { text: word }));
  }

  /* show score in html */
  showScore() {
    $(".score", this.board).text(this.score);
  }
  /* Show status message */
  showMessage(msg, cls) {
    $(".msg", this.board).text(msg).removeClass().addClass(`msg ${cls}`);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return;

    if (this.words.includes(word)) {
      this.showMessage(`Already found ${word}`, "err");
      return;
    }
    // check server for validity
    const res = await axios.get("/check-word", { params: { word: word } });
    if (res.data.result === "not-word") {
      this.showMessage(`${word} is not a valid English word`, "err");
    } else if (res.data.result === "not-on-board") {
      this.showMessage(`${word} is not valid on this game board`);
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      this.words.push(word);
      this.showMessage(`Added ${word}`, "ok");
    }
    $word.val("").focus();
  }
  /* Updates the timer in the DOM */
  showTimer() {
    $(".timer", this.board).text(this.seconds);
  }
  async tick() {
    this.seconds -= 1;
    this.showTimer();

    if (this.seconds === 0) {
      clearInterval(this.timer);
      this.seconds;
    }
  }
  /* end of game: show score and update message */
  async scoreGame() {
    $(".add-word", this.board).hide();
    const res = await axios.post("/post-score", { score: this.score });
    if (res.data.brokeRecord) {
      this.showMessage(`Your new record: ${this.score}`, "ok");
    } else {
      this.showMessage(`Your final score: ${this.score}`, "ok");
    }
  }
}
