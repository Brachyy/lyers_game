/**
 * LYERS GAME - Home Screen
 * Écran d'accueil avec logo et navigation
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { confirmVibration } from '../utils/haptics.js';

export class HomeScreen {
  constructor(data = {}) {
    this.data = data;
    this.showModeSelect = false;
  }

  render() {
    const hasActiveGame = gameState.hasActiveGame();
    
    const screen = document.createElement('div');
    screen.className = 'screen screen--centered';
    screen.innerHTML = `
      <div class="home-content animate-fadeIn">
        <div class="home-logo">
          <span class="neon-logo animate-glow" data-text="LYERS">LYERS</span>
          <p class="home-tagline">Le jeu où mentir est un art</p>
        </div>
        
        <div class="home-actions" id="home-actions">
          <button class="btn btn--primary" id="btn-new-game">
            Nouvelle Partie
          </button>
          
          ${hasActiveGame ? `
            <button class="btn btn--secondary" id="btn-resume">
              Reprendre
            </button>
          ` : ''}
        </div>
        
        <div class="home-footer">
          <p class="home-credits">3 à 10 joueurs • 1 appareil</p>
        </div>
      </div>
    `;

    this.screen = screen;

    // Event listeners
    screen.querySelector('#btn-new-game').addEventListener('click', () => {
      confirmVibration();
      gameState.clear();
      this.showModeSelection();
    });

    const resumeBtn = screen.querySelector('#btn-resume');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        confirmVibration();
        gameState.load();
        // Reprendre à la phase en cours
        const phase = gameState.phase;
        if (phase && phase !== 'home') {
          router.navigate(phase);
        } else {
          router.navigate('config');
        }
      });
    }

    return screen;
  }

  showModeSelection() {
    const actionsContainer = this.screen.querySelector('#home-actions');
    actionsContainer.innerHTML = `
      <div class="mode-selection animate-fadeIn">
        <p class="mode-selection__title">Choisis ton mode de jeu</p>
        <button class="btn btn--mode mode-btn--lyers" id="btn-mode-lyers">
          <span class="mode-btn__name">Mode Lyers</span>
          <span class="mode-btn__desc">Invente de fausses réponses à des questions insolites</span>
        </button>
        <button class="btn btn--mode mode-btn--fictionnaire" id="btn-mode-fictionnaire">
          <span class="mode-btn__name">Mode Fictionnaire</span>
          <span class="mode-btn__desc">Invente la définition d'un mot bizarre ou inconnu</span>
        </button>
      </div>
    `;

    actionsContainer.querySelector('#btn-mode-lyers').addEventListener('click', () => {
      confirmVibration();
      gameState.gameMode = 'lyers';
      router.navigate('config');
    });

    actionsContainer.querySelector('#btn-mode-fictionnaire').addEventListener('click', () => {
      confirmVibration();
      gameState.gameMode = 'fictionnaire';
      router.navigate('config');
    });
  }
}

export default HomeScreen;
