// Gestion du compteur de session (6h et 3 générations max)
const SESSION_KEY = 'invoice_session';
const MAX_GENERATIONS = 3;
const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 heures en millisecondes

function getSession() {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function initSession() {
    const now = Date.now();
    const session = {
        startTime: now,
        count: 0
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

function resetSessionIfExpired() {
    const session = getSession();
    if (!session) return initSession();
    const now = Date.now();
    if (now - session.startTime > SESSION_DURATION) {
        // Expiré, on réinitialise
        return initSession();
    }
    return session;
}

function canGenerate() {
    const session = resetSessionIfExpired();
    return session.count < MAX_GENERATIONS;
}

function incrementGenerationCount() {
    const session = resetSessionIfExpired();
    session.count += 1;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session.count;
}

function getRemainingTime() {
    const session = resetSessionIfExpired();
    const now = Date.now();
    const elapsed = now - session.startTime;
    const remaining = Math.max(0, SESSION_DURATION - elapsed);
    return remaining;
}

function getRemainingGenerations() {
    const session = resetSessionIfExpired();
    return Math.max(0, MAX_GENERATIONS - session.count);
}

function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateCountdownDisplay() {
    const timerEl = document.getElementById('countdown-timer');
    const leftEl = document.getElementById('generation-left');
    if (!timerEl || !leftEl) return;

    const remainingTime = getRemainingTime();
    const remainingGen = getRemainingGenerations();

    timerEl.textContent = formatTime(remainingTime);
    leftEl.textContent = remainingGen;

    // Si plus de temps ou plus de générations, on peut désactiver le bouton (dans main.js)
}

// Mise à jour toutes les secondes
let countdownInterval;
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdownDisplay, 1000);
    updateCountdownDisplay(); // appel immédiat
}

// Export pour utilisation dans main.js
window.SessionManager = {
    canGenerate,
    incrementGenerationCount,
    getRemainingGenerations,
    getRemainingTime,
    startCountdown,
    updateCountdownDisplay
};
