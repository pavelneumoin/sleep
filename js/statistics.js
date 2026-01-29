/* ===================================================
   СоноТрекер - Логика статистики
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {
    const sleepHistory = JSON.parse(localStorage.getItem('sleepHistory')) || [];
    const historyBody = document.getElementById('sleep-history-body');
    const noHistoryMessage = document.getElementById('no-history-message');

    if (!historyBody) return; // Выходим, если не на странице статистики

    if (sleepHistory.length === 0) {
        noHistoryMessage.style.display = 'block';
        return;
    }

    noHistoryMessage.style.display = 'none';

    // Сортируем записи по дате (от новых к старым)
    sleepHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Отображаем последние 10 записей
    const recentHistory = sleepHistory.slice(0, 10);

    recentHistory.forEach(record => {
        const row = document.createElement('tr');

        // Форматируем дату
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('ru-RU');

        // Определяем качество сна
        let qualityText, qualityClass;
        if (record.quality >= 4.5) {
            qualityText = 'Отлично';
            qualityClass = 'quality-excellent';
        } else if (record.quality >= 3.5) {
            qualityText = 'Хорошо';
            qualityClass = 'quality-good';
        } else if (record.quality >= 2.5) {
            qualityText = 'Средне';
            qualityClass = 'quality-average';
        } else if (record.quality >= 1.5) {
            qualityText = 'Плохо';
            qualityClass = 'quality-poor';
        } else {
            qualityText = 'Очень плохо';
            qualityClass = 'quality-bad';
        }

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.sleepTime}</td>
            <td>${record.wakeTime}</td>
            <td>${record.duration}</td>
            <td><span class="quality-badge ${qualityClass}">${qualityText}</span></td>
            <td>${record.efficiency}%</td>
        `;

        historyBody.appendChild(row);
    });

    // Обновляем статистику
    updateStatistics(sleepHistory);

    // Создаем диаграммы
    createCharts(sleepHistory);
});

function updateStatistics(history) {
    if (history.length === 0) return;

    // Средняя продолжительность сна
    const totalDuration = history.reduce((sum, record) => {
        const [hours, minutes] = record.duration.split(':').map(Number);
        return sum + hours + minutes / 60;
    }, 0);
    const avgDuration = (totalDuration / history.length).toFixed(1);
    document.getElementById('avg-sleep').textContent = `${avgDuration} ч`;

    // Средняя эффективность
    const totalEfficiency = history.reduce((sum, record) => sum + parseFloat(record.efficiency), 0);
    const avgEfficiency = (totalEfficiency / history.length).toFixed(0);
    document.getElementById('avg-efficiency').textContent = `${avgEfficiency}%`;

    // Среднее качество
    const totalQuality = history.reduce((sum, record) => sum + parseInt(record.quality), 0);
    const avgQuality = (totalQuality / history.length).toFixed(1);
    document.getElementById('avg-quality').textContent = avgQuality;

    // Регулярность (процент дней с продолжительностью 7-9 часов)
    const regularDays = history.filter(record => {
        const [hours] = record.duration.split(':').map(Number);
        return hours >= 7 && hours <= 9;
    }).length;
    const consistency = ((regularDays / history.length) * 100).toFixed(0);
    document.getElementById('consistency').textContent = `${consistency}%`;
}

function createCharts(history) {
    if (history.length === 0) return;

    // Берем последние 7 записей
    const recentHistory = history.slice(0, 7).reverse();

    // Диаграмма продолжительности сна
    const durationChart = document.getElementById('duration-chart');
    if (durationChart) {
        durationChart.innerHTML = '';

        recentHistory.forEach(record => {
            const [hours, minutes] = record.duration.split(':').map(Number);
            const durationInHours = hours + minutes / 60;

            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(durationInHours / 10) * 100}%`;

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = new Date(record.date).toLocaleDateString('ru-RU', { weekday: 'short' });

            bar.appendChild(label);
            durationChart.appendChild(bar);
        });
    }

    // Диаграмма качества сна
    const qualityChart = document.getElementById('quality-chart');
    if (qualityChart) {
        qualityChart.innerHTML = '';

        recentHistory.forEach(record => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(record.quality / 5) * 100}%`;
            bar.style.backgroundColor = getQualityColor(record.quality);

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = new Date(record.date).toLocaleDateString('ru-RU', { weekday: 'short' });

            bar.appendChild(label);
            qualityChart.appendChild(bar);
        });
    }
}

function getQualityColor(quality) {
    if (quality >= 4.5) return '#27ae60';
    if (quality >= 3.5) return '#3498db';
    if (quality >= 2.5) return '#f1c40f';
    if (quality >= 1.5) return '#e67e22';
    return '#e74c3c';
}
