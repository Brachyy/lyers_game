/**
 * LYERS GAME - Local Storage Helpers
 * Gestion de la persistance des données
 */

const STORAGE_KEYS = {
  GAME: 'lyers_game_state',
  CONFIG: 'lyers_game_config'
};

/**
 * Sauvegarde l'état du jeu
 */
export function saveGame(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Erreur lors de la sauvegarde:', e);
    return false;
  }
}

/**
 * Charge l'état du jeu
 */
export function loadGame() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Erreur lors du chargement:', e);
    return null;
  }
}

/**
 * Efface l'état du jeu
 */
export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME);
    return true;
  } catch (e) {
    console.error('Erreur lors de la suppression:', e);
    return false;
  }
}

/**
 * Sauvegarde la configuration
 */
export function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Erreur lors de la sauvegarde de la config:', e);
    return false;
  }
}

/**
 * Charge la configuration
 */
export function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Erreur lors du chargement de la config:', e);
    return null;
  }
}

export default {
  saveGame,
  loadGame,
  clearGame,
  saveConfig,
  loadConfig
};
