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
  }

  render() {
    const hasActiveGame = gameState.hasActiveGame();
    
    const screen = document.createElement('div');
    screen.className = 'screen screen--centered';
    screen.innerHTML = `
      <div class="home-content animate-fadeIn">
        <div class="home-logo">
          <span class="neon-logo animate-glow" data-text="LYERS">LYERS</span>
          <p class="home-tagline">Le jeu où mentir est un art 🎭</p>
        </div>
        
        <div class="home-actions">
          <button class="btn btn--primary" id="btn-new-game">
            <span>🎰</span>
            Nouvelle Partie
          </button>
          
          ${hasActiveGame ? `
            <button class="btn btn--secondary" id="btn-resume">
              <span>▶️</span>
              Reprendre
            </button>
          ` : ''}
        </div>
        
        <div class="home-footer">
          <p class="home-credits">3 à 10 joueurs • 1 appareil</p>
        </div>
      </div>
    `;

    // Event listeners
    screen.querySelector('#btn-new-game').addEventListener('click', () => {
      confirmVibration();
      gameState.clear();
      router.navigate('config');
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
}

export default HomeScreen;
