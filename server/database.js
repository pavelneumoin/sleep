const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Подключаемся к файлу БД (создастся, если нет)
const dbPath = path.join(__dirname, 'sonotracker.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Ошибка открытия БД:', err.message);
    } else {
        console.log('✅ Успешное подключение к SQLite базе данных.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Таблица пользователей
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            token TEXT UNIQUE
        )`);

        // Таблица статистики пользователя (звезды и стрики)
        db.run(`CREATE TABLE IF NOT EXISTS user_stats (
            user_id INTEGER PRIMARY KEY,
            total_stars INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            last_record_date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Таблица записей сна
        db.run(`CREATE TABLE IF NOT EXISTS sleep_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            sleep_time TEXT,
            wake_time TEXT,
            duration REAL,
            efficiency INTEGER,
            quality INTEGER,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);
    });
}

// Вспомогательная функция обертки в Promise
const run = (query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const get = (query, params = []) => new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const all = (query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

// ======================= API ФУНКЦИИ =======================

async function registerUser(username, password) {
    const existing = await get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
        throw new Error('Пользователь с таким именем уже существует');
    }
    const hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    // Транзакция не нужна, делаем по очереди
    const result = await run('INSERT INTO users (username, password_hash, token) VALUES (?, ?, ?)', [username, hash, token]);
    const userId = result.lastID;

    await run('INSERT INTO user_stats (user_id, total_stars, current_streak) VALUES (?, 0, 0)', [userId]);

    return { token, userId, username };
}

async function loginUser(username, password) {
    const user = await get('SELECT id, password_hash, token FROM users WHERE username = ?', [username]);
    if (!user) throw new Error('Неверное имя пользователя или пароль');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('Неверное имя пользователя или пароль');

    // Генерируем новый токен при каждом входе для безопасности
    const newToken = crypto.randomBytes(32).toString('hex');
    await run('UPDATE users SET token = ? WHERE id = ?', [newToken, user.id]);

    return { token: newToken, userId: user.id, username };
}

async function getUserByToken(token) {
    if (!token) return null;
    return await get('SELECT id, username FROM users WHERE token = ?', [token]);
}

async function getUserStats(userId) {
    return await get('SELECT total_stars, current_streak FROM user_stats WHERE user_id = ?', [userId]);
}

async function addStars(userId, amount) {
    await run('UPDATE user_stats SET total_stars = total_stars + ? WHERE user_id = ?', [amount, userId]);
    return await getUserStats(userId);
}

async function addSleepRecord(userId, recordData) {
    const { date, sleepTime, wakeTime, sleep_time, wake_time, duration, efficiency, quality, notes } = recordData;

    // Поддержка как camelCase так и snake_case
    const finalSleep = sleepTime || sleep_time;
    const finalWake = wakeTime || wake_time;

    await run(`
        INSERT INTO sleep_records (user_id, date, sleep_time, wake_time, duration, efficiency, quality, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, date, finalSleep, finalWake, duration, efficiency, quality, notes]);

    return { success: true };
}

async function getSleepRecords(userId) {
    return await all('SELECT id, user_id, date, sleep_time as sleepTime, wake_time as wakeTime, duration, efficiency, quality, notes FROM sleep_records WHERE user_id = ? ORDER BY date DESC LIMIT 30', [userId]);
}

module.exports = {
    registerUser,
    loginUser,
    getUserByToken,
    getUserStats,
    addStars,
    addSleepRecord,
    getSleepRecords
};
