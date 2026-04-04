// Logic for Voice IT Interview Gamification
document.addEventListener('DOMContentLoaded', () => {
    const grade = localStorage.getItem('interview_grade') || 'Senior';
    const stack = localStorage.getItem('interview_stack') || 'Frontend (JS/React)';
    
    document.getElementById('profile-info').textContent = `Профиль: ${grade} | ${stack}`;
    
    const chat = document.getElementById('chat');
    const micBtn = document.getElementById('mic-btn');
    const micStatus = document.getElementById('mic-status');
    
    let isRecording = false;
    let recognition;
    
    // Инициализация Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('recording');
            micStatus.textContent = 'Слушаю вас... (нажмите чтобы остановить)';
        };
        
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            addMessage(transcript, 'user');
            
            // Отправляем ответ ИИ-Интервьюеру
            micBtn.disabled = true;
            micStatus.textContent = 'Интервьюер думает...';
            
            try {
                // Добавляем контекст (грейд и стек) в сообщение, чтобы YandexGPT помнил о них
                const prompt = `Кандидат (${grade}, ${stack}) отвечает: "${transcript}". Проанализируй, задай следующий вопрос и поставь оценку.`;
                const response = await askAI(prompt, 'interviewer');
                addMessage(response.text || response, 'ai');
            } catch (err) {
                console.error(err);
                addMessage('Извините, проблема со связью с сервером.', 'ai');
            }
            
            micBtn.disabled = false;
            micStatus.textContent = 'Нажмите и говорите';
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isRecording = false;
            micBtn.classList.remove('recording');
            micStatus.textContent = 'Ошибка микрофона. Нажмите снова.';
        };
        
        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove('recording');
            if (micStatus.textContent === 'Слушаю вас... (нажмите чтобы остановить)') {
                micStatus.textContent = 'Распознавание завершено';
            }
        };
    } else {
        micStatus.textContent = 'Голосовой ввод не поддерживается в этом браузере.';
        micBtn.disabled = true;
    }
    
    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg msg-${sender}`;
        div.textContent = text;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
    
    // Приветственное слово Интервьюера
    setTimeout(() => {
        addMessage(`Приветствую! Я буду проводить техническое интервью на грейд ${grade} по стеку ${stack}. Готов к первому вопросу? Нажми на микрофон и поехали.`, 'ai');
    }, 500);
});
