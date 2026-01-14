export class Card {
    constructor(emoji, index) {
        this.emoji = emoji;
        this.index = index;
        this.isFlipped = false;
        this.isMatched = false;
        this.element = null;
        
        this.createElement();
    }
    
    createElement() {
        const template = document.getElementById('card-template');
        if (!template) {
            console.error('Card template not found');
            return;
        }
        const cardElement = template.content.cloneNode(true).querySelector('.game_card');
        
        cardElement.dataset.index = this.index;
        cardElement.dataset.emoji = this.emoji;
        
        const cardBack = cardElement.querySelector('.card_back');
        if (cardBack) {
            cardBack.textContent = this.emoji;
        }
        
        this.element = cardElement;
    }
    
    flip() {
        if (this.isFlipped || this.isMatched) return;
        
        this.isFlipped = true;
        this.element.classList.add('flipped');
    }
    
    flipBack() {
        if (!this.isFlipped || this.isMatched) return;
        
        this.isFlipped = false;
        this.element.classList.remove('flipped');
    }
    
    markMatched() {
        this.isMatched = true;
        this.element.classList.add('matched');
    }
    
    canFlip() {
        return !this.isFlipped && !this.isMatched;
    }
    
    reset() {
        this.isFlipped = false;
        this.isMatched = false;
        this.element.classList.remove('flipped', 'matched');
    }
}
