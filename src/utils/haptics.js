/**
 * LYERS GAME - Haptic Feedback
 * Vibration API pour le feedback tactile
 */

/**
 * Vérifie si la vibration est supportée
 */
export function isVibrationSupported() {
  return 'vibrate' in navigator;
}

/**
 * Fait vibrer l'appareil
 * @param {number|number[]} pattern - Durée en ms ou pattern [vibration, pause, vibration, ...]
 */
export function vibrate(pattern) {
  if (isVibrationSupported()) {
    navigator.vibrate(pattern);
  }
}

/**
 * Vibration courte pour confirmation
 */
export function confirmVibration() {
  vibrate(50);
}

/**
 * Vibration pour succès
 */
export function successVibration() {
  vibrate([50, 50, 100]);
}

/**
 * Vibration pour erreur
 */
export function errorVibration() {
  vibrate([100, 50, 100, 50, 100]);
}

/**
 * Vibration pour alerte/attention
 */
export function alertVibration() {
  vibrate([200, 100, 200]);
}

/**
 * Vibration subtile pour le tap
 */
export function tapVibration() {
  vibrate(10);
}

/**
 * Vibration pour la révélation
 */
export function revealVibration() {
  vibrate([100, 50, 50, 50, 200]);
}

/**
 * Arrête toutes les vibrations
 */
export function stopVibration() {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
}

export default {
  isVibrationSupported,
  vibrate,
  confirmVibration,
  successVibration,
  errorVibration,
  alertVibration,
  tapVibration,
  revealVibration,
  stopVibration
};
