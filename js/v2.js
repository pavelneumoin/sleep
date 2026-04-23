// СоноТрекер V2 — общий JS для всех страниц
(function(){
  'use strict';

  // --- Мобильный гамбургер ---
  function setupHamburger(){
    var nav = document.querySelector('header nav');
    if(!nav) return;
    var headerContent = document.querySelector('.header-content');
    if(!headerContent) return;
    // Если кнопки нет — создаём
    var btn = document.querySelector('.mobile-menu-toggle');
    if(!btn){
      btn = document.createElement('button');
      btn.className = 'mobile-menu-toggle';
      btn.setAttribute('aria-label', 'Меню');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '☰';
      // Вставляем в header перед nav
      headerContent.appendChild(btn);
    }
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      btn.innerHTML = open ? '✕' : '☰';
      btn.setAttribute('aria-expanded', open);
    });
    // Закрыть при клике вне
    document.addEventListener('click', function(e){
      if(!nav.classList.contains('open')) return;
      if(!nav.contains(e.target) && !btn.contains(e.target)){
        nav.classList.remove('open');
        btn.innerHTML = '☰';
        btn.setAttribute('aria-expanded','false');
      }
    });
    // Закрыть при клике по ссылке
    nav.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){
        nav.classList.remove('open');
        btn.innerHTML = '☰';
      }
    });
  }

  // --- Toast helper ---
  window.toast = function(msg, opts){
    opts = opts || {};
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = (opts.icon || '💜') + ' ' + msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){
      t.classList.remove('show');
      setTimeout(function(){ t.remove(); }, 500);
    }, opts.duration || 2500);
  };

  // --- Анимированный счётчик значения ---
  window.animateNumber = function(element, from, to, duration){
    duration = duration || 800;
    var start = performance.now();
    function tick(now){
      var progress = Math.min(1, (now - start)/duration);
      var eased = 1 - Math.pow(1-progress, 3);
      var val = from + (to - from) * eased;
      element.textContent = Math.round(val);
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  // --- Оборачиваем таблицы в data-label для mobile cards ---
  function labelizeTables(){
    document.querySelectorAll('.history-table').forEach(function(table){
      var headers = [];
      table.querySelectorAll('thead th').forEach(function(th){
        headers.push(th.textContent.trim());
      });
      if(!headers.length) return;
      table.querySelectorAll('tbody tr').forEach(function(tr){
        tr.querySelectorAll('td').forEach(function(td, i){
          if(!td.hasAttribute('data-label') && headers[i]){
            td.setAttribute('data-label', headers[i]);
          }
        });
      });
    });
  }

  // --- Prefers-reduced-motion ---
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reducedMotion){
    document.documentElement.style.setProperty('--transition', 'none');
  }

  function revealOnScroll(){ /* disabled — вызывало баг opacity:0 на mobile full-page screenshots */ }

  // --- init ---
  function init(){
    setupHamburger();
    labelizeTables();
    revealOnScroll();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
