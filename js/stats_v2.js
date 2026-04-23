// СоноТрекер Statistics V2 — Chart.js визуализация
// Заменяет кастомные bar-графики на интерактивные Chart.js
(function(){
  'use strict';

  function waitForChart(cb){
    if(window.Chart){ cb(); return; }
    var tries = 0;
    var iv = setInterval(function(){
      if(window.Chart){ clearInterval(iv); cb(); return; }
      if(++tries > 50){ clearInterval(iv); console.warn('Chart.js не загрузился'); }
    }, 100);
  }

  function replaceContainer(id){
    var container = document.getElementById(id);
    if(!container) return null;
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.height = '280px';
    container.style.position = 'relative';
    var canvas = document.createElement('canvas');
    container.appendChild(canvas);
    return canvas;
  }

  function buildDurationChartV2(records){
    var canvas = replaceContainer('duration-chart');
    if(!canvas || !records || !records.length) return;

    var days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    var dayData = {};
    records.forEach(function(r){
      var d = new Date(r.date);
      var idx = (d.getDay()+6) % 7;
      dayData[idx] = parseFloat(r.duration);
    });
    var data = days.map(function(_, i){ return dayData[i] || 0; });
    var colors = data.map(function(h){
      return h >= 9 ? 'rgba(123,237,159,0.85)' : h >= 7 ? 'rgba(254,211,48,0.85)' : 'rgba(248,165,194,0.85)';
    });

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Часов сна',
          data: data,
          backgroundColor: colors,
          borderColor: 'rgba(155,126,217,0.95)',
          borderWidth: 2,
          borderRadius: 12,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(155,126,217,0.95)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(74,63,92,0.95)',
            padding: 12,
            cornerRadius: 12,
            titleFont: { family: 'Nunito', weight: '800', size: 14 },
            bodyFont: { family: 'Nunito', size: 13 },
            callbacks: {
              label: function(ctx){ return ctx.parsed.y.toFixed(1) + ' ч 🌙'; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              font: { family: 'Nunito', weight: '700' },
              color: '#6b5b7a',
              callback: function(v){ return v + 'ч'; }
            },
            grid: { color: 'rgba(155,126,217,0.1)' }
          },
          x: {
            ticks: {
              font: { family: 'Nunito', weight: '800', size: 13 },
              color: '#4a3f5c'
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  function buildQualityChartV2(records){
    var canvas = replaceContainer('quality-chart');
    if(!canvas || !records || !records.length) return;

    var days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    var dayData = {};
    records.forEach(function(r){
      var d = new Date(r.date);
      var idx = (d.getDay()+6) % 7;
      dayData[idx] = r.quality;
    });
    var data = days.map(function(_, i){ return dayData[i] || null; });

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Качество',
          data: data,
          borderColor: 'rgba(155,126,217,1)',
          backgroundColor: 'rgba(248,165,194,0.25)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: function(ctx){
            var v = ctx.parsed.y;
            return v >= 4 ? '#7bed9f' : v >= 3 ? '#fed330' : '#f8a5c2';
          },
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 7,
          pointHoverRadius: 10,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(74,63,92,0.95)',
            padding: 12,
            cornerRadius: 12,
            titleFont: { family: 'Nunito', weight: '800' },
            callbacks: {
              label: function(ctx){
                var emoji = ['😴','😕','😐','🙂','😊'][ctx.parsed.y - 1] || '😊';
                return emoji + ' Оценка: ' + ctx.parsed.y + '/5';
              }
            }
          }
        },
        scales: {
          y: {
            min: 1, max: 5,
            ticks: {
              stepSize: 1,
              font: { family: 'Nunito', weight: '700' },
              color: '#6b5b7a',
              callback: function(v){
                return ['😴','😕','😐','🙂','😊'][v-1] || '';
              }
            },
            grid: { color: 'rgba(155,126,217,0.1)' }
          },
          x: {
            ticks: { font: { family: 'Nunito', weight: '800', size: 13 }, color: '#4a3f5c' },
            grid: { display: false }
          }
        }
      }
    });
  }

  // Переопределяем оригинальные функции
  window.__sleepStatsV2 = {
    buildDurationChart: buildDurationChartV2,
    buildQualityChart: buildQualityChartV2
  };

  // Ждём пока оригинальный statistics.js отработает, потом перехватываем DATA
  function upgradeCharts(){
    waitForChart(function(){
      // Попытка взять records из того же API
      if(typeof window.apiFetch !== 'function'){ return; }
      window.apiFetch('/sleep').then(function(resp){
        var records = resp && resp.success && resp.records ? resp.records : [];
        if(!records.length) return;
        var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
        var week = records.filter(function(r){ return new Date(r.date) >= weekAgo; });
        if(week.length){
          buildDurationChartV2(week);
          buildQualityChartV2(week);
        }
      }).catch(function(){});
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(upgradeCharts, 300);
    });
  } else {
    setTimeout(upgradeCharts, 300);
  }
})();
