/**
 * СоноТрекер - ИИ Помощник
 * Интеграция с YandexGPT через локальный сервер
 */

const AI_SERVER = 'http://localhost:3000';

// Проверка доступности сервера
async function checkAIServer() {
    try {
        const response = await fetch(`${AI_SERVER}/api/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        return false;
    }
}

// Чат с облачком
async function chatWithCloud(message) {
    try {
        const response = await fetch(`${AI_SERVER}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context: 'sleep_helper' })
        });
        const data = await response.json();
        if (data.success) {
            return data.response;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Ошибка чата:', error);
        return getFallbackResponse(message);
    }
}

// Генерация сказки
async function generateStory(name, theme) {
    try {
        const response = await fetch(`${AI_SERVER}/api/story`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, theme })
        });
        const data = await response.json();
        if (data.success) {
            return data.story;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Ошибка генерации сказки:', error);
        return getFallbackStory(name);
    }
}

// Толкование снов
async function interpretDream(dream) {
    try {
        const response = await fetch(`${AI_SERVER}/api/dream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream })
        });
        const data = await response.json();
        if (data.success) {
            return data.interpretation;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Ошибка толкования:', error);
        return getFallbackDreamInterpretation();
    }
}

// Запасные ответы (если сервер недоступен)
function getFallbackResponse(message) {
    const responses = [
        "Привет! 🌙 Я Соня — твоё сонное облачко! К сожалению, сейчас я немного устала. Попробуй спросить позже!",
        "Ой, кажется я задремала! 😴 Спроси меня ещё разок попозже, хорошо?",
        "Мои облачные мысли сейчас отдыхают. Но я точно знаю — хороший сон очень важен! 💤"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function getFallbackStory(name) {
    return `🌙 Сказка для ${name || 'тебя'}

Жило-было маленькое облачко по имени Пушинка. Каждый вечер оно летало по небу и собирало сладкие сны для всех детей.

Однажды Пушинка встретило звёздочку, которая не могла уснуть. "Не волнуйся," — сказало облачко, — "Я знаю отличный секрет!"

Пушинка укутало звёздочку в своё мягкое облачное одеяло и запело тихую колыбельную. Звёздочка зевнула и закрыла глазки...

И ты тоже можешь закрыть глазки. Представь, что Пушинка укрывает тебя своим тёплым облачком. 

Сладких снов! ⭐💤`;
}

function getFallbackDreamInterpretation() {
    return "Твой сон говорит о том, что у тебя богатое воображение! 🌈 Сны — это как волшебные мультики, которые показывает нам мозг. Не волнуйся, все сны — это нормально! 💜";
}

// Обновление UI при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    const aiStatusElement = document.getElementById('ai-status');
    if (aiStatusElement) {
        const isAvailable = await checkAIServer();
        if (isAvailable) {
            aiStatusElement.textContent = '🟢 Облачко готово помочь!';
            aiStatusElement.className = 'ai-status ai-online';
        } else {
            aiStatusElement.textContent = '🟡 Облачко отдыхает (оффлайн режим)';
            aiStatusElement.className = 'ai-status ai-offline';
        }
    }
});

// Экспорт функций
window.SonoAI = {
    chat: chatWithCloud,
    story: generateStory,
    dream: interpretDream,
    checkServer: checkAIServer
};
