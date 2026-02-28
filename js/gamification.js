/**
 * СоноТрекер - Игровая механика (Геймификация)
 * Управление звёздочками и сериями (стриками)
 */

document.addEventListener('DOMContentLoaded', () => {
    initGamification();
});

function initGamification() {
    updateGamificationUI();
}

function getGamificationData() {
    return JSON.parse(localStorage.getItem('gamification') || '{"stars": 0, "streak": 0, "lastRecordDate": null}');
}

function saveGamificationData(data) {
    localStorage.setItem('gamification', JSON.stringify(data));
    updateGamificationUI();
}

function updateGamificationUI() {
    const data = getGamificationData();
    const starsEl = document.getElementById('total-stars');
    const streakEl = document.getElementById('current-streak');

    if (starsEl) {
        // Анимация при изменении
        if (starsEl.textContent !== data.stars.toString() && starsEl.textContent !== '0') {
            starsEl.parentElement.classList.add('pop-animation');
            setTimeout(() => starsEl.parentElement.classList.remove('pop-animation'), 500);
        }
        starsEl.textContent = data.stars;
    }

    if (streakEl) {
        streakEl.textContent = data.streak;
    }
}

// Вызывается при сохранении сна
function rewardForSleepRecord(dateStr) {
    const data = getGamificationData();

    // Проверка стрика
    if (data.lastRecordDate) {
        const lastDate = new Date(data.lastRecordDate);
        const currentDate = new Date(dateStr);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            data.streak += 1; // Подряд
        } else if (diffDays > 1) {
            data.streak = 1; // Сброс стрика
        }
    } else {
        data.streak = 1;
    }

    // Если уже сохраняли сегодня, не даем звездочки дважды
    if (data.lastRecordDate !== dateStr) {
        data.stars += 10; // +10 звезд за запись

        // Бонус за стрик каждые 3 дня
        if (data.streak > 0 && data.streak % 3 === 0) {
            data.stars += 15;
            showRewardNotification('🔥 3 дня подряд! +15 звёздочек!');
        } else {
            showRewardNotification('Твой сон записан! +10 звёздочек ⭐');
        }

        data.lastRecordDate = dateStr;
        saveGamificationData(data);
    }
}

// Награда за правильный ответ в викторине
function rewardForQuiz(amount) {
    const data = getGamificationData();
    data.stars += amount;
    saveGamificationData(data);
    showRewardNotification(`Верно! +${amount} звёздочек ⭐`);
}

function showRewardNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'reward-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Анимация появления и скрытия
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Экспорт
window.Gamification = {
    rewardSleep: rewardForSleepRecord,
    rewardQuiz: rewardForQuiz,
    getData: getGamificationData
};
