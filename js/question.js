/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 */

export default class Question {
  
  // ============================================
  // TODO: Create constructor(quiz, container, onQuizEnd)
  // ============================================
  constructor(quiz, container, onQuizEnd) {
    // 1. Store the three parameters
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    // 2. Get question data
    this.questionData = quiz.getCurrentQuestion();

    // 3. Store index
    this.index = quiz.currentQuestionIndex;

    // 4 & 5. Decode text and store (and decode wrong answers)
    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.wrongAnswers = this.questionData.incorrect_answers.map(ans => this.decodeHtml(ans));

    // 6. Shuffle all answers
    this.allAnswers = this.shuffleAnswers();

    // 7. Initialize game state for this single question
    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 30; // Starts at 30 seconds

    this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
  }

  // ============================================
  // TODO: Create decodeHtml(html) method
  // ============================================
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.documentElement.textContent;
  }

  // ============================================
  // TODO: Create shuffleAnswers() method
  // ============================================
  shuffleAnswers() {
    // 1. Combine wrongAnswers and correctAnswer into one array
    const array = [this.correctAnswer, ...this.wrongAnswers];

    // 2. Shuffle using Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    // 3. Return shuffled array
    return array;
  }

  // ============================================
  // TODO: Create getProgress() method
  // ============================================
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  // ============================================
  // TODO: Create displayQuestion() method
  // ============================================
  displayQuestion() {
    const progressPercent = this.getProgress();

    // 1 & 2 & 3. Render the question HTML structure using template literals
    this.container.innerHTML = `
      <div class="game-card question-card">
        
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty ${this.quiz.difficulty}">
            <i class="fa-solid fa-face-smile"></i>
            <span>${this.quiz.difficulty}</span>
          </div>
          <div class="stat-badge timer" id="timerBadge">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid" id="answersGrid">
          ${this.allAnswers.map((answer, i) => `
            <button class="answer-btn" data-answer="${answer.replace(/"/g, '&quot;')}">
              <span class="answer-key">${i + 1}</span>
              <span class="answer-text">${answer}</span>
            </button>
          `).join('')}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    // 4. Call this.addEventListeners()
    this.addEventListeners();

    // 5. Call this.startTimer()
    this.startTimer();
  }

  // ============================================
  // TODO: Create addEventListeners() method
  // ============================================
  addEventListeners() {
    // 1 & 2. Click events for options
    const answerButtons = this.container.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.checkAnswer(button);
      });
    });

    // 3. Keyboard support
    document.addEventListener('keydown', this.handleKeyboardInput);
  }

  handleKeyboardInput(e) {
    const validKeys = ['1', '2', '3', '4'];
    if (validKeys.includes(e.key) && !this.answered) {
      const buttonIndex = parseInt(e.key, 10) - 1;
      const answerButtons = this.container.querySelectorAll('.answer-btn');
      if (answerButtons[buttonIndex]) {
        this.checkAnswer(answerButtons[buttonIndex]);
      }
    }
  }

  // ============================================
  // TODO: Create removeEventListeners() method
  // ============================================
  removeEventListeners() {
    document.removeEventListener('keydown', this.handleKeyboardInput);
  }

  // ============================================
  // TODO: Create startTimer() method
  // ============================================
  startTimer() {
    const timerBadge = this.container.querySelector('#timerBadge');
    const timerValue = this.container.querySelector('.timer-value');

    this.timerInterval = setInterval(() => {
      // Decrement time
      this.timeRemaining--;

      // Update display
      if (timerValue) timerValue.textContent = this.timeRemaining;

      // Add 'warning' class if <= 10 seconds
      if (this.timeRemaining <= 10 && timerBadge) {
        timerBadge.classList.add('warning');
      }

      // If time runs out
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  // ============================================
  // TODO: Create stopTimer() method
  // ============================================
  stopTimer() {
    clearInterval(this.timerInterval);
  }

  // ============================================
  // TODO: Create handleTimeUp() method
  // ============================================
  handleTimeUp() {
    // 1. Set answered = true
    this.answered = true;

    // 2. Call removeEventListeners()
    this.removeEventListeners();

    // 3 & 4. Highlight correct answer & show Time's Up message
    this.highlightCorrectAnswer();

    const card = this.container.querySelector('.question-card');
    const timeUpDiv = document.createElement('div');
    timeUpDiv.className = 'time-up-message';
    timeUpDiv.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
    
    const grid = this.container.querySelector('#answersGrid');
    if (grid) grid.parentNode.insertBefore(timeUpDiv, grid);

    // Disable all buttons
    const answerButtons = this.container.querySelectorAll('.answer-btn');
    answerButtons.forEach(b => b.classList.add('disabled'));

    // 5. Call animateQuestion() after delay
    this.animateQuestion(500); // 500ms duration for transition
  }

  // ============================================
  // TODO: Create checkAnswer(choiceElement) method
  // ============================================
  checkAnswer(choiceElement) {
    // 1. If already answered, return early
    if (this.answered) return;

    // 2. Set answered = true
    this.answered = true;

    // 3. Stop the timer
    this.stopTimer();

    // 4. Remove key listeners
    this.removeEventListeners();

    // 5. Get selected answer
    const selectedAnswer = choiceElement.getAttribute('data-answer');

    // 6 & 7. Compare answers (case insensitive)
    if (selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase()) {
      choiceElement.classList.add('correct');
      this.quiz.incrementScore();
      const scoreDisplay = this.container.querySelector('.score-item-value');
      if (scoreDisplay) scoreDisplay.textContent = this.quiz.score;
    } else {
      choiceElement.classList.add('wrong');
      this.highlightCorrectAnswer();
    }

    // 8. Disable other buttons
    const answerButtons = this.container.querySelectorAll('.answer-btn');
    answerButtons.forEach(b => {
      if (b !== choiceElement && !b.classList.contains('correct-reveal')) {
        b.classList.add('disabled');
      }
    });

    // 9. Call animateQuestion()
    this.animateQuestion(500);
  }

  // ============================================
  // TODO: Create highlightCorrectAnswer() method
  // ============================================
  highlightCorrectAnswer() {
    const answerButtons = this.container.querySelectorAll('.answer-btn');
    answerButtons.forEach(b => {
      const currentAns = b.getAttribute('data-answer');
      if (currentAns && currentAns.toLowerCase() === this.correctAnswer.toLowerCase()) {
        b.classList.add('correct-reveal');
      }
    });
  }

  // ============================================
  // TODO: Create getNextQuestion() method
  // ============================================
  getNextQuestion() {
    // 1. Call quiz.nextQuestion()
    const hasMore = this.quiz.nextQuestion();

    // 2. If returns true: create new Question and display it
    if (hasMore) {
      const nextQ = new Question(this.quiz, this.container, this.onQuizEnd);
      nextQ.displayQuestion();
    } 
    // 3. If returns false: show results using quiz.endQuiz()
    else {
      this.container.innerHTML = this.quiz.endQuiz();
      
      // Add click listener to Play Again button
      const playAgainBtn = document.getElementById('playAgainBtn');
      if (playAgainBtn) {
        playAgainBtn.addEventListener('click', this.onQuizEnd);
      }
    }
  }

  // ============================================
  // TODO: Create animateQuestion(duration) method
  // ============================================
  animateQuestion(duration) {
    // 1. Wait for 1500ms (transition delay)
    setTimeout(() => {
      const card = this.container.querySelector('.question-card');
      
      // 2. Add 'exit' class to question card
      if (card) card.classList.add('exit');

      // 3. Wait for duration then load next question
      setTimeout(() => {
        this.getNextQuestion();
      }, duration);

    }, 1500);
  }
}