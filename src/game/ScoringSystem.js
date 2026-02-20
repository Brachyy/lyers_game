/**
 * LYERS GAME - Scoring System
 * Calcul des points selon les rôles et conditions de victoire
 */

import { getAvocatDuDiableId, getSniperId, hasAvocatDuDiable } from './RoleManager.js';

// Points de base (mode classique)
const POINTS = {
  FOUND_TRUTH: 10,           // Trouvé la vraie réponse
  FOOLED_PLAYER: 5,          // Un joueur a voté pour ta fausse réponse
  AVOCAT_SUCCESS: 15,        // L'Avocat a réussi sa mission
  SNIPER_SUCCESS: 20,        // Le Sniper a identifié l'Avocat
  SNIPER_FAILURE: -5,        // Le Sniper s'est trompé
  COPIEUR_SUCCESS: 8,        // Le Copieur a copié avec succès
  KAMIKAZE_SUCCESS: 12,      // Le Kamikaze a réussi
  OMBRE_SUCCESS: 10,         // L'Ombre a réussi
  BET_MULTIPLIER: 2          // Multiplicateur pour les mises réussies
};

// Gorgées (mode drinking game)
// Positif = gorgées à distribuer (récompense)
// Négatif = gorgées à prendre (pénalité)
const SIP_POINTS = {
  FOUND_TRUTH: 2,            // Tu distribues 2 gorgées
  FOOLED_PLAYER: 1,          // Tu distribues 1 gorgée par joueur trompé
  AVOCAT_SUCCESS: 3,         // L'Avocat distribue 3 gorgées
  SNIPER_SUCCESS: 3,         // Le Sniper distribue 3 gorgées
  SNIPER_FAILURE: -2,        // Le Sniper boit 2 gorgées
  COPIEUR_SUCCESS: 2,        // Le Copieur distribue 2 gorgées
  KAMIKAZE_SUCCESS: 2,       // Le Kamikaze distribue 2 gorgées
  OMBRE_SUCCESS: 2,          // L'Ombre distribue 2 gorgées
  BET_MULTIPLIER: 1          // Pas de multiplicateur en mode gorgée
};

/**
 * Obtient les points selon le mode (classique ou gorgée)
 */
function getPoints(sipMode) {
  return sipMode ? SIP_POINTS : POINTS;
}

/**
 * Formate le résultat en mode gorgée
 */
function formatSipResult(points, sipMode) {
  if (!sipMode) return { text: `${points} pts`, points };
  
  if (points > 0) {
    return { text: `${points} gorgée(s) à distribuer 🍻`, points, type: 'distribute' };
  } else if (points < 0) {
    return { text: `${Math.abs(points)} gorgée(s) à boire 🍺`, points, type: 'take' };
  }
  return { text: 'Rien', points: 0 };
}

/**
 * Calcule les résultats de la manche
 * @param {Object} gameState - État du jeu
 * @returns {Object} - Résultats détaillés
 */
