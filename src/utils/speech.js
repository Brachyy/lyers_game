/**
 * LYERS GAME - Web Speech API
 * Synthèse vocale pour lire les réponses
 */

let voices = [];
let frenchVoice = null;

/**
 * Initialise les voix disponibles
 */
export function initSpeech() {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API non supportée');
      resolve(false);
      return;
    }
    
    const loadVoices = () => {
      voices = speechSynthesis.getVoices();
      
      // Chercher une voix française
      frenchVoice = voices.find(v => v.lang.startsWith('fr')) 
        || voices.find(v => v.lang.includes('FR'))
        || voices[0];
      
      resolve(true);
    };
    
    // Les voix peuvent ne pas être disponibles immédiatement
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
      // Timeout au cas où l'événement ne se déclenche pas
      setTimeout(() => {
        if (voices.length === 0) loadVoices();
      }, 1000);
    }
  });
}

/**
 * Lit un texte à voix haute
 */
export function speak(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    
    // Annuler toute lecture en cours
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurer la voix
    utterance.voice = frenchVoice;
    utterance.lang = 'fr-FR';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        reject(e);
      } else {
        resolve();
      }
    };
    
    speechSynthesis.speak(utterance);
  });
}

/**
 * Lit une réponse avec effet dramatique
 */
export async function speakAnswer(text, letterPrefix = '') {
  const intro = letterPrefix ? `Réponse ${letterPrefix}:` : '';
  await speak(`${intro} ${text}`, { rate: 0.85 });
}

/**
 * Annonce dramatique
 */
export async function speakAnnouncement(text) {
  await speak(text, { rate: 0.8, pitch: 1.1 });
}

/**
 * Lecture de la vraie réponse (révélation)
 */
export async function speakTruth(text) {
  await speak('Et la vraie réponse était...', { rate: 0.7, pitch: 0.9 });
  await new Promise(r => setTimeout(r, 500));
  await speak(text, { rate: 0.8, pitch: 1 });
}

/**
 * Arrête la lecture en cours
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

/**
 * Vérifie si la synthèse vocale est supportée
 */
export function isSpeechSupported() {
  return 'speechSynthesis' in window;
}

export default {
  initSpeech,
  speak,
  speakAnswer,
  speakAnnouncement,
  speakTruth,
  stopSpeaking,
  isSpeechSupported
};
