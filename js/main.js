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
    initTheme();
    initNotifications();
    initSmartHeader();
});

// Умный скрывающийся хедер при скролле вниз
function initSmartHeader() {
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    if (!header) return;

    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop && currentScroll > 60) {
            // Крутим вниз — прячем хедер
            header.classList.add('header-hidden');
        } else {
            // Крутим вверх — показываем хедер
            header.classList.remove('header-hidden');
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
}

// Запрос пуш-уведомлений
function initNotifications() {
    if ("Notification" in window) {
        if (Notification.permission === "default") {
            // Запрашиваем тихо, чтобы не пугать
            setTimeout(() => {
                Notification.requestPermission();
            }, 5000);
        } else if (Notification.permission === "granted") {
            // Демонстрация: ставим будильник-напоминалку на 21:00
            scheduleBedtimeNotification();
        }
    }
}

function scheduleBedtimeNotification() {
    const now = new Date();
    const bedTime = new Date();
    bedTime.setHours(21, 0, 0, 0); // 21:00

    if (now > bedTime) return; // Уже позже 21:00

    const timeToWait = bedTime.getTime() - now.getTime();
    
    // В рамках демо-версии можно ставить таймаут (в PWA лучше использовать Service Worker Push API)
    setTimeout(() => {
        new Notification("💤 Время ложиться спать!", {
            body: "Соня уже зевает и зовет тебя в кроватку. Спокойной ночи!",
            icon: "/images/mascot.png"
        });
    }, timeToWait);
}

// Инициализация темной темы
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    if (localStorage.getItem('sonotracker_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '☀️ Свет';
    }

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('sonotracker_theme', 'dark');
            toggle.innerHTML = '☀️ Свет';
        } else {
            localStorage.setItem('sonotracker_theme', 'light');
            toggle.innerHTML = '🌙 Тема';
        }
    });
}