export function calculateResults(gameState) {
  const { players, answers, votes, bets, roles, currentQuestion, sniperGuess, sipMode } = gameState;
  const pts = getPoints(sipMode);
  
  const results = {
    playerResults: {},
    revealedAnswers: [],
    highlights: []
  };
  
  // Préparer les réponses avec comptage des votes
  const truthText = gameState.gameMode === 'fictionnaire'
    ? gameState.currentWord?.definition
    : currentQuestion?.answer;

  const allAnswers = [
    ...answers,
    {
      id: 'truth',
      playerId: null,
      text: truthText,
      isTruth: true
    }
  ];
  
  // Compter les votes pour chaque réponse
  const voteCounts = {};
  allAnswers.forEach(a => voteCounts[a.id] = 0);
  
  Object.values(votes).forEach(answerId => {
    if (voteCounts[answerId] !== undefined) {
      voteCounts[answerId]++;
    }
  });
  
  // Initialiser les résultats des joueurs
  players.forEach(player => {
    results.playerResults[player.id] = {
      playerId: player.id,
      playerName: player.name,
      role: roles[player.id],
      pointsEarned: 0,
      breakdown: []
    };
  });
  
  // === Calcul des points ===
  
  // 1. Points pour avoir trouvé la vraie réponse
  Object.entries(votes).forEach(([playerId, answerId]) => {
    const result = results.playerResults[playerId];
    if (!result) return;
    
    if (answerId === 'truth') {
      const betAmount = bets[playerId] || 0;
      const multiplier = betAmount > 0 ? pts.BET_MULTIPLIER : 1;
      const points = pts.FOUND_TRUTH * multiplier;
      
      result.pointsEarned += points;
      result.breakdown.push({
        reason: sipMode 
          ? `${points} gorgée(s) à distribuer !` 
          : 'Trouvé la vraie réponse',
        points,
        emoji: '✅'
      });
    }
  });
  
  // 2. Points pour avoir trompé d'autres joueurs (réponse reçoit des votes)
  answers.forEach(answer => {
    const authorResult = results.playerResults[answer.playerId];
    if (!authorResult) return;
    
    const votesReceived = voteCounts[answer.id] || 0;
    if (votesReceived > 0) {
      const points = votesReceived * pts.FOOLED_PLAYER;
      authorResult.pointsEarned += points;
      authorResult.breakdown.push({
        reason: sipMode 
          ? `${points} gorgée(s) à distribuer (${votesReceived} trompés)` 
          : `${votesReceived} joueur(s) ont voté pour ta réponse`,
        points,
        emoji: '🎭'
      });
    }
  });
  
  // 3. Vérifier les conditions des rôles spéciaux
  
  // === L'Avocat du Diable ===
  const avocatId = getAvocatDuDiableId(roles);
  if (avocatId) {
    const avocatRole = roles[avocatId];
    const avocatResult = results.playerResults[avocatId];
    
    // L'Avocat gagne si sa réponse imposée reçoit le plus de votes
    const assignedAnswerId = avocatRole.assignedAnswerId;
    const assignedVotes = voteCounts[assignedAnswerId] || 0;
    const maxVotes = Math.max(...Object.values(voteCounts));
    
    if (assignedVotes === maxVotes && assignedVotes > 0) {
      avocatResult.pointsEarned += pts.AVOCAT_SUCCESS;
      avocatResult.breakdown.push({
        reason: sipMode 
          ? `${pts.AVOCAT_SUCCESS} gorgée(s) à distribuer !` 
          : 'Mission accomplie ! Ta réponse imposée a gagné',
        points: pts.AVOCAT_SUCCESS,
        emoji: '😈'
      });
      results.highlights.push({
        type: 'avocat_success',
        playerId: avocatId,
        message: `${avocatResult.playerName} était l'Avocat du Diable et a réussi sa mission !`
      });
    }
  }
  
  // === Le Sniper ===
  const sniperId = getSniperId(roles);
  if (sniperId && sniperGuess) {
    const sniperResult = results.playerResults[sniperId];
    
    if (avocatId && sniperGuess === avocatId) {
      sniperResult.pointsEarned += pts.SNIPER_SUCCESS;
      sniperResult.breakdown.push({
        reason: sipMode 
          ? `${pts.SNIPER_SUCCESS} gorgée(s) à distribuer !` 
          : 'Tu as identifié l\'Avocat du Diable !',
        points: pts.SNIPER_SUCCESS,
        emoji: '🎯'
      });
      results.highlights.push({
        type: 'sniper_success',
        playerId: sniperId,
        message: `${sniperResult.playerName} a démasqué l'Avocat du Diable !`
      });
    } else if (avocatId) {
      sniperResult.pointsEarned += pts.SNIPER_FAILURE;
      sniperResult.breakdown.push({
        reason: sipMode 
          ? `${Math.abs(pts.SNIPER_FAILURE)} gorgée(s) à boire !` 
          : 'Tu t\'es trompé sur l\'identité de l\'Avocat',
        points: pts.SNIPER_FAILURE,
        emoji: '🍺'
      });
    }
  }
  
  // === Le Copieur ===
  Object.entries(roles).forEach(([playerId, roleData]) => {
    if (roleData.roleId !== 'copieur') return;
    
    const copieurResult = results.playerResults[playerId];
    const targetPlayerId = roleData.targetPlayerId;
    
    if (targetPlayerId && votes[playerId] === votes[targetPlayerId]) {
      copieurResult.pointsEarned += pts.COPIEUR_SUCCESS;
      copieurResult.breakdown.push({
        reason: sipMode 
          ? `${pts.COPIEUR_SUCCESS} gorgée(s) à distribuer !` 
          : `Tu as copié ${roleData.targetPlayerName} avec succès`,
        points: pts.COPIEUR_SUCCESS,
        emoji: '🪞'
      });
    }
  });
  
  // === Le Kamikaze ===
  Object.entries(roles).forEach(([playerId, roleData]) => {
    if (roleData.roleId !== 'kamikaze') return;
    
    const kamikazeResult = results.playerResults[playerId];
    const kamikazeAnswer = answers.find(a => a.playerId === playerId);
    const kamikazeVote = votes[playerId];
    
    // Réussi si sa réponse reçoit des votes ET qu'il a voté pour la vérité
    if (kamikazeAnswer && kamikazeVote === 'truth') {
      const votesReceived = voteCounts[kamikazeAnswer.id] || 0;
      if (votesReceived > 0) {
        kamikazeResult.pointsEarned += pts.KAMIKAZE_SUCCESS;
        kamikazeResult.breakdown.push({
          reason: sipMode 
            ? `${pts.KAMIKAZE_SUCCESS} gorgée(s) à distribuer !` 
            : 'Mission Kamikaze réussie !',
          points: pts.KAMIKAZE_SUCCESS,
          emoji: '💣'
        });
      }
    }
  });
  
  // === L'Ombre ===
  Object.entries(roles).forEach(([playerId, roleData]) => {
    if (roleData.roleId !== 'ombre') return;
    
    const ombreResult = results.playerResults[playerId];
    const targetAnswerId = roleData.targetAnswerId;
    
    if (targetAnswerId && voteCounts[targetAnswerId] === 0) {
      ombreResult.pointsEarned += pts.OMBRE_SUCCESS;
      ombreResult.breakdown.push({
        reason: sipMode 
          ? `${pts.OMBRE_SUCCESS} gorgée(s) à distribuer !` 
          : 'Ta cible n\'a reçu aucun vote',
        points: pts.OMBRE_SUCCESS,
        emoji: '👻'
      });
    }
  });
  
  // Préparer les réponses révélées
  results.revealedAnswers = allAnswers.map(answer => {
    const author = players.find(p => p.id === answer.playerId);
    return {
      ...answer,
      authorName: author ? author.name : 'La vraie réponse',
      votesReceived: voteCounts[answer.id] || 0,
      voters: Object.entries(votes)
        .filter(([_, aId]) => aId === answer.id)
        .map(([pId]) => players.find(p => p.id === pId)?.name)
        .filter(Boolean)
    };
  });
  
  return results;
}

/**
 * Applique les résultats aux scores des joueurs
 */
export function applyResults(gameState, results) {
  Object.entries(results.playerResults).forEach(([playerId, result]) => {
    gameState.addScore(playerId, result.pointsEarned);
  });
}

export default {
  calculateResults,
  applyResults,
  POINTS
};
