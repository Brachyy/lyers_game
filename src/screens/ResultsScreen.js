/**
 * LYERS GAME - Results Screen
 * Révélation des résultats avec animations et synthèse vocale
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { calculateResults, applyResults } from '../game/ScoringSystem.js';
import { speakTruth, speakAnnouncement, stopSpeaking, isSpeechSupported } from '../utils/speech.js';
import { successVibration, revealVibration, confirmVibration } from '../utils/haptics.js';

export class ResultsScreen {
  constructor(data = {}) {
    this.data = data;
    this.results = null;
    this.currentRevealIndex = 0;
    this.revealComplete = false;
    this.showingLeaderboard = false;
  }

  onMount() {
    // Calculer les résultats
    this.results = calculateResults(gameState);
    
    // Appliquer les scores
    applyResults(gameState, this.results);
    
    this.showAnswerReveal();
  }

  cleanup() {
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
        <h2 class="text-gradient">Révélation !</h2>
      </div>
      
      <div class="screen__content" id="results-content">
        <!-- Dynamic content -->
      </div>
    `;

    this.screen = screen;
    return screen;
  }

  showAnswerReveal() {
    const container = this.screen.querySelector('#results-content');
    const letters = 'ABCDEFGHIJ'.split('');

    container.innerHTML = `
      <div class="reveal-section animate-fadeIn">
        <div class="question-recap card">
          <p class="question-label">La question était :</p>
          <p class="question-text">${gameState.currentQuestion.question}</p>
        </div>
        
        <div class="answers-reveal" id="answers-reveal">
          ${this.results.revealedAnswers.map((answer, index) => `
            <div class="answer-reveal-item ${answer.isTruth ? 'answer-reveal-item--truth' : ''}" 
                 data-index="${index}"
                 style="opacity: 0; transform: translateY(20px);">
              <div class="answer-reveal-item__header">
                <span class="answer-reveal-item__letter">${letters[index]}</span>
                <span class="answer-reveal-item__text">${answer.text}</span>
              </div>
              <div class="answer-reveal-item__details">
                <div class="answer-reveal-item__author">
                  ${answer.isTruth ? '✅ LA VRAIE RÉPONSE' : `✍️ ${answer.authorName}`}
                </div>
                <div class="answer-reveal-item__votes">
                  ${answer.votesReceived > 0 
                    ? `🗳️ ${answer.votesReceived} vote(s): ${answer.voters.join(', ')}` 
                    : '🗳️ Aucun vote'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${isSpeechSupported() ? `
          <button class="btn btn--secondary" id="btn-speak-truth">
            🔊 Lire la vraie réponse
          </button>
        ` : ''}
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-show-scores">
          Voir les scores 📊
        </button>
      </div>
    `;

    // Révéler les réponses avec animation
    this.animateReveal();

    // Event listeners
    const speakBtn = container.querySelector('#btn-speak-truth');
    if (speakBtn) {
      speakBtn.addEventListener('click', async () => {
        await speakTruth(gameState.currentQuestion.answer);
      });
    }

    container.querySelector('#btn-show-scores').addEventListener('click', () => {
      confirmVibration();
      this.showScores();
    });
  }

  async animateReveal() {
    const items = this.screen.querySelectorAll('.answer-reveal-item');
    
    for (let i = 0; i < items.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const item = items[i];
      item.style.transition = 'all 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
      
      // Vibration spéciale pour la vraie réponse
      if (item.classList.contains('answer-reveal-item--truth')) {
        revealVibration();
      }
    }
  }

  showScores() {
    const container = this.screen.querySelector('#results-content');

    container.innerHTML = `
      <div class="scores-section animate-fadeIn">
        <h3 class="text-center mb-lg">Résultats de la manche</h3>
        
        <!-- Highlights -->
        ${this.results.highlights.length > 0 ? `
          <div class="highlights">
            ${this.results.highlights.map(h => `
              <div class="highlight-card card animate-scaleIn">
                <p class="highlight-text">${h.message}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Détails par joueur -->
        <div class="player-results">
          ${Object.values(this.results.playerResults)
            .sort((a, b) => b.pointsEarned - a.pointsEarned)
            .map((result, index) => `
              <div class="player-result-card card animate-slideUp stagger-${index + 1}">
                <div class="player-result-card__header">
                  <div class="player-result-card__info">
                    <span class="player-result-card__emoji">${result.role?.role?.emoji || '😇'}</span>
                    <span class="player-result-card__name">${result.playerName}</span>
                  </div>
                  <span class="player-result-card__points ${result.pointsEarned > 0 ? 'positive' : result.pointsEarned < 0 ? 'negative' : ''}">
                    ${result.pointsEarned > 0 ? '+' : ''}${result.pointsEarned} pts
                  </span>
                </div>
                <div class="player-result-card__breakdown">
                  ${result.breakdown.map(b => `
                    <div class="breakdown-item">
                      <span>${b.emoji} ${b.reason}</span>
                      <span class="${b.points >= 0 ? 'positive' : 'negative'}">
                        ${b.points >= 0 ? '+' : ''}${b.points}
                      </span>
                    </div>
                  `).join('')}
                </div>
                <div class="player-result-card__role">
                  Rôle : ${result.role?.role?.name || 'Innocent'}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-leaderboard">
          Classement général 🏆
        </button>
      </div>
    `;

    successVibration();

    container.querySelector('#btn-leaderboard').addEventListener('click', () => {
      confirmVibration();
      this.showLeaderboard();
    });
  }

  showLeaderboard() {
    const container = this.screen.querySelector('#results-content');
    const leaderboard = gameState.getLeaderboard();
    const isGameOver = gameState.isGameOver();

    container.innerHTML = `
      <div class="leaderboard-section animate-fadeIn">
        ${isGameOver ? `
          <div class="game-over-banner">
            <h2 class="text-gradient animate-neon">🎉 FIN DE PARTIE 🎉</h2>
          </div>
        ` : ''}
        
        <div class="leaderboard">
          ${leaderboard.map((player, index) => `
            <div class="leaderboard__item ${index === 0 ? 'leaderboard__item--first' : ''} animate-slideInLeft stagger-${index + 1}">
              <div class="leaderboard__rank">
                ${index === 0 ? '👑' : index + 1}
              </div>
              <div class="leaderboard__name">${player.name}</div>
              <div class="leaderboard__score">${player.score} pts</div>
            </div>
          `).join('')}
        </div>
        
        ${isGameOver && leaderboard.length > 0 ? `
          <div class="winner-announcement animate-scaleIn">
            <p class="winner-label">Le grand gagnant est...</p>
            <p class="winner-name text-gradient">${leaderboard[0].name} 🏆</p>
          </div>
        ` : ''}
      </div>
      
      <div class="screen__footer">
        ${isGameOver ? `
          <button class="btn btn--primary" id="btn-new-game">
            Nouvelle partie 🎰
          </button>
        ` : `
          <button class="btn btn--primary" id="btn-next-round">
            Manche suivante →
          </button>
        `}
      </div>
    `;

    if (isGameOver) {
      successVibration();
      
      // Créer des confettis
      this.createConfetti();

      container.querySelector('#btn-new-game').addEventListener('click', () => {
        confirmVibration();
        gameState.clear();
        router.navigate('home');
      });
    } else {
      container.querySelector('#btn-next-round').addEventListener('click', () => {
        confirmVibration();
        this.startNextRound();
      });
    }
  }

  createConfetti() {
    const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#FBBF24'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(confetti);
    }
    
    document.body.appendChild(container);
    
    // Supprimer après l'animation
    setTimeout(() => {
      container.remove();
    }, 5000);
  }

  startNextRound() {
    gameState.nextRound();
    gameState.currentQuestion = null; // Reset pour nouvelle question
    router.navigate('invention');
  }
}

export default ResultsScreen;
