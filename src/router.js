/**
 * LYERS GAME - Router
 * Navigation entre les écrans
 */

import gameState from './game/GameState.js';

class Router {
  constructor() {
    this.screens = {};
    this.currentScreen = null;
    this.container = null;
  }

  /**
   * Initialise le routeur avec le conteneur principal
   */
  init(container) {
    this.container = container;
  }

  /**
   * Enregistre un écran
   */
  register(name, screenClass) {
    this.screens[name] = screenClass;
  }

  /**
   * Navigue vers un écran
   */
  navigate(screenName, data = {}) {
    if (!this.screens[screenName]) {
      console.error(`Screen "${screenName}" not found`);
      return;
    }

    // Mettre à jour la phase dans le gameState
    if (screenName !== this.currentScreen?.name) {
      gameState.update({ phase: screenName });
    }

    // Nettoyer l'écran actuel
    if (this.currentScreen?.cleanup) {
      this.currentScreen.cleanup();
    }

    // Animer la sortie
    this.container.innerHTML = '';

    // Créer et monter le nouvel écran
    const ScreenClass = this.screens[screenName];
    const screen = new ScreenClass(data);
    screen.name = screenName;
    
    this.currentScreen = screen;
    
    // Rendre l'écran
    const element = screen.render();
    this.container.appendChild(element);

    // Appeler onMount si défini
    if (screen.onMount) {
      screen.onMount();
    }
  }

  /**
   * Retourne à l'écran précédent (home par défaut)
   */
  back() {
    this.navigate('home');
  }
}

export const router = new Router();
export default router;
