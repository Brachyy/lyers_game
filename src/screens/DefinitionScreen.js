/**
 * LYERS GAME - Definition Screen (Mode Fictionnaire)
 * Phase d'invention des définitions (Pass & Play)
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { confirmVibration, tapVibration } from '../utils/haptics.js';

export class DefinitionScreen {
  constructor(data = {}) {
    this.data = data;
    this.words = [];
    this.showingWord = false;
    this.currentDefinition = '';
  }

  async loadWords() {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${baseUrl}fictionnaire_words.json`);
      this.words = await response.json();
    } catch (e) {
      console.error('Erreur chargement mots:', e);
      this.words = [
        {
          word: "Xylogratte",
          definition: "Instrument médiéval utilisé pour graver des motifs sur le bois"
        }
      ];
    }
  }

  async onMount() {
    await this.loadWords();

    // Sélectionner un mot aléatoire si pas déjà fait
    if (!gameState.currentWord) {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      gameState.update({ currentWord: this.words[randomIndex] });
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
        <h2 class="text-gradient">Mode Fictionnaire</h2>
      </div>
      
      <div class="screen__content" id="definition-content">
        <!-- Dynamic content -->
      </div>
    `;

    this.screen = screen;
    return screen;
  }

  updateDisplay() {
    const container = this.screen.querySelector('#definition-content');
    const player = gameState.getCurrentPlayer();

    if (!player) {
      this.finishDefinitionPhase();
      return;
    }

    if (!this.showingWord) {
      // Écran "Passe le téléphone"
      container.innerHTML = `
        <div class="pass-screen">
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${player.name}</p>
          <button class="btn btn--primary" id="btn-ready">
            C'est moi, ${player.name} !
          </button>
        </div>
      `;

      container.querySelector('#btn-ready').addEventListener('click', () => {
        confirmVibration();
        this.showingWord = true;
        this.updateDisplay();
      });
    } else {
      // Écran de saisie de la définition
      container.innerHTML = `
        <div class="invention-form animate-fadeIn">
          <div class="card card--glow">
            <h3 class="question-label">Le mot est :</h3>
            <p class="question-text fictionnaire-word">${gameState.currentWord.word}</p>
          </div>
          
          <div class="invention-input">
            <label for="definition-input">Invente une définition crédible ou hilarante :</label>
            <textarea 
              id="definition-input" 
              class="input textarea" 
              placeholder="Ta définition inventée..."
              rows="3"
            >${this.currentDefinition}</textarea>
          </div>
          
          <p class="invention-hint">
            Ne montre pas ta définition aux autres !
          </p>
          <p class="invention-hint" style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9em;">
            Astuce : Formule ta phrase comme dans un dictionnaire (ex: "Petit outil servant à..."). Évite de commencer par "C'est un..." et ne mets pas de point à la fin.
          </p>
        </div>
      `;

      container.innerHTML += `
        <div class="screen__footer">
          <button class="btn btn--success" id="btn-submit" disabled>
            Valider ma définition
          </button>
        </div>
      `;

      const input = container.querySelector('#definition-input');
      const submitBtn = container.querySelector('#btn-submit');

      input.addEventListener('input', (e) => {
        this.currentDefinition = e.target.value;
        submitBtn.disabled = this.currentDefinition.trim().length < 2;
      });

      input.addEventListener('focus', () => {
        tapVibration();
      });

      submitBtn.addEventListener('click', () => {
        confirmVibration();
        this.submitDefinition();
      });
    }
  }

  submitDefinition() {
    const player = gameState.getCurrentPlayer();

    // Enregistrer la définition comme une "réponse"
    gameState.addAnswer(player.id, this.currentDefinition.trim());

    // Réinitialiser pour le prochain joueur
    this.currentDefinition = '';
    this.showingWord = false;

    // Passer au joueur suivant
    const hasMorePlayers = gameState.nextPlayer();

    if (hasMorePlayers) {
      this.updateDisplay();
    } else {
      this.finishDefinitionPhase();
    }
  }

  finishDefinitionPhase() {
    // Passer à la phase de distribution des rôles
    gameState.currentPlayerIndex = 0;
    router.navigate('roles');
  }
}

export default DefinitionScreen;
