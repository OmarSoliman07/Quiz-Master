/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 * 
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states
 * 
 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 * 
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */



// ============================================
// TODO: Get DOM Element References
// ============================================
// Use document.getElementById() and document.querySelector()
const quizForm = document.getElementById('quizOptions');
let playerNameInput = document.getElementById('playerName');
let categoryInput = document.getElementById('categoryMenu');
let difficultyOptions = document.getElementById('difficultyOptions');
let questionsNumber = document.getElementById('questionsNumber');
let startQuizBtn = document.getElementById('startQuiz');
let questionsContainer = document.getElementById('questionsContainer');
import Quiz from './Quiz.js';
import Question from './Question.js';


// ============================================
// TODO: Create variable to store current quiz
// ============================================
let currentQuiz = null;



// ============================================
// TODO: Create showLoading() function
// ============================================
// Set questionsContainer.innerHTML to loading HTML
// See index.html for the HTML structure
function showLoading() {
    questionsContainer.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading Questions...</p>
        </div>
    `;
}


// ============================================
// TODO: Create hideLoading() function
// ============================================
// Find and remove the loading overlay
function hideLoading() {
    const loadingOverlay = questionsContainer.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// ============================================
// TODO: Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()
function showError(message) {
    questionsContainer.innerHTML = `
        <div class="game-card error-card">
            <div class="error-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="error-title">Oops! Something went wrong</h3>
            <p class="error-message">${message}</p>
            <button class="btn-play retry-btn" id="retryBtn">
                <i class="fa-solid fa-rotate-right"></i> Try Again
            </button>
        </div>
    `;
    document.getElementById('retryBtn').addEventListener('click', resetToStart);
}


// ============================================
// TODO: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)
function validateForm() {
    const existingError = quizForm.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    let isValid = true;
    let error = null;
    const valueStr = questionsNumber.value.trim();

    if (valueStr === '') {
        isValid = false;
        error = 'Please enter the number of questions.';
    } else {
        const numQuestions = parseInt(valueStr, 10);
        
        if (isNaN(numQuestions)) {
            isValid = false;
            error = 'Please enter a valid number.';
        } else if (numQuestions < 1) {
            isValid = false;
            error = 'Minimum number of questions is 1.';
        } else if (numQuestions > 50) {
            isValid = false;
            error = 'Maximum number of questions is 50.';
        }
    }

    if (!isValid && error) {
        showFormError(error); 
    }

    return { isValid, error };
}


// ============================================
// TODO: Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect
function showFormError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    
    startQuizBtn.parentNode.insertBefore(errorDiv, startQuizBtn);

    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => errorDiv.remove(), 500);
    }, 3000);
}


// ============================================
// TODO: Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null
function resetToStart() {
    questionsContainer.innerHTML = '';
    quizForm.reset();
    quizForm.classList.remove('hidden');
    currentQuiz = null;
};


// ============================================
// TODO: Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
//
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message
async function startQuiz() {
    // 1. Validate the form
    const validation = validateForm();
    
    // 2. If not valid, show error and return
    if (!validation.isValid) {
        return;
    }

    // 3. Get form values
    const playerName = playerNameInput.value.trim() || 'Player';
    const category = categoryInput.value;
    const difficulty = difficultyOptions.value;
    const numberOfQuestions = parseInt(questionsNumber.value.trim(), 10);

    // 4. Create new Quiz instance 
    currentQuiz = new Quiz(playerName, category, difficulty, numberOfQuestions);

    // 5. Hide the form (add 'hidden' class)
    quizForm.classList.add('hidden');

    // 6. Show loading spinner
    showLoading();

    // 7. Try to fetch questions
    try {
        await currentQuiz.getQuestions();
        
        hideLoading();

        if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
            showError('No questions found for this setup. Try another category!');
            return;
        }

        const firstQuestion = new Question(currentQuiz, questionsContainer, resetToStart);
        firstQuestion.displayQuestion();

    } catch (error) {
        // 8. Catch any errors
        hideLoading();
        showError(error.message || 'Failed to load questions. Please check your connection.');
    }
}

// ============================================
// TODO: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()
startQuizBtn.addEventListener('click', function(e) {
    e.preventDefault();
    startQuiz();
});

questionsNumber.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        startQuiz();
    }
});

