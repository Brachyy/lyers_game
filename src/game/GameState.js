/**
 * LYERS GAME - Game State Manager
 * Gestion centralisée de l'état du jeu
 */

import { saveGame, loadGame, clearGame, saveConfig, loadConfig } from '../utils/storage.js';

class GameState {
  constructor() {
    this.reset();
    this.listeners = new Set();
  }

  /**
   * Réinitialise l'état du jeu
   */
  reset() {
    this.players = [];
    this.currentQuestion = null;
    this.answers = [];
    this.roles = {};
    this.votes = {};
    this.bets = {};
    this.sniperGuess = null;
    this.phase = 'home';
    this.currentPlayerIndex = 0;
    this.round = 0;
    this.totalRounds = 5;
    this.enabledRoles = ['innocent'];
    this.timerDuration = 120;
    this.sipMode = false; // Mode Gorgée (drinking game)
  }

  /**
   * Ajoute un écouteur d'événements
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifie tous les écouteurs d'un changement
   */
  notify() {
    this.listeners.forEach(listener => listener(this));
  }

  /**
   * Met à jour l'état et notifie
   */
  update(updates) {
    Object.assign(this, updates);
    this.notify();
    this.persist();
  }

  /**
   * Sauvegarde l'état dans le localStorage
   */
  persist() {
    saveGame({
      players: this.players,
      currentQuestion: this.currentQuestion,
      answers: this.answers,
      roles: this.roles,
      votes: this.votes,
      bets: this.bets,
      sniperGuess: this.sniperGuess,
      phase: this.phase,
      currentPlayerIndex: this.currentPlayerIndex,
      round: this.round,
      totalRounds: this.totalRounds,
      enabledRoles: this.enabledRoles,
      timerDuration: this.timerDuration,
      sipMode: this.sipMode
    });
  }

  /**
   * Charge l'état depuis le localStorage
   */
  load() {
    const saved = loadGame();
    if (saved) {
      Object.assign(this, saved);
      return true;
    }
    return false;
  }

  /**
   * Vérifie si une partie est en cours
   */
  hasActiveGame() {
    const saved = loadGame();
    return saved && saved.phase !== 'home' && saved.players.length > 0;
  }

  /**
   * Efface la partie sauvegardée
   */
  clear() {
    clearGame();
    this.reset();
    this.notify();
  }

  /**
   * Ajoute un joueur
   */
  addPlayer(name) {
    const id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.players.push({ id, name, score: 0 });
    this.notify();
  }

  /**
   * Supprime un joueur
   */
  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
    this.notify();
  }

  /**
   * Met à jour le nom d'un joueur
   */
  updatePlayerName(id, name) {
    const player = this.players.find(p => p.id === id);
    if (player) {
      player.name = name;
      this.notify();
    }
  }

  /**
   * Obtient le joueur actuel
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Passe au joueur suivant
   */
  nextPlayer() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.players.length) {
      this.currentPlayerIndex = 0;
      return false; // Tous les joueurs ont joué
    }
    this.notify();
    return true;
  }

  /**
   * Définit la question courante
   */
  setQuestion(question) {
    this.currentQuestion = question;
    this.notify();
  }

  /**
   * Ajoute une réponse inventée par un joueur
   */
  addAnswer(playerId, text) {
    // Vérifier si le joueur a déjà soumis une réponse
    const existingIndex = this.answers.findIndex(a => a.playerId === playerId);
    if (existingIndex >= 0) {
      this.answers[existingIndex].text = text;
    } else {
      this.answers.push({
        id: `answer_${Date.now()}`,
        playerId,
        text,
        isTruth: false,
        votes: 0
      });
    }
    this.notify();
  }

  /**
   * Obtient toutes les réponses (incluant la vraie) mélangées
   */
  getShuffledAnswers() {
    const allAnswers = [
      ...this.answers,
      {
        id: 'truth',
        playerId: null,
        text: this.currentQuestion?.answer,
        isTruth: true,
        votes: 0
      }
    ];
    
    // Fisher-Yates shuffle
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    return allAnswers;
  }

  /**
   * Définit le rôle d'un joueur
   */
  setPlayerRole(playerId, roleData) {
    this.roles[playerId] = roleData;
    this.notify();
  }

  /**
   * Enregistre le vote d'un joueur
   */
  setVote(playerId, answerId, betAmount = 0) {
    this.votes[playerId] = answerId;
    this.bets[playerId] = betAmount;
    this.notify();
  }

  /**
   * Enregistre la supposition du Sniper
   */
  setSniperGuess(suspectedPlayerId) {
    this.sniperGuess = suspectedPlayerId;
    this.notify();
  }

  /**
   * Ajoute des points à un joueur
   */
  addScore(playerId, points) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.score += points;
      this.notify();
    }
  }

  /**
   * Obtient le classement
   */
  getLeaderboard() {
    return [...this.players].sort((a, b) => b.score - a.score);
  }

  /**
   * Change de phase
   */
  setPhase(phase) {
    this.phase = phase;
    this.currentPlayerIndex = 0;
    this.notify();
  }

  /**
   * Passe à la manche suivante
   */
  nextRound() {
    this.round++;
    this.answers = [];
    this.votes = {};
    this.bets = {};
    this.sniperGuess = null;
    this.roles = {};
    this.currentPlayerIndex = 0;
    this.notify();
  }

  /**
   * Vérifie si le jeu est terminé
   */
  isGameOver() {
    return this.round >= this.totalRounds;
  }

  /**
   * Configure les rôles activés
   */
  setEnabledRoles(roles) {
    // L'innocent est toujours activé
    if (!roles.includes('innocent')) {
      roles.unshift('innocent');
    }
    this.enabledRoles = roles;
    this.notify();
  }

  /**
   * Configure la durée du timer
   */
  setTimerDuration(seconds) {
    this.timerDuration = seconds;
    this.notify();
  }

  /**
   * Sauvegarde la configuration dans le localStorage
   */
  saveConfiguration() {
    saveConfig({
      enabledRoles: this.enabledRoles,
      timerDuration: this.timerDuration,
      totalRounds: this.totalRounds,
      sipMode: this.sipMode
    });
  }

  /**
   * Charge la configuration depuis le localStorage
   */
  loadConfiguration() {
    const config = loadConfig();
    if (config) {
      if (config.enabledRoles) this.enabledRoles = config.enabledRoles;
      if (config.timerDuration) this.timerDuration = config.timerDuration;
      if (config.totalRounds) this.totalRounds = config.totalRounds;
      if (config.sipMode !== undefined) this.sipMode = config.sipMode;
    }
  }

  /**
   * Active/désactive le mode Gorgée
   */
  setSipMode(enabled) {
    this.sipMode = enabled;
    this.notify();
  }
}

// Instance singleton
export const gameState = new GameState();
export default gameState;
