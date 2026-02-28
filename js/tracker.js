/**
 * СоноТрекер - Трекер сна
 * Сохранение и анализ данных о сне
 */

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function () {
    initTracker();
    loadUserData();
});

// Инициализация трекера
function initTracker() {
    const calculateBtn = document.getElementById('calculate-sleep');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateSleep);
    }

    // Загружаем последние значения
    const lastSleep = localStorage.getItem('lastSleepTime');
    const lastWake = localStorage.getItem('lastWakeTime');

    if (lastSleep) {
        document.getElementById('sleep-time').value = lastSleep;
    }
    if (lastWake) {
        document.getElementById('wake-time').value = lastWake;
    }
}

// Загрузка данных пользователя
function loadUserData() {
    const userName = localStorage.getItem('userName');
    const userNameDisplay = document.getElementById('user-name-display');

    if (userName && userNameDisplay) {
        userNameDisplay.textContent = `Привет, ${userName}! 👋`;
    }
}

// Расчет сна
function calculateSleep() {
    const sleepTime = document.getElementById('sleep-time').value;
    const wakeTime = document.getElementById('wake-time').value;
    const quality = document.getElementById('sleep-quality').value;
    const notes = document.getElementById('sleep-notes').value;

    if (!sleepTime || !wakeTime) {
        alert('Пожалуйста, укажи время сна и пробуждения! 😊');
        return;
    }

    // Расчет продолжительности
    const sleepDate = new Date(`2000-01-01 ${sleepTime}`);
    let wakeDate = new Date(`2000-01-01 ${wakeTime}`);

    // Если время пробуждения раньше времени сна - добавляем день
    if (wakeDate <= sleepDate) {
        wakeDate = new Date(`2000-01-02 ${wakeTime}`);
    }

    const durationMs = wakeDate - sleepDate;
    const durationHours = durationMs / (1000 * 60 * 60);
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);

    // Оценка эффективности
    let efficiency = 0;
    let recommendation = '';
    let emoji = '';

    if (durationHours >= 9 && durationHours <= 11) {
        efficiency = 100;
        emoji = '🌟';
        recommendation = 'Отличный сон! Ты молодец!';
    } else if (durationHours >= 8 && durationHours < 9) {
        efficiency = 85;
        emoji = '😊';
        recommendation = 'Хороший сон! Попробуй поспать чуть дольше.';
    } else if (durationHours >= 7 && durationHours < 8) {
        efficiency = 70;
        emoji = '🙂';
        recommendation = 'Неплохо, но тебе нужно больше сна для роста!';
    } else if (durationHours < 7) {
        efficiency = 50;
        emoji = '😴';
        recommendation = 'Ой-ой! Тебе нужно спать больше! Ложись раньше.';
    } else if (durationHours > 11) {
        efficiency = 80;
        emoji = '😮';
        recommendation = 'Ты поспал очень долго! Это тоже не очень полезно.';
    }

    // Учитываем качество сна
    const qualityNum = parseInt(quality);
    efficiency = Math.round(efficiency * (qualityNum / 5));

    // Показываем результаты
    const resultDiv = document.getElementById('sleep-result');
    document.getElementById('sleep-duration').innerHTML = `<strong>⏱️ Продолжительность:</strong> ${hours} ч ${minutes} мин`;
    document.getElementById('sleep-efficiency').innerHTML = `<strong>${emoji} Качество сна:</strong> ${efficiency}%`;
    document.getElementById('sleep-recommendation').innerHTML = `<strong>💬 Совет от облачка:</strong> ${recommendation}`;

    resultDiv.classList.add('active');
    resultDiv.style.display = 'block';

    // Сохраняем данные
    saveSleepRecord({
        date: new Date().toISOString().split('T')[0],
        sleepTime: sleepTime,
        wakeTime: wakeTime,
        duration: durationHours.toFixed(1),
        quality: qualityNum,
        efficiency: efficiency,
        notes: notes
    });

    // Начисляем звёздочки
    if (window.Gamification) {
        window.Gamification.rewardSleep(new Date().toISOString().split('T')[0]);
    }

    // Сохраняем последние значения времени
    localStorage.setItem('lastSleepTime', sleepTime);
    localStorage.setItem('lastWakeTime', wakeTime);
}

// Сохранение записи о сне
function saveSleepRecord(record) {
    let history = JSON.parse(localStorage.getItem('sleepHistory') || '[]');

    // Проверяем, нет ли уже записи за сегодня
    const todayIndex = history.findIndex(r => r.date === record.date);
    if (todayIndex >= 0) {
        history[todayIndex] = record; // Обновляем
    } else {
        history.unshift(record); // Добавляем в начало
    }

    // Храним только последние 30 записей
    if (history.length > 30) {
        history = history.slice(0, 30);
    }

    localStorage.setItem('sleepHistory', JSON.stringify(history));
    console.log('💾 Запись сохранена:', record);
}

// Получение истории сна
function getSleepHistory() {
    return JSON.parse(localStorage.getItem('sleepHistory') || '[]');
}

// Получение статистики за неделю
function getWeeklyStats() {
    const history = getSleepHistory();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekRecords = history.filter(r => new Date(r.date) >= weekAgo);

    if (weekRecords.length === 0) {
        return null;
    }

    const avgDuration = weekRecords.reduce((sum, r) => sum + parseFloat(r.duration), 0) / weekRecords.length;
    const avgQuality = weekRecords.reduce((sum, r) => sum + r.quality, 0) / weekRecords.length;
    const avgEfficiency = weekRecords.reduce((sum, r) => sum + r.efficiency, 0) / weekRecords.length;

    return {
        avgDuration: avgDuration.toFixed(1),
        avgQuality: avgQuality.toFixed(1),
        avgEfficiency: Math.round(avgEfficiency),
        recordCount: weekRecords.length,
        records: weekRecords
    };
}

// Экспорт функций
window.SleepTracker = {
    calculate: calculateSleep,
    save: saveSleepRecord,
    getHistory: getSleepHistory,
    getWeeklyStats: getWeeklyStats
};
