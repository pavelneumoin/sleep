/**
 * СоноТрекер - Викторина
 */

const questions = [
    {
        question: "Сколько часов сна в норме нужно детям 6-12 лет?",
        options: ["5-7 часов", "9-12 часов", "14-16 часов", "Без разницы"],
        answer: 1,
        explanation: "Правильно! Детям в этом возрасте для хорошего самочувствия нужно спать от 9 до 12 часов."
    },
    {
        question: "Что вырабатывает мозг в темноте, помогая нам уснуть?",
        options: ["Адреналин", "Витамин С", "Мелатонин", "Глюкозу"],
        answer: 2,
        explanation: "Верно! Мелатонин — это гормон сна, который вырабатывается только когда темно."
    },
    {
        question: "Что из этого лучше всего делать перед сном?",
        options: ["Играть в приставку", "Читать книгу", "Прыгать на батуте", "Пить сладкий чай"],
        answer: 1,
        explanation: "Молодец! Чтение книги или прослушивание спокойной истории расслабляет мозг."
    },
    {
        question: "В какой фазе сна мы видим самые яркие сновидения?",
        options: ["Медленный сон", "Глубокий сон", "Быстрый сон (REM)", "Дремота"],
        answer: 2,
        explanation: "Точно! Во время фазы быстрого сна (REM) наш мозг активно работает и показывает нам сны."
    },
    {
        question: "Зачем вообще нужно спать?",
        options: ["Чтобы дать отдых мышцам", "Чтобы мозг разложил информацию по полочкам", "Чтобы расти", "Всё вышеперечисленное"],
        answer: 3,
        explanation: "Правильно! Сон — это суперсила, которая укрепляет здоровье, память и помогает расти!"
    }
];

let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quiz-content')) {
        loadQuestion();

        document.getElementById('next-question-btn').addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                showFinalResult();
            }
        });
    }
});

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}: ${q.question}`;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    document.getElementById('quiz-message').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'none';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btnElement) {
    const q = questions[currentQuestionIndex];
    const optionsC = document.getElementById('options-container');
    const msgElement = document.getElementById('quiz-message');
    const nextBtn = document.getElementById('next-question-btn');

    // Блокируем все кнопки
    Array.from(optionsC.children).forEach(b => {
        b.disabled = true;
        b.style.cursor = 'default';
        b.style.opacity = '0.8';
    });

    if (selectedIndex === q.answer) {
        btnElement.classList.add('correct');
        msgElement.innerHTML = `✅ ${q.explanation}`;
        msgElement.style.color = 'var(--primary-mint)';
        score++;

        // Награда за ПРАВИЛЬНЫЙ ответ (5 звездочек)
        if (window.Gamification) {
            window.Gamification.rewardQuiz(5);
        }
    } else {
        btnElement.classList.add('wrong');
        optionsC.children[q.answer].classList.add('correct'); // показываем правильный
        msgElement.innerHTML = `❌ Ошибка. Правильный ответ: ${q.options[q.answer]}.<br>${q.explanation}`;
        msgElement.style.color = '#ff7675';
    }

    msgElement.style.display = 'block';
    nextBtn.style.display = 'block';

    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = 'Узнать результат 🏆';
    }
}

function showFinalResult() {
    const container = document.getElementById('quiz-content');
    let message = '';

    if (score === questions.length) {
        message = 'Идеально! Ты настоящий эксперт по сну! 🏆✨';
    } else if (score >= questions.length / 2) {
        message = 'Хороший результат! Ты много знаешь о сне. 👍';
    } else {
        message = 'Тебе стоит почитать раздел "Наука сна" повнимательнее! 📚👀';
    }

    container.innerHTML = `
        <div class="quiz-question">Викторина завершена! 🎉</div>
        <div style="font-size: 5rem; margin: 1rem 0;">${score}/${questions.length}</div>
        <div class="quiz-result" style="display: block; color: var(--primary-purple); margin-bottom: 2rem; font-weight: normal;">
            ${message}
        </div>
        <button class="quiz-btn" onclick="location.reload()" style="background: var(--primary-mint); color: white; border-color: var(--primary-mint); margin-top: 1rem;">Пройти ещё раз 🔄</button>
        <a href="sleep-science.html" class="quiz-btn" style="display: inline-block; text-decoration: none; margin-top: 1rem;">Почитать теорию 📖</a>
    `;
}
