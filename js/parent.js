/**
 * СоноТрекер - Родительская панель
 */

let currentPin = '';
const REQUIRED_PIN = '1234';

function enterPin(num) {
    if (currentPin.length < 4) {
        currentPin += num;
        updatePinUI();
        
        if (currentPin.length === 4) {
            checkPin();
        }
    }
}

function clearPin() {
    currentPin = '';
    document.getElementById('pin-error').style.display = 'none';
    updatePinUI();
}

function updatePinUI() {
    for (let i = 1; i <= 4; i++) {
        const circle = document.getElementById(`pin-${i}`);
        if (i <= currentPin.length) {
            circle.classList.add('filled');
        } else {
            circle.classList.remove('filled');
        }
    }
}

function checkPin() {
    if (currentPin === REQUIRED_PIN) {
        // Успех
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('parent-dashboard').style.display = 'block';
        loadChildData();
    } else {
        // Ошибка
        document.getElementById('pin-error').style.display = 'block';
        setTimeout(() => {
            clearPin();
        }, 1000);
    }
}

function loadChildData() {
    const starsEl = document.getElementById('child-stars');
    const streakEl = document.getElementById('child-streak');
    
    // Пытаемся получить данные из сервера или локалстораджа
    if (window.Gamification) {
        const data = window.Gamification.getData();
        if (starsEl) starsEl.textContent = data.stars;
        if (streakEl) streakEl.textContent = data.streak;
    }
}
