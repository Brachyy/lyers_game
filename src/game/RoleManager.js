/**
 * LYERS GAME - Role Manager
 * Algorithme de distribution des rôles
 */

import ROLES, { getRoleById, generateMission } from './roles.js';

/**
 * Mélange un tableau (Fisher-Yates)
 */
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sélectionne un élément aléatoire dans un tableau
 */
function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Distribue les rôles aux joueurs
 * @param {Array} players - Liste des joueurs
 * @param {Array} enabledRoleIds - IDs des rôles activés
 * @param {Array} answers - Liste des réponses inventées
 * @param {string} trueAnswer - La vraie réponse
 * @returns {Object} - Map playerId -> roleData
 */
export function distributeRoles(players, enabledRoleIds, answers, trueAnswer) {
  const assignments = {};
  const shuffledPlayers = shuffle(players);
  
  // Créer la liste des rôles spéciaux à distribuer
  let specialRoles = enabledRoleIds
    .filter(id => id !== 'innocent')
    .map(id => getRoleById(id))
    .filter(Boolean);
  
  // Mélanger les rôles spéciaux
  specialRoles = shuffle(specialRoles);
  
  // Assigner les rôles spéciaux (max 1 de chaque)
  let specialIndex = 0;
  const avocatPlayerId = null;
  
  for (let i = 0; i < shuffledPlayers.length && specialIndex < specialRoles.length; i++) {
    const player = shuffledPlayers[i];
    const role = specialRoles[specialIndex];
    
    // Préparer les données spécifiques au rôle
    const roleData = {
      roleId: role.id,
      role: role,
      mission: role.mission || ''
    };
    
    // Gérer les rôles nécessitant des données supplémentaires
    if (role.requiresAssignment && answers.length > 0) {
      // L'Avocat du Diable reçoit une fausse réponse à faire gagner
      const fakeAnswers = answers.filter(a => !a.isTruth && a.playerId !== player.id);
      if (fakeAnswers.length > 0) {
        const assignedAnswer = randomPick(fakeAnswers);
        roleData.assignedAnswer = assignedAnswer.text;
        roleData.assignedAnswerId = assignedAnswer.id;
        roleData.mission = generateMission(role, { assignedAnswer: assignedAnswer.text });
      }
    } else if (role.requiresTarget) {
      // Le Copieur doit suivre un autre joueur
      const otherPlayers = players.filter(p => p.id !== player.id);
      if (otherPlayers.length > 0) {
        const targetPlayer = randomPick(otherPlayers);
        roleData.targetPlayerId = targetPlayer.id;
        roleData.targetPlayerName = targetPlayer.name;
        roleData.mission = generateMission(role, { targetPlayer: targetPlayer.name });
      }
    } else if (role.requiresDualAnswers) {
      // L'Agent Double reçoit la vraie réponse + une fausse
      const fakeAnswers = answers.filter(a => !a.isTruth && a.playerId !== player.id);
      if (fakeAnswers.length > 0) {
        const fakeAnswer = randomPick(fakeAnswers);
        // Mélanger l'ordre pour qu'il ne sache pas laquelle est vraie
        const [a1, a2] = shuffle([trueAnswer, fakeAnswer.text]);
        roleData.answer1 = a1;
        roleData.answer2 = a2;
        roleData.mission = generateMission(role, { answer1: a1, answer2: a2 });
      }
    } else if (role.requiresTargetAnswer) {
      // L'Ombre doit empêcher une réponse de recevoir des votes
      const fakeAnswers = answers.filter(a => !a.isTruth && a.playerId !== player.id);
      if (fakeAnswers.length > 0) {
        const targetAnswer = randomPick(fakeAnswers);
        roleData.targetAnswer = targetAnswer.text;
        roleData.targetAnswerId = targetAnswer.id;
        roleData.mission = generateMission(role, { targetAnswer: targetAnswer.text });
      }
    } else if (role.requiresAvocatInGame) {
      // Le Sniper cherche l'Avocat du Diable
      roleData.mission = role.mission;
    } else {
      roleData.mission = generateMission(role);
    }
    
    assignments[player.id] = roleData;
    specialIndex++;
  }
  
  // Assigner l'Innocent à tous les joueurs restants
  const innocentRole = getRoleById('innocent');
  for (const player of shuffledPlayers) {
    if (!assignments[player.id]) {
      assignments[player.id] = {
        roleId: 'innocent',
        role: innocentRole,
        mission: innocentRole.mission
      };
    }
  }
  
  return assignments;
}

/**
 * Vérifie si l'Avocat du Diable est dans la partie
 */
export function hasAvocatDuDiable(roles) {
  return Object.values(roles).some(r => r.roleId === 'avocat_diable');
}

/**
 * Obtient l'ID du joueur qui est l'Avocat du Diable
 */
export function getAvocatDuDiableId(roles) {
  const entry = Object.entries(roles).find(([_, r]) => r.roleId === 'avocat_diable');
  return entry ? entry[0] : null;
}

/**
 * Obtient l'ID du joueur qui est le Sniper
 */
export function getSniperId(roles) {
  const entry = Object.entries(roles).find(([_, r]) => r.roleId === 'sniper');
  return entry ? entry[0] : null;
}

export default {
  distributeRoles,
  hasAvocatDuDiable,
  getAvocatDuDiableId,
  getSniperId
};
