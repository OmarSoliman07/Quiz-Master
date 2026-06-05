/**
 * ============================================
 * QUIZ CLASS
 * ============================================
 * 
 * This class manages the entire quiz game state.
 * 
 * PROPERTIES TO CREATE:
 * - category (string) - The selected category ID
 * - difficulty (string) - easy, medium, or hard
 * - numberOfQuestions (number) - How many questions
 * - playerName (string) - The player's name
 * - score (number) - Current score, starts at 0
 * - questions (array) - Questions from API, starts empty
 * - currentQuestionIndex (number) - Which question we're on, starts at 0
 * 
 * METHODS TO IMPLEMENT:
 * - constructor(category, difficulty, numberOfQuestions, playerName)
 * - async getQuestions() - Fetch questions from API
 * - buildApiUrl() - Create the API URL with parameters
 * - incrementScore() - Add 1 to score
 * - getCurrentQuestion() - Get the current question object
 * - nextQuestion() - Move to next question, return true/false
 * - isComplete() - Check if quiz is finished
 * - getScorePercentage() - Calculate percentage (0-100)
 * - saveHighScore() - Save to localStorage
 * - getHighScores() - Load from localStorage
 * - isHighScore() - Check if current score qualifies
 * - endQuiz() - Generate results screen HTML
 * 
 */


export default class Quiz {
  
  // TODO: Create constructor
  // Initialize all properties mentioned above
  constructor(playerName, category, difficulty, numberOfQuestions) {
    this.playerName = playerName;
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  } 
  
  
  // TODO: Create async getQuestions() method
  // 1. Build the API URL using buildApiUrl()
  // 2. Use fetch() to get data
  // 3. Check if response.ok, throw error if not
  // 4. Parse JSON: const data = await response.json()
  // 5. Check if data.response_code === 0 (success)
  // 6. Store data.results in this.questions
  // 7. Return this.questions

    async getQuestions() {
    // 1. Build the API URL using buildApiUrl()
    const url = this.buildApiUrl();

    // 2. Use fetch() to get data
    const response = await fetch(url);

    // 3. Check if response.ok, throw error if not
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 4. Parse JSON
    const data = await response.json();

    // 5. Check if data.response_code === 0 (success)
    if (data.response_code === 0) {
      // 6. Store data.results in this.questions
      this.questions = data.results;
      // 7. Return this.questions
      return this.questions;
    } else {
      throw new Error('No questions found. Try changing your setup.');
    }
  }
  
  
  // TODO: Create buildApiUrl() method
  // Use URLSearchParams to build query string
  // Example result: "https://opentdb.com/api.php?amount=10&difficulty=easy"
  buildApiUrl() {
    const baseUrl = 'https://opentdb.com/api.php';
    const params = new URLSearchParams({
      amount: this.numberOfQuestions,
      type: 'multiple'
    });

    if (this.category) params.append('category', this.category);
    if (this.difficulty) params.append('difficulty', this.difficulty);

    return `${baseUrl}?${params.toString()}`;
  }
  
  
  // TODO: Create incrementScore() method
  // Simply add 1 to this.score
  incrementScore() {
    this.score += 1;
  }
  
  
  // TODO: Create getCurrentQuestion() method
  // Return this.questions[this.currentQuestionIndex]
  // Return null if index is out of bounds
  getCurrentQuestion() {
    if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }

  // TODO: Create nextQuestion() method
  // Increment currentQuestionIndex
  // Return true if there are more questions
  // Return false if quiz is complete
  nextQuestion() {
    this.currentQuestionIndex += 1;
    return this.currentQuestionIndex < this.questions.length;
  }
  
  
  // TODO: Create isComplete() method
  // Return true if currentQuestionIndex >= questions.length
  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }
  
  
  // TODO: Create getScorePercentage() method
  // Calculate: (score / numberOfQuestions) * 100
  // Round to whole number using Math.round()
  getScorePercentage() {
    if (this.numberOfQuestions === 0) return 0;
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }
  
  
  // TODO: Create saveHighScore() method
  // 1. Get existing high scores using getHighScores()
  // 2. Create new score object: { name, score, total, percentage, difficulty, date }
  // 3. Push to array
  // 4. Sort by percentage (highest first)
  // 5. Keep only top 10
  // 6. Save to localStorage using JSON.stringify()
  saveHighScore() {
    const highScores = this.getHighScores();
  const newScoreObj = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toLocaleDateString()
    };

    highScores.push(newScoreObj);

    highScores.sort((a, b) => b.percentage - a.percentage);

    const topScores = highScores.slice(0, 10);

    localStorage.setItem('quizHighScores', JSON.stringify(topScores));
  }
  
  // TODO: Create getHighScores() method
  // 1. Get from localStorage using 'quizHighScores' key
  // 2. Parse JSON
  // 3. Return array (or empty array if nothing saved)
  // Wrap in try/catch for safety
  getHighScores() {
    try {
      const scores = localStorage.getItem('quizHighScores');
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.error('Error loading high scores:', error);
      return [];
    }
  }
  
  
  // TODO: Create isHighScore() method
  // Return true if:
  // - Less than 10 saved, OR
  // - Current percentage beats the lowest saved score
  isHighScore() {
    const highScores = this.getHighScores();
    const currentPercentage = this.getScorePercentage();

    if (highScores.length < 10) return true;
    
    const lowestScore = highScores[highScores.length - 1].percentage;
    return currentPercentage > lowestScore;
  }
  
  
  // TODO: Create endQuiz() method
  // 1. Calculate percentage
  // 2. Check if it's a high score
  // 3. If yes, save it (BEFORE getting high scores for display)
  // 4. Get high scores (AFTER saving)
  // 5. Return HTML string for results screen
  //    (See index.html for the HTML structure to use)
 endQuiz() {
    // 1. Calculate percentage
    const percentage = this.getScorePercentage();
    
    const hasNewRecord = this.isHighScore();

    this.saveHighScore();

    const highScores = this.getHighScores();

    let leaderboardItemsHTML = '';
    highScores.forEach((entry, index) => {
      let rankClass = '';
      if (index === 0) rankClass = 'gold';
      else if (index === 1) rankClass = 'silver';
      else if (index === 2) rankClass = 'bronze';

      leaderboardItemsHTML += `
        <li class="leaderboard-item ${rankClass}">
          <span class="leaderboard-rank">#${index + 1}</span>
          <span class="leaderboard-name">${entry.name}</span>
          <span class="leaderboard-score">${entry.percentage}%</span>
        </li>
      `;
    });

    // 5. Return HTML string for results screen
    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>
        
        ${hasNewRecord ? `
        <div class="new-record-badge">
          <i class="fa-solid fa-star"></i> New High Score!
        </div>
        ` : ''}
        
        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${leaderboardItemsHTML}
          </ul>
        </div>
        
        <div class="action-buttons">
          <button class="btn-restart" id="playAgainBtn">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }}