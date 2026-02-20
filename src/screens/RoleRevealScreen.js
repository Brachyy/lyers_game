/**
 * LYERS GAME - Role Reveal Screen
 * Révélation des rôles secrets (Pass & Play)
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { distributeRoles } from '../game/RoleManager.js';
import { confirmVibration, revealVibration } from '../utils/haptics.js';

export class RoleRevealScreen {
  constructor(data = {}) {
    this.data = data;
    this.isRevealed = false;
  }

  onMount() {
    // Distribuer les rôles si pas encore fait
    if (Object.keys(gameState.roles).length === 0) {
      const trueAnswer = gameState.gameMode === 'fictionnaire'
        ? gameState.currentWord?.definition
        : gameState.currentQuestion?.answer;

      const roles = distributeRoles(
        gameState.players,
        gameState.enabledRoles,
        gameState.answers,
        trueAnswer
      );
      
      // Assigner les rôles
      Object.entries(roles).forEach(([playerId, roleData]) => {
        gameState.setPlayerRole(playerId, roleData);
      });
    }
    
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
        <h2 class="text-gradient">Révélation des Rôles</h2>
      </div>
      
      <div class="screen__content" id="role-content">
        <!-- Dynamic content -->
      </div>
    `;

    this.screen = screen;
    return screen;
  }

  updateDisplay() {
    const container = this.screen.querySelector('#role-content');
    const player = gameState.getCurrentPlayer();
    
    if (!player) {
      this.finishRolePhase();
      return;
    }

    const roleData = gameState.roles[player.id];

    if (!this.isRevealed) {
      // Écran "Passe le téléphone"
      container.innerHTML = `
        <div class="pass-screen">
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${player.name}</p>
          <p class="pass-hint">Tu vas découvrir ton rôle secret !</p>
          <button class="btn btn--primary" id="btn-ready">
            Je suis ${player.name}
          </button>
        </div>
      `;

      container.querySelector('#btn-ready').addEventListener('click', () => {
        confirmVibration();
        this.showRevealCard();
      });
    }
  }

  showRevealCard() {
    const container = this.screen.querySelector('#role-content');
    const player = gameState.getCurrentPlayer();
    const roleData = gameState.roles[player.id];
    const role = roleData.role;

    container.innerHTML = `
      <div class="role-reveal">
        <div class="role-reveal__card" id="role-card">
          <div class="role-reveal__front">
            <div class="card-pattern">
              <span class="mystery-icon">?</span>
              <p>Appuie pour révéler ton rôle</p>
            </div>
          </div>
          <div class="role-reveal__back">
            <div class="revealed-role">
              <div class="revealed-role__emoji">${role.emoji}</div>
              <h3 class="revealed-role__name" style="color: ${role.color}">${role.name}</h3>
              <div class="revealed-role__mission">
                <p class="mission-label">Ta mission :</p>
                <p class="mission-text">${roleData.mission}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="role-actions" id="role-actions" style="display: none;">
        <p class="role-warning">Mémorise bien ta mission et cache l'écran !</p>
        <button class="btn btn--success" id="btn-understood">
          J'ai compris, au suivant !
        </button>
      </div>
    `;

    const card = container.querySelector('#role-card');
    const actions = container.querySelector('#role-actions');

    card.addEventListener('click', () => {
      if (!card.classList.contains('role-reveal__card--flipped')) {
        revealVibration();
        card.classList.add('role-reveal__card--flipped');
        
        // Afficher les actions après un délai
        setTimeout(() => {
          actions.style.display = 'block';
          actions.classList.add('animate-fadeIn');
        }, 800);
      }
    });

    container.querySelector('#btn-understood').addEventListener('click', () => {
      confirmVibration();
      this.isRevealed = false;
      
      // Passer au joueur suivant
      const hasMorePlayers = gameState.nextPlayer();
      
      if (hasMorePlayers) {
        this.updateDisplay();
      } else {
        this.finishRolePhase();
      }
    });
  }

  finishRolePhase() {
    // Passer à la phase de débat
    router.navigate('debate');
  }
}

export default RoleRevealScreen;
