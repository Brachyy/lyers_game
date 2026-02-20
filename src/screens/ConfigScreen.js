/**
 * LYERS GAME - Configuration Screen
 * Configuration des joueurs, rôles et paramètres
 */

import router from '../router.js';
import gameState from '../game/GameState.js';
import { getRolesList, canEnableRole } from '../game/roles.js';
import { confirmVibration, tapVibration } from '../utils/haptics.js';

export class ConfigScreen {
  constructor(data = {}) {
    this.data = data;
    this.minPlayers = 3;
    this.maxPlayers = 10;
  }

  render() {
    // Charger la config sauvegardée
    gameState.loadConfiguration();

    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.innerHTML = `
      <div class="screen__header animate-slideDown">
        <button class="btn btn--ghost" id="btn-back">← Retour</button>
        <h2 class="text-gradient">Configuration</h2>
        <div class="mode-badge ${gameState.gameMode === 'fictionnaire' ? 'mode-badge--fictionnaire' : 'mode-badge--lyers'}">
          ${gameState.gameMode === 'fictionnaire' ? 'Fictionnaire' : 'Lyers'}
        </div>
      </div>
      
      <div class="screen__content">
        <!-- Section Joueurs -->
        <section class="config-section animate-slideUp stagger-1">
          <h3>Joueurs</h3>
          <div class="player-list" id="player-list">
            <!-- Players will be added dynamically -->
          </div>
          <button class="btn btn--secondary" id="btn-add-player" style="margin-top: var(--spacing-md)">
            + Ajouter un joueur
          </button>
        </section>
        
        <!-- Section Rôles -->
        <section class="config-section animate-slideUp stagger-2">
          <h3>Rôles Actifs</h3>
          <p class="config-hint">Sélectionne les rôles qui seront distribués aléatoirement</p>
          <div class="role-grid" id="role-grid">
            <!-- Roles will be added dynamically -->
          </div>
        </section>
        
        <!-- Section Timer -->
        <section class="config-section animate-slideUp stagger-3">
          <h3>Durée du débat</h3>
          <div class="slider-group">
            <div class="slider-group__header">
              <span>Temps de discussion</span>
              <span class="slider-group__value" id="timer-value">${gameState.timerDuration}s</span>
            </div>
            <input type="range" class="slider" id="timer-slider" 
                   min="30" max="300" step="30" value="${gameState.timerDuration}">
          </div>
        </section>
        
        <!-- Section Manches -->
        <section class="config-section animate-slideUp stagger-4">
          <h3>Nombre de manches</h3>
          <div class="slider-group">
            <div class="slider-group__header">
              <span>Manches à jouer</span>
              <span class="slider-group__value" id="rounds-value">${gameState.totalRounds}</span>
            </div>
            <input type="range" class="slider" id="rounds-slider" 
                   min="3" max="10" step="1" value="${gameState.totalRounds}">
          </div>
        </section>
        
        <!-- Section Mode Gorgée -->
        <section class="config-section animate-slideUp stagger-5">
          <h3>Mode Gorgée</h3>
          <p class="config-hint">Active le mode drinking game : les points deviennent des gorgées !</p>
          <div class="sip-mode-toggle">
            <label class="toggle-switch">
              <input type="checkbox" id="sip-mode-toggle" ${gameState.sipMode ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label" id="sip-mode-label">${gameState.sipMode ? 'Mode Gorgée activé' : 'Mode Points'}</span>
          </div>
        </section>
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-start" disabled>
          Lancer la partie
        </button>
      </div>
    `;

    this.screen = screen;
    this.setupEventListeners();
    this.renderPlayers();
    this.renderRoles();
    this.updateStartButton();

    return screen;
  }

