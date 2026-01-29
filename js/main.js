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
});
