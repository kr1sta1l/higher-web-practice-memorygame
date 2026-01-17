import { Card } from './components/card.js';

const CARD_EMOJIS = [
    '🎁', '🎄', '🎅', '⛄', '❄️', '🌟', 
    '🔔', '🕯️', '🎊', '🎉', '🍪', '🥛',
    '🧦', '🦌', '🎀', '🛷', '☃️', '🌲',
    '🎈', '🍰', '🍷', '🧸', '📦', '🎪'
];

const GAME_CONFIG = {
    easy: {
        pairs: 6,
        attempts: 24,
        time: 120
    },
    medium: {
        pairs: 8,
        attempts: 28,
        time: 180
    },
    hard: {
        pairs: 12,
        attempts: 36,
        time: 180
    }
};

class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.gameMode = 'common';
        this.difficulty = 'easy';
        this.isGameActive = false;
        this.canFlip = true;
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        this.gameContainer = document.querySelector('.game_container');
        this.cardsContainer = document.querySelector('.cards_grid');
        this.statsContainer = document.querySelector('.game_stats');
        this.attemptsDisplay = document.querySelector('.attempts_count');
        this.timeDisplay = document.querySelector('.time_count');
        this.pairsDisplay = document.querySelector('.pairs_count');
        this.modeCounter = document.getElementById('mode-counter');
        this.startButton = document.getElementById('start-game');
        
        if (!this.cardsContainer) {
            return;
        }
        
        this.updateMainMenuCounters();
        this.updateStartButton();
    }
    
    updateMainMenuCounters() {
        if (!this.modeCounter) return;
        
        const gameMode = this.getSelectedGameMode();
        const difficulty = this.getSelectedDifficulty();
        const config = GAME_CONFIG[difficulty];
        
        if (gameMode === 'attempts') {
            this.modeCounter.textContent = `Попыток: ${config.attempts}`;
            this.modeCounter.style.display = 'block';
        } else if (gameMode === 'time') {
            const minutes = Math.floor(config.time / 60);
            const seconds = config.time % 60;
            this.modeCounter.textContent = `Время: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.modeCounter.style.display = 'block';
        } else {
            this.modeCounter.style.display = 'none';
        }
    }
    
    getSelectedDifficulty() {
        const difficultySelector = document.querySelector('[data-selector="difficulty"]');
        if (!difficultySelector) return 'easy';
        
        const difficultyValue = difficultySelector.querySelector('.list_selector-value').textContent;
        
        if (difficultyValue === 'Средний') return 'medium';
        if (difficultyValue === 'Сложный') return 'hard';
        return 'easy';
    }
    
    updateStartButton() {
        if (!this.startButton) return;
        const gameMode = this.getSelectedGameMode();
        const difficulty = this.getSelectedDifficulty();
        this.startButton.disabled = !gameMode || !difficulty;
    }
    
    startGame(mode, difficulty) {
        this.gameMode = mode;
        this.difficulty = difficulty;
        this.matchedPairs = 0;
        this.attempts = 0;
        this.flippedCards = [];
        this.isGameActive = false;
        this.canFlip = true;
        this.startTime = null;

        const config = GAME_CONFIG[difficulty];
        this.totalPairs = config.pairs;

        if (this.cardsContainer) {
            this.cardsContainer.className = 'cards_grid ' + difficulty;
        }

        if (mode === 'attempts') {
            this.maxAttempts = config.attempts;
            this.timeLeft = null;
        } else if (mode === 'time') {
            this.timeLeft = config.time;
            this.maxAttempts = null;
        } else {
            this.timeLeft = null;
            this.maxAttempts = null;
        }
        
        this.generateCards();
        this.updateStats();
        this.showGameView();
    }
    
    generateCards() {
        const config = GAME_CONFIG[this.difficulty];
        const cardValues = [];
        
        const selectedEmojis = CARD_EMOJIS.slice(0, config.pairs);
        selectedEmojis.forEach(emoji => {
            cardValues.push(emoji);
            cardValues.push(emoji);
        });
        
        this.shuffleArray(cardValues);
        
        this.cardsContainer.innerHTML = '';
        this.cards = [];
        
        cardValues.forEach((emoji, index) => {
            const card = new Card(emoji, index);
            card.element.addEventListener('click', () => this.handleCardClick(card));
            this.cards.push(card);
            this.cardsContainer.appendChild(card.element);
        });
    }
    
    handleCardClick(card) {
        if (!this.canFlip) return;
        
        if (!card.canFlip()) return;
        
        if (this.flippedCards.length >= 2) return;
        
        if (!this.isGameActive) {
            this.isGameActive = true;
            this.startTime = Date.now();
            
            if (this.gameMode === 'attempts') {
                this.startCommonTimer();
            } else if (this.gameMode === 'time') {
                this.startTimer();
            } else {
                this.startCommonTimer();
            }
        }
        
        card.flip();
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            card1.markMatched();
            card2.markMatched();
            
            this.matchedPairs++;
            this.updateStats();
            
            if (this.matchedPairs === this.totalPairs) {
                this.endGame(true);
                return;
            }
        } else {
            card1.flipBack();
            card2.flipBack();
        }

        this.attempts++;
        this.updateStats();

        if (this.gameMode === 'attempts' && this.attempts >= this.maxAttempts) {
            this.endGame(false);
            return;
        }

        this.flippedCards = [];
        this.canFlip = true;
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            if (!this.isGameActive) {
                clearInterval(this.timer);
                return;
            }

            this.timeLeft--;
            this.updateStats();
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    startCommonTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            if (!this.isGameActive) {
                clearInterval(this.timer);
                return;
            }
            
            this.updateStats();
        }, 1000);
    }

    updateStats() {
        if (this.pairsDisplay) {
            this.pairsDisplay.textContent = `${this.matchedPairs} / ${this.totalPairs}`;
        }
        
        if (this.attemptsDisplay) {
            if (this.gameMode === 'attempts') {
                const remaining = this.maxAttempts - this.attempts;
                this.attemptsDisplay.textContent = remaining > 0 ? remaining : 0;
            } else if (this.gameMode === 'time') {
                this.attemptsDisplay.textContent = this.attempts;
            } else {
                this.attemptsDisplay.textContent = this.attempts;
            }
        }
        
        if (this.timeDisplay) {
            if (this.gameMode === 'time' && this.timeLeft !== null) {
                const minutes = Math.floor(this.timeLeft / 60);
                const seconds = this.timeLeft % 60;
                this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else if ((this.gameMode === 'common' || this.gameMode === 'attempts') && this.startTime) {
                const elapsed = this.calculateGameTime();
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                this.timeDisplay.textContent = '—';
            }
        }
    }
    
    endGame(isWin) {
        this.isGameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const gameTime = this.calculateGameTime();
        let timeToSave = gameTime;
        if (this.gameMode === 'time' && isWin && this.timeLeft !== null) {
            timeToSave = this.timeLeft;
        }
        
        const result = {
            win: isWin,
            mode: this.gameMode,
            difficulty: this.difficulty,
            attempts: this.attempts,
            time: timeToSave,
            pairs: this.matchedPairs,
            totalPairs: this.totalPairs,
            date: new Date().toISOString()
        };
        
        if (isWin) {
            this.saveResult(result);
        }
        this.showResultModal(result);
        setTimeout(() => {
            this.displayResults();
        }, 100);
    }
    
    calculateGameTime() {
        if (this.startTime) {
            return Math.floor((Date.now() - this.startTime) / 1000);
        }
        return 0;
    }
    
    saveResult(result) {
        const allResults = this.getAllResults();
        allResults.push(result);
        
        if (allResults.length > 1000) {
            allResults.shift();
        }
        
        localStorage.setItem('memoryGameResults', JSON.stringify(allResults));
    }
    
    getAllResults() {
        const stored = localStorage.getItem('memoryGameResults');
        return stored ? JSON.parse(stored) : [];
    }
    
    getSelectedGameMode() {
        const gameModeSelector = document.querySelector('[data-selector="game-mode"]');
        if (!gameModeSelector) return 'common';
        
        const modeValue = gameModeSelector.querySelector('.list_selector-value').textContent;
        
        if (modeValue === 'На попытки') return 'attempts';
        if (modeValue === 'На время') return 'time';
        return 'common';
    }
    
    displayResults() {
        const resultsList = document.getElementById('results-list');
        if (!resultsList) return;
        
        while (resultsList.firstChild) {
            resultsList.removeChild(resultsList.firstChild);
        }
        
        const allResults = this.getAllResults();
        const selectedMode = this.getSelectedGameMode();
        const selectedDifficulty = this.getSelectedDifficulty();
        
        let filteredResults = allResults.filter(result => 
            result.mode === selectedMode && result.difficulty === selectedDifficulty
        );
        
        if (filteredResults.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no_results base_text';
            noResultsDiv.textContent = 'Пока нет результатов';
            resultsList.appendChild(noResultsDiv);
            return;
        }
        
        const sortedResults = filteredResults.sort((a, b) => {
            if (selectedMode === 'time') {
                if (b.time !== a.time) {
                    return b.time - a.time;
                }
            } else if (selectedMode === 'attempts') {
                if (a.attempts !== b.attempts) {
                    return a.attempts - b.attempts;
                }
            } else if (selectedMode === 'common') {
                if (a.time !== b.time) {
                    return a.time - b.time;
                }
            }
            
            return new Date(b.date) - new Date(a.date);
        });
        
        const topResults = sortedResults.slice(0, 10);
        
        const modeNames = {
            'common': 'Обычный',
            'attempts': 'На попытки',
            'time': 'На время'
        };
        
        const difficultyNames = {
            'easy': 'Легкий',
            'medium': 'Средний',
            'hard': 'Сложный'
        };
        
        const template = document.getElementById('result-item-template');
        if (!template) return;
        
        topResults.forEach(result => {
            const date = new Date(result.date);
            const dateStr = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const minutes = Math.floor(result.time / 60);
            const seconds = result.time % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const resultItem = template.content.cloneNode(true);
            
            resultItem.querySelector('.result_date').textContent = dateStr;
            resultItem.querySelector('.result_mode').textContent = modeNames[result.mode];
            
            const timeSpan = resultItem.querySelector('.result_time');
            timeSpan.textContent = result.mode === 'time' 
                ? `Осталось времени: ${timeStr}` 
                : `Время: ${timeStr}`;
            
            resultItem.querySelector('.result_attempts').textContent = `Попыток: ${result.attempts}`;
            
            resultsList.appendChild(resultItem);
        });
    }
    
    showGameView() {
        const mainMenu = document.querySelector('.main_menu_container');
        const gameView = document.querySelector('.game_container');
        
        if (mainMenu) mainMenu.style.display = 'none';
        if (gameView) gameView.style.display = 'flex';
    }
    
    showMainMenu() {
        const mainMenu = document.querySelector('.main_menu_container');
        const gameView = document.querySelector('.game_container');
        
        if (mainMenu) mainMenu.style.display = 'flex';
        if (gameView) gameView.style.display = 'none';
        
        this.reset();
        this.displayResults();
    }
    
    restartGame() {
        if (!this.gameMode || !this.difficulty) return;
        
        this.reset();
        this.startGame(this.gameMode, this.difficulty);
    }
    
    showResultModal(result) {
        const modal = document.querySelector('.result_modal');
        const modalOverlay = document.querySelector('.modal_overlay');
        
        if (!modal || !modalOverlay) return;
        
        const resultText = document.querySelector('.result_text');
        const resultDetails = document.querySelector('.result_details');
        
        if (resultText) {
            resultText.textContent = result.win ? 'Поздравляем! Вы выиграли!' : 'Игра окончена';
        }
        
        if (resultDetails) {
            let details = `Найдено пар: ${result.pairs} / ${result.totalPairs}\n`;
            details += `Попыток: ${result.attempts}\n`;
            
            const minutes = Math.floor(result.time / 60);
            const seconds = result.time % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (result.mode === 'time') {
                details += `Осталось времени: ${timeStr}\n`;
            } else {
                details += `Время: ${timeStr}\n`;
            }
            
            const bestTime = this.getBestTime(result.mode, result.difficulty);
            if (bestTime !== null) {
                const bestMinutes = Math.floor(bestTime / 60);
                const bestSeconds = bestTime % 60;
                const bestTimeStr = `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}`;
                details += `Лучшее время: ${bestTimeStr}`;
            }
            
            resultDetails.textContent = details;
        }
        
        modalOverlay.classList.add('active');
        modal.classList.add('active');
    }
    
    getBestTime(mode, difficulty) {
        const allResults = this.getAllResults();
        const filteredResults = allResults.filter(result => 
            result.mode === mode && 
            result.difficulty === difficulty && 
            result.win
        );
        
        if (filteredResults.length === 0) {
            return null;
        }
        
        if (mode === 'time') {
            return Math.max(...filteredResults.map(result => result.time));
        } else {
            return Math.min(...filteredResults.map(result => result.time));
        }
    }
    
    shuffleArray(array) {
        const indices = [];
        for (let i = array.length - 1; i > 0; i--) {
            indices.push(i);
        }
        for (const i of indices) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    reset() {
        this.isGameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.timeLeft = 0;
        this.startTime = null;
        this.canFlip = true;
        
        if (this.cardsContainer) {
            this.cardsContainer.innerHTML = '';
            this.cardsContainer.className = 'cards_grid';
        }
    }
}

let gameInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    gameInstance = new MemoryGame();
    gameInstance.displayResults();
    
    const gameModeSelector = document.querySelector('[data-selector="game-mode"]');
    if (gameModeSelector) {
        gameModeSelector.addEventListener('change', function() {
            if (gameInstance) {
                gameInstance.updateMainMenuCounters();
                gameInstance.updateStartButton();
                gameInstance.displayResults();
            }
        });
    }
    
    const difficultySelector = document.querySelector('[data-selector="difficulty"]');
    if (difficultySelector) {
        difficultySelector.addEventListener('change', function() {
            if (gameInstance) {
                gameInstance.updateMainMenuCounters();
                gameInstance.updateStartButton();
                gameInstance.displayResults();
            }
        });
    }
    
    const startButton = document.getElementById('start-game');
    if (startButton) {
        startButton.addEventListener('click', function() {
            const gameModeSelector = document.querySelector('[data-selector="game-mode"]');
            const difficultySelector = document.querySelector('[data-selector="difficulty"]');
            
            const gameModeValue = gameModeSelector.querySelector('.list_selector-value').textContent;
            const difficultyValue = difficultySelector.querySelector('.list_selector-value').textContent;
            
            let mode = 'common';
            if (gameModeValue === 'На попытки') mode = 'attempts';
            else if (gameModeValue === 'На время') mode = 'time';
            
            let difficulty = 'easy';
            if (difficultyValue === 'Средний') difficulty = 'medium';
            else if (difficultyValue === 'Сложный') difficulty = 'hard';
            
            gameInstance.startGame(mode, difficulty);
        });
    }
    
    const restartButton = document.getElementById('restart-game');
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            if (gameInstance) {
                gameInstance.restartGame();
            }
        });
    }
    
    const changeModeButton = document.getElementById('change-mode');
    if (changeModeButton) {
        changeModeButton.addEventListener('click', function() {
            if (gameInstance) {
                gameInstance.showMainMenu();
            }
        });
    }
    
    const closeModalBtn = document.querySelector('.modal_close');
    const modalOverlay = document.querySelector('.modal_overlay');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
            }
            const modal = document.querySelector('.result_modal');
            if (modal) {
                modal.classList.remove('active');
            }
            
            const mainMenu = document.querySelector('.main_menu_container');
            const gameView = document.querySelector('.game_container');
            
            if (mainMenu) mainMenu.style.display = 'flex';
            if (gameView) gameView.style.display = 'none';
            
            if (gameInstance) {
                gameInstance.reset();
                gameInstance.displayResults();
            }
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
                const modal = document.querySelector('.result_modal');
                if (modal) {
                    modal.classList.remove('active');
                }
                
                const mainMenu = document.querySelector('.main_menu_container');
                const gameView = document.querySelector('.game_container');
                
                if (mainMenu) mainMenu.style.display = 'flex';
                if (gameView) gameView.style.display = 'none';
                
                if (gameInstance) {
                    gameInstance.reset();
                    gameInstance.displayResults();
                }
            }
        });
    }
});