  setupEventListeners() {
    // Retour
    this.screen.querySelector('#btn-back').addEventListener('click', () => {
      tapVibration();
      router.navigate('home');
    });

    // Ajouter un joueur
    this.screen.querySelector('#btn-add-player').addEventListener('click', () => {
      tapVibration();
      this.addPlayer();
    });

    // Timer slider
    const timerSlider = this.screen.querySelector('#timer-slider');
    const timerValue = this.screen.querySelector('#timer-value');
    timerSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      timerValue.textContent = `${value}s`;
      gameState.setTimerDuration(value);
    });

    // Rounds slider
    const roundsSlider = this.screen.querySelector('#rounds-slider');
    const roundsValue = this.screen.querySelector('#rounds-value');
    roundsSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      roundsValue.textContent = value;
      gameState.totalRounds = value;
    });

    // Mode Gorgée toggle
    const sipToggle = this.screen.querySelector('#sip-mode-toggle');
    const sipLabel = this.screen.querySelector('#sip-mode-label');
    sipToggle.addEventListener('change', (e) => {
      tapVibration();
      gameState.setSipMode(e.target.checked);
      sipLabel.textContent = e.target.checked ? 'Mode Gorgée activé' : 'Mode Points';
    });

    // Lancer la partie
    this.screen.querySelector('#btn-start').addEventListener('click', () => {
      confirmVibration();
      this.startGame();
    });
  }

  addPlayer() {
    if (gameState.players.length >= this.maxPlayers) {
      return;
    }
    
    const playerNum = gameState.players.length + 1;
    gameState.addPlayer(`Joueur ${playerNum}`);
    this.renderPlayers();
    this.updateStartButton();
  }

  removePlayer(id) {
    gameState.removePlayer(id);
    this.renderPlayers();
    this.updateStartButton();
  }

  renderPlayers() {
    const container = this.screen.querySelector('#player-list');
    
    // Ajouter des joueurs par défaut si vide
    if (gameState.players.length === 0) {
      for (let i = 1; i <= 3; i++) {
        gameState.addPlayer(`Joueur ${i}`);
      }
    }

    container.innerHTML = gameState.players.map((player, index) => `
      <div class="player-item" data-id="${player.id}">
        <div class="player-item__number">${index + 1}</div>
        <input type="text" class="input player-item__input" 
               value="${player.name}" 
               placeholder="Nom du joueur"
               data-id="${player.id}">
        ${gameState.players.length > this.minPlayers ? `
          <button class="player-item__remove" data-id="${player.id}">×</button>
        ` : ''}
      </div>
    `).join('');

    // Event listeners pour les inputs
    container.querySelectorAll('.player-item__input').forEach(input => {
      input.addEventListener('input', (e) => {
        gameState.updatePlayerName(e.target.dataset.id, e.target.value);
      });
      input.addEventListener('focus', (e) => {
        e.target.select();
      });
    });

    // Event listeners pour supprimer
    container.querySelectorAll('.player-item__remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        tapVibration();
        this.removePlayer(e.target.dataset.id);
      });
    });

    // Mettre à jour le bouton d'ajout
    const addBtn = this.screen.querySelector('#btn-add-player');
    if (gameState.players.length >= this.maxPlayers) {
      addBtn.disabled = true;
      addBtn.textContent = 'Maximum atteint';
    } else {
      addBtn.disabled = false;
      addBtn.textContent = '+ Ajouter un joueur';
    }
  }

  renderRoles() {
    const container = this.screen.querySelector('#role-grid');
    const roles = getRolesList();

    container.innerHTML = roles.map(role => {
      const isEnabled = gameState.enabledRoles.includes(role.id);
      const isDefault = role.isDefault;
      const canEnable = canEnableRole(role.id, gameState.enabledRoles);

      return `
        <div class="role-card ${isEnabled ? 'role-card--active' : ''} ${isDefault ? 'role-card--default' : ''}" 
             data-role-id="${role.id}"
             ${isDefault ? 'data-locked="true"' : ''}>
          <div class="checkbox">
            <input type="checkbox" 
                   id="role-${role.id}" 
                   ${isEnabled ? 'checked' : ''} 
                   ${isDefault ? 'disabled' : ''}>
            <span class="checkbox__box"></span>
          </div>
          <div class="role-card__content">
            <div class="role-card__emoji">${role.emoji}</div>
            <div class="role-card__name">${role.name}</div>
            <div class="role-card__description">${role.description}</div>
          </div>
        </div>
      `;
    }).join('');

    // Event listeners
    container.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (card.dataset.locked) return;
        
        tapVibration();
        const roleId = card.dataset.roleId;
        const checkbox = card.querySelector('input[type="checkbox"]');
        
        this.toggleRole(roleId, !checkbox.checked);
        this.renderRoles();
      });
    });
  }

  toggleRole(roleId, enabled) {
    let roles = [...gameState.enabledRoles];
    
    if (enabled) {
      // Vérifier les contraintes
      const check = canEnableRole(roleId, roles);
      if (!check.canEnable) {
        alert(check.reason);
        return;
      }
      if (!roles.includes(roleId)) {
        roles.push(roleId);
      }
    } else {
      roles = roles.filter(id => id !== roleId);
      
      // Si on désactive l'Avocat, désactiver aussi le Sniper
      if (roleId === 'avocat_diable') {
        roles = roles.filter(id => id !== 'sniper');
      }
    }
    
    gameState.setEnabledRoles(roles);
  }

  updateStartButton() {
    const btn = this.screen.querySelector('#btn-start');
    const validPlayers = gameState.players.filter(p => p.name.trim().length > 0);
    
    if (validPlayers.length >= this.minPlayers) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  }

  startGame() {
    // Filtrer les joueurs sans nom
    gameState.players = gameState.players.filter(p => p.name.trim().length > 0);
    
    if (gameState.players.length < this.minPlayers) {
      alert(`Il faut au moins ${this.minPlayers} joueurs !`);
      return;
    }

    // Sauvegarder la configuration
    gameState.saveConfiguration();
    
    // Initialiser la partie
    gameState.round = 1;
    gameState.answers = [];
    gameState.votes = {};
    gameState.currentPlayerIndex = 0;
    
    // Aller au bon écran selon le mode
    if (gameState.gameMode === 'fictionnaire') {
      router.navigate('definition');
    } else {
      router.navigate('invention');
    }
  }
}

export default ConfigScreen;
