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

let currentGamificationData = { stars: 0, streak: 0, lastRecordDate: null };

function getGamificationData() {
    return currentGamificationData;
}

function saveGamificationData(data) {
    currentGamificationData = data;
    updateGamificationUI();
}

async function syncWithServer() {
    try {
        const response = await window.apiFetch('/user');
        if (response.success && response.stats) {
            currentGamificationData.stars = response.stats.total_stars;
            currentGamificationData.streak = response.stats.current_streak;
            updateGamificationUI();
        }
    } catch (e) {
        console.error("Failed to sync stats", e);
    }
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
    
    updateRewardsUI(data.stars);
}

// Обновление шкалы наград (Дорога Наград)
function updateRewardsUI(stars) {
    const fill = document.getElementById('reward-progress-fill');
    if (fill) {
        // Максимальная шкала = 50 звезд
        let percentage = (stars / 50) * 100;
        if (percentage > 100) percentage = 100;
        fill.style.width = percentage + '%';
        
        // Кнопка 10 звезд
        const btn10 = document.getElementById('claim-btn-10');
        const icon10 = document.getElementById('reward-icon-10');
        if (btn10 && icon10) {
            if (stars >= 10) {
                btn10.disabled = false;
                btn10.textContent = 'Открыть!';
                btn10.classList.add('primary-btn');
                btn10.classList.remove('secondary-btn');
                icon10.textContent = '🎁';
            }
        }
        
        // Кнопка 30 звезд
        const btn30 = document.getElementById('claim-btn-30');
        const icon30 = document.getElementById('reward-icon-30');
        if (btn30 && icon30) {
            if (stars >= 30) {
                btn30.disabled = false;
                btn30.textContent = 'Открыть!';
                btn30.classList.add('primary-btn');
                btn30.classList.remove('secondary-btn');
                icon30.textContent = '🎁';
            }
        }
    }
}

window.claimReward = function(cost, redirectUrl) {
    const data = getGamificationData();
    if (data.stars >= cost) {
        showRewardNotification(`Ура! Ты открыл новую награду! 🎉`);
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
    }
};

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
        let addedStars = 10;
        data.stars += 10; // +10 звезд за запись

        // Бонус за стрик каждые 3 дня
        if (data.streak > 0 && data.streak % 3 === 0) {
            addedStars += 15;
            data.stars += 15;
            showRewardNotification('🔥 3 дня подряд! +15 звёздочек!');
        } else {
            showRewardNotification('Твой сон записан! +10 звёздочек ⭐');
        }

        data.lastRecordDate = dateStr;
        saveGamificationData(data);

        // Sync stars with backend
        window.apiFetch('/quiz-reward', {
            method: 'POST',
            body: JSON.stringify({ stars: addedStars })
        });
    }
}

// Награда за правильный ответ в викторине
function rewardForQuiz(amount) {
    const data = getGamificationData();
    data.stars += amount;
    saveGamificationData(data);
    showRewardNotification(`Верно! +${amount} звёздочек ⭐`);

    // Sync stars with backend
    window.apiFetch('/quiz-reward', {
        method: 'POST',
        body: JSON.stringify({ stars: amount })
    });
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
    getData: getGamificationData,
    syncWithServer: syncWithServer
};
