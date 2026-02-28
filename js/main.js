/* ===================================================
   СоноТрекер - Общие скрипты
   =================================================== */

// Инициализация аккордеона
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = content.classList.contains('active');

            // Закрыть все открытые аккордеоны
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelectorAll('.accordion-header').forEach(item => {
                item.classList.remove('active');
            });

            // Открыть текущий, если он был закрыт
            if (!isActive) {
                content.classList.add('active');
                header.classList.add('active');
            }
        });
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    initAccordion();
    checkAuthState();
});

// ===================================================
// API Клиент и Авторизация
// ===================================================

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

window.apiFetch = async function (endpoint, options = {}) {
    const token = localStorage.getItem('sonotracker_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('sonotracker_token');
        localStorage.removeItem('sonotracker_username');
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
            window.location.href = 'login.html';
        }
    }

    return response.json();
};

function checkAuthState() {
    const token = localStorage.getItem('sonotracker_token');
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');

    if (!token && !isAuthPage) {
        // Ограничиваем доступ без входа
        window.location.href = 'login.html';
        return;
    }

    if (token && isAuthPage) {
        window.location.href = 'index.html';
        return;
    }

    // Если авторизован, добавляем кнопку Выйти в меню
    if (token && !isAuthPage) {
        const nav = document.querySelector('nav ul');
        if (nav && !document.getElementById('logout-btn')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="#" id="logout-btn" style="background: rgba(255,100,100,0.2);">🚪 Выйти</a>';
            nav.appendChild(li);

            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('sonotracker_token');
                localStorage.removeItem('sonotracker_username');
                window.location.href = 'login.html';
            });
        }

        // Синхронизируем статистику с сервером
        if (window.Gamification && window.Gamification.syncWithServer) {
            window.Gamification.syncWithServer();
        }
    }
}
