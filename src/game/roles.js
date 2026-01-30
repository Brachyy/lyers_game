/**
 * LYERS GAME - Role Definitions
 * Définition de tous les rôles disponibles dans le jeu
 */

export const ROLES = {
  INNOCENT: {
    id: 'innocent',
    name: "L'Innocent",
    emoji: '😇',
    description: 'Doit trouver la vraie réponse.',
    mission: 'Vote pour la VRAIE réponse pour gagner des points !',
    color: '#10B981',
    isDefault: true // Toujours actif par défaut
  },
  AVOCAT_DIABLE: {
    id: 'avocat_diable',
    name: "L'Avocat du Diable",
    emoji: '😈',
    description: 'Reçoit une fausse réponse qu\'il DOIT faire gagner.',
    missionTemplate: 'Ta réponse imposée : "{assignedAnswer}". Convaincs tout le monde de voter pour elle !',
    color: '#EF4444',
    requiresAssignment: true
  },
  SNIPER: {
    id: 'sniper',
    name: 'Le Sniper',
    emoji: '🎯',
    description: 'Doit identifier l\'Avocat du Diable.',
    mission: 'Lors du vote final, désigne qui tu penses être l\'Avocat du Diable. Si tu trouves, tu gagnes gros !',
    color: '#FBBF24',
    requiresAvocatInGame: true
  },
  COPIEUR: {
    id: 'copieur',
    name: 'Le Copieur',
    emoji: '🪞',
    description: 'Doit voter comme un joueur spécifique.',
    missionTemplate: 'Tu dois voter comme {targetPlayer}. Si tu votes la même chose que lui/elle, tu gagnes un bonus !',
    color: '#06B6D4',
    requiresTarget: true
  },
  KAMIKAZE: {
    id: 'kamikaze',
    name: 'Le Kamikaze',
    emoji: '💣',
    description: 'Fait voter pour sa réponse, mais vote pour la vérité.',
    mission: 'Convaincs les autres de voter pour TA réponse inventée. Mais toi, tu dois voter la vraie réponse !',
    color: '#F97316'
  },
  AGENT_DOUBLE: {
    id: 'agent_double',
    name: "L'Agent Double",
    emoji: '🕵️',
    description: 'Reçoit 2 réponses sans savoir laquelle est vraie.',
    missionTemplate: 'Réponses possibles : "{answer1}" OU "{answer2}". Une seule est vraie, à toi de deviner !',
    color: '#8B5CF6',
    requiresDualAnswers: true
  },
  OMBRE: {
    id: 'ombre',
    name: "L'Ombre",
    emoji: '👻',
    description: 'Gagne si une réponse spécifique reçoit 0 vote.',
    missionTemplate: 'La réponse "{targetAnswer}" ne doit recevoir AUCUN vote ! Sabote-la discrètement.',
    color: '#64748B',
    requiresTargetAnswer: true
  }
};

/**
 * Obtient la liste des rôles sous forme de tableau
 */
export function getRolesList() {
  return Object.values(ROLES);
}

/**
 * Obtient un rôle par son ID
 */
export function getRoleById(id) {
  return Object.values(ROLES).find(role => role.id === id);
}

/**
 * Génère la mission personnalisée pour un rôle
 */
export function generateMission(role, data = {}) {
  if (role.missionTemplate) {
    let mission = role.missionTemplate;
    Object.entries(data).forEach(([key, value]) => {
      mission = mission.replace(`{${key}}`, value);
    });
    return mission;
  }
  return role.mission;
}

/**
 * Vérifie si un rôle peut être activé selon les contraintes
 */
export function canEnableRole(roleId, enabledRoles) {
  const role = getRoleById(roleId);
  
  // Le Sniper nécessite que l'Avocat du Diable soit activé
  if (roleId === 'sniper' && !enabledRoles.includes('avocat_diable')) {
    return { canEnable: false, reason: "Nécessite que L'Avocat du Diable soit activé" };
  }
  
  return { canEnable: true };
}

export default ROLES;
