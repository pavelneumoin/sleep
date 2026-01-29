/* ===================================================
   СоноТрекер - Логика трекера сна
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {
    const calculateButton = document.getElementById('calculate-sleep');

    if (calculateButton) {
        calculateButton.addEventListener('click', calculateSleep);
    }
});

function calculateSleep() {
    const sleepTime = document.getElementById('sleep-time').value;
    const wakeTime = document.getElementById('wake-time').value;
    const quality = document.getElementById('sleep-quality').value;

    if (!sleepTime || !wakeTime) {
        alert('Пожалуйста, введите время отхода ко сну и пробуждения');
        return;
    }

    // Расчет продолжительности сна
    const sleep = new Date(`2000-01-01T${sleepTime}`);
    let wake = new Date(`2000-01-01T${wakeTime}`);

    // Если время пробуждения раньше времени засыпания, значит сон перешел на следующий день
    if (wake < sleep) {
        wake = new Date(wake.getTime() + 24 * 60 * 60 * 1000);
    }

    const durationMs = wake - sleep;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    // Расчет эффективности сна (простая формула)
    const efficiency = Math.min(100, 80 + (quality * 4));

    // Рекомендации
    let recommendation = '';
    if (hours < 7) {
        recommendation = 'Вам стоит увеличить продолжительность сна. Взрослым рекомендуется спать 7-9 часов.';
    } else if (hours > 9) {
        recommendation = 'Вы спите дольше рекомендованного. Избыток сна также может негативно влиять на здоровье.';
    } else {
        recommendation = 'Отличная продолжительность сна! Продолжайте в том же духе.';
    }

    if (quality < 3) {
        recommendation += ' Обратите внимание на качество вашего сна. Попробуйте применить наши советы для его улучшения.';
    }

    // Обновление результатов
    document.getElementById('sleep-duration').textContent = `Продолжительность сна: ${hours} часов ${minutes} минут`;
    document.getElementById('sleep-efficiency').textContent = `Эффективность сна: ${efficiency.toFixed(1)}%`;
    document.getElementById('sleep-recommendation').textContent = `Рекомендации: ${recommendation}`;

    // Показать результаты
    document.getElementById('sleep-result').classList.add('active');

    // Сохранение в localStorage для статистики
    const sleepRecord = {
        date: new Date().toISOString().split('T')[0],
        sleepTime,
        wakeTime,
        duration: `${hours}:${minutes}`,
        quality,
        efficiency
    };

    let sleepHistory = JSON.parse(localStorage.getItem('sleepHistory')) || [];
    sleepHistory.push(sleepRecord);
    localStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));
}
