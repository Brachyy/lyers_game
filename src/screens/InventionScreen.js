/**
 * LYERS GAME - Invention Screen
 * Phase d'invention des réponses (Pass & Play)
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { confirmVibration, tapVibration } from '../utils/haptics.js';

export class InventionScreen {
  constructor(data = {}) {
    this.data = data;
    this.questions = [];
    this.showingQuestion = false;
    this.currentAnswer = '';
  }

  async loadQuestions() {
    try {
      const response = await fetch('/questions.json');
      this.questions = await response.json();
    } catch (e) {
      console.error('Erreur chargement questions:', e);
      this.questions = [
        { 
          question: "Quel est le seul aliment qui ne périme jamais ?", 
          answer: "Le miel" 
        }
      ];
    }
  }

  async onMount() {
    await this.loadQuestions();
    
    // Sélectionner une question aléatoire si pas déjà fait
    if (!gameState.currentQuestion) {
      const randomIndex = Math.floor(Math.random() * this.questions.length);
      gameState.setQuestion(this.questions[randomIndex]);
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
        <h2 class="text-gradient">Phase d'Invention</h2>
      </div>
      
      <div class="screen__content" id="invention-content">
        <!-- Dynamic content -->
      </div>
    `;

    this.screen = screen;
    return screen;
  }

  updateDisplay() {
    const container = this.screen.querySelector('#invention-content');
    const player = gameState.getCurrentPlayer();
    
    if (!player) {
      this.finishInventionPhase();
      return;
    }

    if (!this.showingQuestion) {
      // Écran "Passe le téléphone"
      container.innerHTML = `
        <div class="pass-screen">
          <div class="pass-screen__emoji animate-bounce">📱</div>
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${player.name}</p>
          <button class="btn btn--primary" id="btn-ready">
            C'est moi, ${player.name} !
          </button>
        </div>
      `;

      container.querySelector('#btn-ready').addEventListener('click', () => {
        confirmVibration();
        this.showingQuestion = true;
        this.updateDisplay();
      });
    } else {
      // Écran de saisie de la réponse
      container.innerHTML = `
        <div class="invention-form animate-fadeIn">
          <div class="card card--glow">
            <h3 class="question-label">La question est :</h3>
            <p class="question-text">${gameState.currentQuestion.question}</p>
          </div>
          
          <div class="invention-input">
            <label for="answer-input">Invente une fausse réponse crédible :</label>
            <textarea 
              id="answer-input" 
              class="input textarea" 
              placeholder="Ta réponse inventée..."
              rows="3"
            >${this.currentAnswer}</textarea>
          </div>
          
          <p class="invention-hint">
            ⚠️ Ne montre pas ta réponse aux autres !
          </p>
        </div>
      `;

      container.innerHTML += `
        <div class="screen__footer">
          <button class="btn btn--success" id="btn-submit" disabled>
            Valider ma réponse ✓
          </button>
        </div>
      `;

      const input = container.querySelector('#answer-input');
      const submitBtn = container.querySelector('#btn-submit');

      input.addEventListener('input', (e) => {
        this.currentAnswer = e.target.value;
        submitBtn.disabled = this.currentAnswer.trim().length < 2;
      });

      input.addEventListener('focus', () => {
        tapVibration();
      });

      submitBtn.addEventListener('click', () => {
        confirmVibration();
        this.submitAnswer();
      });
    }
  }

  submitAnswer() {
    const player = gameState.getCurrentPlayer();
    
    // Enregistrer la réponse
    gameState.addAnswer(player.id, this.currentAnswer.trim());
    
    // Réinitialiser pour le prochain joueur
    this.currentAnswer = '';
    this.showingQuestion = false;
    
    // Passer au joueur suivant
    const hasMorePlayers = gameState.nextPlayer();
    
    if (hasMorePlayers) {
      this.updateDisplay();
    } else {
      this.finishInventionPhase();
    }
  }

  finishInventionPhase() {
    // Passer à la phase de distribution des rôles
    gameState.currentPlayerIndex = 0;
    router.navigate('roles');
  }
}

export default InventionScreen;
