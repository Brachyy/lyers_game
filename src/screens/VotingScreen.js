/**
 * LYERS GAME - Voting Screen
 * Phase de vote et mise (Pass & Play)
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { getSniperId, hasAvocatDuDiable } from '../game/RoleManager.js';
import { confirmVibration, tapVibration } from '../utils/haptics.js';

export class VotingScreen {
  constructor(data = {}) {
    this.data = data;
    this.shuffledAnswers = [];
    this.selectedAnswerId = null;
    this.betAmount = 0;
    this.showingVote = false;
    this.sniperGuess = null;
  }

  onMount() {
    // Utiliser les mêmes réponses mélangées que le débat
    this.shuffledAnswers = gameState.getShuffledAnswers();
    this.updateDisplay();
  }

  render() {
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.innerHTML = `
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${gameState.round} / ${gameState.totalRounds}
        </div>
        <h2 class="text-gradient">Vote !</h2>
      </div>
      
      <div class="screen__content" id="voting-content">
        <!-- Dynamic content -->
      </div>
    `;

    this.screen = screen;
    return screen;
  }

  updateDisplay() {
    const container = this.screen.querySelector('#voting-content');
    const player = gameState.getCurrentPlayer();
    
    if (!player) {
      this.finishVotingPhase();
      return;
    }

    if (!this.showingVote) {
      // Écran "Passe le téléphone"
      container.innerHTML = `
        <div class="pass-screen">
          <div class="pass-screen__emoji animate-bounce">🗳️</div>
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${player.name}</p>
          <p class="pass-hint">C'est l'heure de voter !</p>
          <button class="btn btn--primary" id="btn-ready">
            Je suis ${player.name}
          </button>
        </div>
      `;

      container.querySelector('#btn-ready').addEventListener('click', () => {
        confirmVibration();
        this.showingVote = true;
        this.selectedAnswerId = null;
        this.betAmount = 0;
        this.sniperGuess = null;
        this.updateDisplay();
      });
    } else {
      this.showVotingForm();
    }
  }

  showVotingForm() {
    const container = this.screen.querySelector('#voting-content');
    const player = gameState.getCurrentPlayer();
    const roleData = gameState.roles[player.id];
    const letters = 'ABCDEFGHIJ'.split('');

    // Vérifier si le joueur est le Sniper et si l'Avocat est en jeu
    const isSniper = roleData?.roleId === 'sniper';
    const avocatInGame = hasAvocatDuDiable(gameState.roles);

    container.innerHTML = `
      <div class="voting-form animate-fadeIn">
        <!-- Rappel du rôle -->
        <div class="role-reminder card">
          <div class="role-reminder__header">
            <span class="role-reminder__emoji">${roleData?.role?.emoji || '😇'}</span>
            <span class="role-reminder__name">${roleData?.role?.name || 'Innocent'}</span>
          </div>
          <p class="role-reminder__mission">${roleData?.mission || 'Vote pour la vraie réponse !'}</p>
        </div>
        
        <!-- Question -->
        <div class="voting-question">
          <p class="question-label">Question :</p>
          <p class="question-text">${gameState.currentQuestion.question}</p>
        </div>
        
        <!-- Choix des réponses -->
        <div class="voting-choices">
          <h3>Choisis une réponse :</h3>
          <div class="answer-list" id="answer-list">
            ${this.shuffledAnswers.map((answer, index) => {
              // Un joueur ne peut pas voter pour sa propre réponse
              const isOwnAnswer = answer.playerId === player.id;
              
              return `
                <button class="answer-item ${this.selectedAnswerId === answer.id ? 'answer-item--selected' : ''} ${isOwnAnswer ? 'answer-item--disabled' : ''}" 
                        data-answer-id="${answer.id}"
                        ${isOwnAnswer ? 'disabled' : ''}>
                  <span class="answer-item__letter">${letters[index]}</span>
                  <span class="answer-item__text">${answer.text}</span>
                  ${isOwnAnswer ? '<span class="own-badge">Ta réponse</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
        
        ${isSniper && avocatInGame ? `
          <!-- Section Sniper -->
          <div class="sniper-section card" style="border-color: var(--neon-yellow);">
            <h3>🎯 Mission Sniper</h3>
            <p>Qui penses-tu être l'Avocat du Diable ?</p>
            <div class="sniper-choices" id="sniper-choices">
              ${gameState.players.filter(p => p.id !== player.id).map(p => `
                <button class="btn ${this.sniperGuess === p.id ? 'btn--primary' : 'btn--secondary'} sniper-choice" 
                        data-player-id="${p.id}">
                  ${p.name}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--success" id="btn-submit-vote" ${!this.selectedAnswerId ? 'disabled' : ''}>
          Confirmer mon vote ✓
        </button>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.answer-item:not(.answer-item--disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        tapVibration();
        this.selectedAnswerId = btn.dataset.answerId;
        this.updateVoteSelection();
      });
    });

    // Sniper choices
    container.querySelectorAll('.sniper-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        tapVibration();
        this.sniperGuess = btn.dataset.playerId;
        this.updateSniperSelection();
      });
    });

    container.querySelector('#btn-submit-vote').addEventListener('click', () => {
      confirmVibration();
      this.submitVote();
    });
  }

  updateVoteSelection() {
    const container = this.screen.querySelector('#voting-content');
    
    container.querySelectorAll('.answer-item').forEach(btn => {
      if (btn.dataset.answerId === this.selectedAnswerId) {
        btn.classList.add('answer-item--selected');
      } else {
        btn.classList.remove('answer-item--selected');
      }
    });

    const submitBtn = container.querySelector('#btn-submit-vote');
    submitBtn.disabled = !this.selectedAnswerId;
  }

  updateSniperSelection() {
    const container = this.screen.querySelector('#sniper-choices');
    if (!container) return;

    container.querySelectorAll('.sniper-choice').forEach(btn => {
      if (btn.dataset.playerId === this.sniperGuess) {
        btn.classList.remove('btn--secondary');
        btn.classList.add('btn--primary');
      } else {
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--secondary');
      }
    });
  }

  submitVote() {
    const player = gameState.getCurrentPlayer();
    
    // Enregistrer le vote
    gameState.setVote(player.id, this.selectedAnswerId, this.betAmount);
    
    // Si c'est le Sniper, enregistrer sa supposition
    const roleData = gameState.roles[player.id];
    if (roleData?.roleId === 'sniper' && this.sniperGuess) {
      gameState.setSniperGuess(this.sniperGuess);
    }
    
    // Réinitialiser pour le prochain joueur
    this.showingVote = false;
    this.selectedAnswerId = null;
    this.betAmount = 0;
    this.sniperGuess = null;
    
    // Passer au joueur suivant
    const hasMorePlayers = gameState.nextPlayer();
    
    if (hasMorePlayers) {
      this.updateDisplay();
    } else {
      this.finishVotingPhase();
    }
  }

  finishVotingPhase() {
    // Passer à la phase des résultats
    router.navigate('results');
  }
}

export default VotingScreen;
