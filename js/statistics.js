/**
 * СоноТрекер - Статистика
 * Отображение данных и графиков
 */

document.addEventListener('DOMContentLoaded', function () {
    loadStatistics();
    loadHistory();
});

// Загрузка статистики
function loadStatistics() {
    const history = JSON.parse(localStorage.getItem('sleepHistory') || '[]');

    if (history.length === 0) {
        return;
    }

    // Берём записи за последнюю неделю
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRecords = history.filter(r => new Date(r.date) >= weekAgo);

    if (weekRecords.length > 0) {
        // Средняя продолжительность
        const avgDuration = weekRecords.reduce((sum, r) => sum + parseFloat(r.duration), 0) / weekRecords.length;
        document.getElementById('avg-sleep').textContent = avgDuration.toFixed(1) + ' ч';

        // Средняя эффективность
        const avgEfficiency = weekRecords.reduce((sum, r) => sum + r.efficiency, 0) / weekRecords.length;
        document.getElementById('avg-efficiency').textContent = Math.round(avgEfficiency) + '%';

        // Среднее качество
        const avgQuality = weekRecords.reduce((sum, r) => sum + r.quality, 0) / weekRecords.length;
        document.getElementById('avg-quality').textContent = avgQuality.toFixed(1);

        // Регулярность (сколько дней из 7 есть записи)
        const consistency = Math.round((weekRecords.length / 7) * 100);
        document.getElementById('consistency').textContent = consistency + '%';

        // Строим графики
        buildDurationChart(weekRecords);
        buildQualityChart(weekRecords);
    }
}

// График продолжительности сна
function buildDurationChart(records) {
    const container = document.getElementById('duration-chart');
    if (!container) return;

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const maxHeight = 200;
    const maxHours = 12;

    // Группируем по дням недели
    const dayData = {};
    records.forEach(r => {
        const date = new Date(r.date);
        const dayIndex = (date.getDay() + 6) % 7; // Понедельник = 0
        dayData[dayIndex] = parseFloat(r.duration);
    });

    let chartHTML = '';
    for (let i = 0; i < 7; i++) {
        const hours = dayData[i] || 0;
        const height = (hours / maxHours) * maxHeight;
        const color = hours >= 9 ? '#7bed9f' : hours >= 7 ? '#fed330' : '#f8a5c2';

        chartHTML += `
            <div class="chart-bar" style="height: ${height}px; background: linear-gradient(180deg, ${color}, #9b7ed9);">
                <span class="chart-label">${days[i]}</span>
            </div>
        `;
    }

    container.innerHTML = chartHTML || '<div class="no-data">Нет данных за эту неделю</div>';
}

// График качества сна
function buildQualityChart(records) {
    const container = document.getElementById('quality-chart');
    if (!container) return;

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const maxHeight = 200;

    // Группируем по дням недели
    const dayData = {};
    records.forEach(r => {
        const date = new Date(r.date);
        const dayIndex = (date.getDay() + 6) % 7;
        dayData[dayIndex] = r.quality;
    });

    let chartHTML = '';
    for (let i = 0; i < 7; i++) {
        const quality = dayData[i] || 0;
        const height = (quality / 5) * maxHeight;
        const colors = {
            5: '#7bed9f',
            4: '#7ec8e3',
            3: '#fed330',
            2: '#f8a5c2',
            1: '#ff7675'
        };
        const color = colors[quality] || '#e8e0f0';

        chartHTML += `
            <div class="chart-bar" style="height: ${height}px; background: linear-gradient(180deg, ${color}, #9b7ed9);">
                <span class="chart-label">${days[i]}</span>
            </div>
        `;
    }

    container.innerHTML = chartHTML || '<div class="no-data">Нет данных за эту неделю</div>';
}

// Загрузка истории
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('sleepHistory') || '[]');
    const tbody = document.getElementById('sleep-history-body');
    const noDataMessage = document.getElementById('no-history-message');

    if (!tbody) return;

    if (history.length === 0) {
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }

    if (noDataMessage) noDataMessage.style.display = 'none';

    const qualityEmojis = {
        5: '😊 Супер!',
        4: '🙂 Хорошо',
        3: '😐 Нормально',
        2: '😕 Не очень',
        1: '😴 Плохо'
    };

    const qualityClasses = {
        5: 'quality-excellent',
        4: 'quality-good',
        3: 'quality-average',
        2: 'quality-poor',
        1: 'quality-bad'
    };

    let html = '';
    history.slice(0, 10).forEach(record => {
        const date = new Date(record.date);
        const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        const hours = Math.floor(parseFloat(record.duration));
        const minutes = Math.round((parseFloat(record.duration) - hours) * 60);

        html += `
            <tr>
                <td>${dateStr}</td>
                <td>${record.sleepTime}</td>
                <td>${record.wakeTime}</td>
                <td>${hours}ч ${minutes}м</td>
                <td><span class="quality-badge ${qualityClasses[record.quality]}">${qualityEmojis[record.quality]}</span></td>
                <td>${record.efficiency}%</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}
