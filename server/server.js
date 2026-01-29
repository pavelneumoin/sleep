/**
 * СоноТрекер - Сервер для YandexGPT
 * API ключи хранятся в переменных окружения (Environment Variables)
 */

const http = require('http');
const https = require('https');
const url = require('url');

// ========================================
// КОНФИГУРАЦИЯ YANDEX CLOUD
// ========================================
const CONFIG = {
    // Идентификатор каталога (folder_id) - ОБЯЗАТЕЛЬНО из переменной окружения!
    folderId: process.env.YANDEX_FOLDER_ID || '',

    // API ключ - ОБЯЗАТЕЛЬНО из переменной окружения!
    apiKey: process.env.YANDEX_API_KEY || '',

    // Настройки сервера - порт из Render или 3000 для локальной разработки
    port: process.env.PORT || 3000
};

// Проверка наличия ключей
if (!CONFIG.folderId || !CONFIG.apiKey) {
    console.error('❌ ОШИБКА: Не заданы переменные окружения YANDEX_FOLDER_ID и YANDEX_API_KEY!');
    console.log('Для локальной разработки создайте файл .env или задайте переменные вручную.');
}

// ========================================
// ПОЛУЧЕНИЕ IAM ТОКЕНА
// ========================================
let cachedIamToken = null;
let tokenExpiry = null;

async function getIamToken() {
    // Проверяем кэшированный токен
    if (cachedIamToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedIamToken;
    }

    return new Promise((resolve, reject) => {
        // Используем API ключ напрямую
        const options = {
            hostname: 'iam.api.cloud.yandex.net',
            port: 443,
            path: '/iam/v1/tokens',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Используем API ключ напрямую
        cachedIamToken = CONFIG.apiKey;
        tokenExpiry = Date.now() + 11 * 60 * 60 * 1000; // 11 часов
        resolve(cachedIamToken);
    });
}

// ========================================
// ЗАПРОС К YANDEXGPT
// ========================================
async function askYandexGPT(userMessage, context = 'sleep_helper') {
    const systemPrompts = {
        sleep_helper: `Ты — дружелюбное сонное облачко по имени Соня, помощник для детей 6-12 лет на сайте СоноТрекер. 
Твоя задача — отвечать на вопросы о сне простым, понятным языком для детей.
Используй эмодзи в ответах. Будь добрым и заботливым.
Отвечай кратко (2-4 предложения), но информативно.
Если вопрос не о сне — мягко верни разговор к теме сна.`,

        story_generator: `Ты — волшебный рассказчик сказок на ночь. 
Создавай короткие, добрые сказки (3-5 абзацев) для детей.
Сказки должны быть успокаивающими и помогать заснуть.
Используй мягкие образы: облака, звёзды, луна, добрые животные.
В конце сказки герой всегда засыпает сладким сном.`,

        dream_interpreter: `Ты — добрый толкователь снов для детей.
Объясняй сны позитивно и успокаивающе.
Никогда не пугай ребёнка — даже страшные сны объясняй как что-то хорошее.
Говори простым языком с эмодзи.`
    };

    const requestBody = {
        modelUri: `gpt://${CONFIG.folderId}/yandexgpt-lite`,
        completionOptions: {
            stream: false,
            temperature: 0.7,
            maxTokens: 500
        },
        messages: [
            {
                role: "system",
                text: systemPrompts[context] || systemPrompts.sleep_helper
            },
            {
                role: "user",
                text: userMessage
            }
        ]
    };

    return new Promise((resolve, reject) => {
        const data = JSON.stringify(requestBody);

        const options = {
            hostname: 'llm.api.cloud.yandex.net',
            port: 443,
            path: '/foundationModels/v1/completion',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${CONFIG.apiKey}`,
                'x-folder-id': CONFIG.folderId
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (parsed.result && parsed.result.alternatives) {
                        resolve(parsed.result.alternatives[0].message.text);
                    } else if (parsed.error) {
                        reject(new Error(parsed.error.message || 'Ошибка API'));
                    } else {
                        resolve(responseData);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

// ========================================
// HTTP СЕРВЕР
// ========================================
const server = http.createServer(async (req, res) => {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    // API эндпоинты
    if (req.method === 'POST' && parsedUrl.pathname === '/api/chat') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { message, context } = JSON.parse(body);
                const response = await askYandexGPT(message, context);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, response }));
            } catch (error) {
                console.error('Ошибка:', error);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/api/story') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, theme } = JSON.parse(body);
                const prompt = `Придумай короткую добрую сказку на ночь для ребёнка по имени ${name || 'малыш'}. Тема: ${theme || 'волшебный сон'}. Сказка должна быть успокаивающей.`;
                const response = await askYandexGPT(prompt, 'story_generator');
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, story: response }));
            } catch (error) {
                console.error('Ошибка:', error);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/api/dream') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { dream } = JSON.parse(body);
                const prompt = `Ребёнок рассказывает свой сон: "${dream}". Объясни ему, что этот сон может значить. Будь позитивным!`;
                const response = await askYandexGPT(prompt, 'dream_interpreter');
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, interpretation: response }));
            } catch (error) {
                console.error('Ошибка:', error);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    // Проверка работоспособности (основной путь)
    if (parsedUrl.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'Сервер СоноТрекер работает! 🌙' }));
        return;
    }

    // Проверка для Render (альтернативный путь)
    if (parsedUrl.pathname === '/healthz' || parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'СоноТрекер API Server v1.0 🌙' }));
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Не найдено' }));
});

server.listen(CONFIG.port, () => {
    console.log('');
    console.log('🌙 ═══════════════════════════════════════════');
    console.log('   СоноТрекер - Сервер YandexGPT запущен!');
    console.log('═══════════════════════════════════════════ 🌙');
    console.log('');
    console.log(`   📍 Адрес: http://localhost:${CONFIG.port}`);
    console.log('');
    console.log('   🔗 Эндпоинты:');
    console.log('      POST /api/chat  - Чат с облачком');
    console.log('      POST /api/story - Генерация сказки');
    console.log('      POST /api/dream - Толкование снов');
    console.log('      GET  /api/health - Проверка');
    console.log('');
    console.log('   💡 Чтобы остановить: Ctrl+C');
    console.log('');
});
