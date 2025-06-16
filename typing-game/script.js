const words = [
    '蘋果', '香蕉', '電腦', '程式', '學習', '打字', '遊戲', '鍵盤', '速度', '正確',
    '挑戰', '練習', '智慧', '快樂', '成功', '努力', '創新', '科技', '未來', '夢想'
];

let currentWord = '';
let score = 0;
let isPlaying = true;

const wordDiv = document.getElementById('word');
const input = document.getElementById('input');
const resultDiv = document.getElementById('result');
const restartBtn = document.getElementById('restart');

function pickWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function showWord() {
    currentWord = pickWord();
    wordDiv.textContent = currentWord;
    input.value = '';
    input.focus();
}

input.addEventListener('input', () => {
    if (!isPlaying) return;
    if (input.value === currentWord) {
        score++;
        resultDiv.textContent = `正確！目前分數：${score}`;
        showWord();
    }
});

restartBtn.addEventListener('click', () => {
    score = 0;
    isPlaying = true;
    resultDiv.textContent = '';
    showWord();
});

// 初始化
showWord();
