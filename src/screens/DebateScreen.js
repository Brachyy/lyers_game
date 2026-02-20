/**
 * LYERS GAME - Debate Screen
 * Phase de débat avec timer et lecture des réponses
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { speakAnswer, stopSpeaking, isSpeechSupported } from '../utils/speech.js';
import { confirmVibration, alertVibration } from '../utils/haptics.js';

export class DebateScreen {
  constructor(data = {}) {
    this.data = data;
    this.timeRemaining = gameState.timerDuration;
    this.timerInterval = null;
    this.isPaused = false;
    this.shuffledAnswers = [];
    this.isSpeaking = false;
    this.isEnded = false;
    
    // Bind methods to preserve context
    this.tick = this.tick.bind(this);
  }

  onMount() {
    // Mélanger les réponses
    this.shuffledAnswers = gameState.getShuffledAnswers();
    
    // Démarrer le timer
    this.startTimer();
    
    this.updateDisplay();
  }

  cleanup() {
    // Marquer comme terminé pour éviter les appels multiples
    this.isEnded = true;
    
    // Arrêter le timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    stopSpeaking();
  }

  render() {
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.innerHTML = `
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${gameState.round} / ${gameState.totalRounds}
        </div>
        <h2 class="text-gradient">Débat !</h2>
      </div>
      
      <div class="screen__content" id="debate-content">
        <!-- Dynamic content -->
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-end-debate">
          Passer au vote
        </button>
      </div>
    `;

    this.screen = screen;
    
    screen.querySelector('#btn-end-debate').addEventListener('click', () => {
      confirmVibration();
      this.endDebate();
    });

    return screen;
  }

  updateDisplay() {
    const container = this.screen.querySelector('#debate-content');
    if (!container) return;
    
    const letters = 'ABCDEFGHIJ'.split('');

    container.innerHTML = `
      <div class="debate-timer animate-scaleIn">
        <div class="timer ${this.timeRemaining <= 30 ? 'timer--warning' : ''}" id="timer-container">
          <div class="timer__display" id="timer-display">
            ${this.formatTime(this.timeRemaining)}
          </div>
          <div class="timer__label">Temps restant</div>
        </div>
        <div class="timer-controls">
          <button class="btn btn--ghost" id="btn-pause">
            ${this.isPaused ? 'Reprendre' : 'Pause'}
          </button>
        </div>
      </div>
      
      ${gameState.gameMode === 'fictionnaire' ? `
        <div class="debate-question card card--glow">
          <p class="question-label">Le mot est :</p>
          <p class="question-text fictionnaire-word">${gameState.currentWord?.word}</p>
        </div>
      ` : `
        <div class="debate-question card">
          <p class="question-label">Question :</p>
          <p class="question-text">${gameState.currentQuestion?.question}</p>
        </div>
      `}
      
      <div class="debate-answers">
        <h3>${gameState.gameMode === 'fictionnaire' ? 'Les définitions proposées :' : 'Les réponses proposées :'}</h3>
        <div class="answer-list" id="answer-list">
          ${this.shuffledAnswers.map((answer, index) => `
            <div class="answer-item" data-index="${index}">
              <span class="answer-item__letter">${letters[index]}</span>
              <span class="answer-item__text">${answer.text}</span>
              ${isSpeechSupported() ? `
                <button class="btn btn--ghost btn--icon speak-btn" data-index="${index}">
                  Lire
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    const pauseBtn = container.querySelector('#btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });
    }

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        await this.speakAnswerAtIndex(index);
      });
    });
  }

  startTimer() {
    // S'assurer qu'il n'y a pas déjà un timer en cours
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(this.tick, 1000);
  }

  tick() {
    // Vérifier si l'écran est toujours actif
    if (this.isEnded || !this.screen) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      return;
    }
    
    if (!this.isPaused) {
      this.timeRemaining--;
      
      const timerDisplay = this.screen.querySelector('#timer-display');
      const timer = this.screen.querySelector('#timer-container');
      
      if (timerDisplay) {
        timerDisplay.textContent = this.formatTime(this.timeRemaining);
      }
      
      // Warning state
      if (this.timeRemaining <= 30 && timer) {
        timer.classList.add('timer--warning');
      }
      
      // Alertes sonores/vibration
      if (this.timeRemaining === 30) {
        alertVibration();
      } else if (this.timeRemaining === 10) {
        alertVibration();
      }
      
      // Fin du timer
      if (this.timeRemaining <= 0) {
        this.endDebate();
      }
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    
    const pauseBtn = this.screen?.querySelector('#btn-pause');
    if (pauseBtn) {
      pauseBtn.textContent = this.isPaused ? 'Reprendre' : 'Pause';
    }
  }

  formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async speakAnswerAtIndex(index) {
    if (this.isSpeaking) {
      stopSpeaking();
      this.isSpeaking = false;
      return;
    }

    const answer = this.shuffledAnswers[index];
    const letters = 'ABCDEFGHIJ'.split('');
    
    this.isSpeaking = true;
    
    try {
      // Pause le timer pendant la lecture
      const wasPaused = this.isPaused;
      this.isPaused = true;
      
      await speakAnswer(answer.text, letters[index]);
      
      // Reprendre si le timer n'était pas en pause
      if (!wasPaused && !this.isEnded) {
        this.isPaused = false;
        const pauseBtn = this.screen?.querySelector('#btn-pause');
        if (pauseBtn) pauseBtn.textContent = 'Pause';
      }
    } catch (e) {
      console.error('Erreur lecture:', e);
    }
    
    this.isSpeaking = false;
  }

  endDebate() {
    // Éviter les appels multiples
    if (this.isEnded) return;
    this.isEnded = true;
    
    // Arrêter le timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    stopSpeaking();
    
    // Passer à la phase de vote
    gameState.currentPlayerIndex = 0;
    router.navigate('voting');
  }
}

export default DebateScreen;

