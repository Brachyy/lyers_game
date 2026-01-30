/**
 * LYERS GAME - Main Entry Point
 * Application de jeu de soirée type "Menteur"
 */

// Styles
import './styles/index.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/screens.css';

// Router
import router from './router.js';

// Screens
import HomeScreen from './screens/HomeScreen.js';
import ConfigScreen from './screens/ConfigScreen.js';
import InventionScreen from './screens/InventionScreen.js';
import RoleRevealScreen from './screens/RoleRevealScreen.js';
import DebateScreen from './screens/DebateScreen.js';
import VotingScreen from './screens/VotingScreen.js';
import ResultsScreen from './screens/ResultsScreen.js';

// Utils
import { initSpeech } from './utils/speech.js';
import gameState from './game/GameState.js';

// Initialize the app
async function init() {
  console.log('🎰 LYERS - Initialisation...');
  
  // Initialize Web Speech API
  await initSpeech();
  
  // Get the app container
  const app = document.querySelector('#app');
  
  // Initialize the router
  router.init(app);
  
  // Register all screens
  router.register('home', HomeScreen);
  router.register('config', ConfigScreen);
  router.register('invention', InventionScreen);
  router.register('roles', RoleRevealScreen);
  router.register('debate', DebateScreen);
  router.register('voting', VotingScreen);
  router.register('results', ResultsScreen);
  
  // Check for saved game and navigate accordingly
  if (gameState.hasActiveGame()) {
    gameState.load();
    // If there's an active game, offer to resume
    router.navigate('home');
  } else {
    router.navigate('home');
  }
  
  console.log('🎰 LYERS - Prêt !');
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change (pause timer when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause any running timers
    const event = new CustomEvent('app:pause');
    document.dispatchEvent(event);
  }
});

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });
