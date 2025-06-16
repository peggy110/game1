console.log('sekai.js loaded');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const lanes = 4;
const laneWidth = canvas.width / lanes;
const keys = ['a', 's', 'd', 'f'];

const cockroachImg = new Image();
cockroachImg.src = 'cockroach.svg';
const slipperImg = new Image();
slipperImg.src = 'https://cdn.pixabay.com/photo/2016/03/31/19/14/slippers-1295580_1280.png';

const NOTE_SPEED = 4;
const NOTE_INTERVAL = 800;
let notes = [];
let score = 0;
let animationId;
let holding = [false, false, false, false];
let slipperEffects = [];

function spawnNote() {
    const lane = Math.floor(Math.random() * lanes);
    let isLong = Math.random() < 0.3;
    const height = isLong ? 120 : 30;
    notes.push({ lane, y: -height, isLong, height, holding: false, scored: false, pressedEffect: false });
}

function drawNotes() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 分隔線
        for (let i = 1; i < lanes; i++) {
            ctx.strokeStyle = '#444';
            ctx.beginPath();
            ctx.moveTo(i * laneWidth, 0);
            ctx.lineTo(i * laneWidth, canvas.height);
            ctx.stroke();
        }
        // 蟑螂音符
        notes.forEach(note => {
            ctx.save();
            let angle = 0;
            if (note.wavy === undefined) {
                note.wavy = Math.random() < 0.3;
                note.angle = (Math.random() - 0.5) * 0.6;
            }
            if (note.wavy) angle = note.angle;
            ctx.translate(note.lane * laneWidth + laneWidth / 2, note.y + note.height / 2);
            ctx.rotate(angle);
            if (cockroachImg.complete) {
                ctx.drawImage(cockroachImg, -((laneWidth - 20) / 2), -note.height / 2, laneWidth - 20, note.height);
            } else {
                ctx.fillStyle = '#222';
                ctx.fillRect(-((laneWidth - 20) / 2), -note.height / 2, laneWidth - 20, note.height);
            }
            ctx.restore();
        });
        // 判定線
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 80, canvas.width, 4);
        // 拖鞋顏色特效
        slipperEffects.forEach(eff => {
            ctx.save();
            ctx.globalAlpha = eff.alpha;
            ctx.beginPath();
            ctx.arc(eff.x, eff.y + 20, 28, 0, 2 * Math.PI);
            ctx.fillStyle = eff.isHit ? 'rgba(0,255,120,0.7)' : 'rgba(255,60,60,0.7)';
            ctx.fill();
            ctx.restore();
        });
    } catch (e) {
        console.error('drawNotes Error:', e);
    }
}

function updateNotes() {
    try {
        for (let i = notes.length - 1; i >= 0; i--) {
            const note = notes[i];
            note.y += NOTE_SPEED;
            if (note.y > canvas.height) notes.splice(i, 1);
        }
        // 拖鞋特效動畫
        for (let i = slipperEffects.length - 1; i >= 0; i--) {
            slipperEffects[i].alpha -= 0.05;
            if (slipperEffects[i].alpha <= 0) slipperEffects.splice(i, 1);
        }
    } catch (e) {
        console.error('updateNotes Error:', e);
    }
}

function gameLoop() {
    try {
        drawNotes();
        updateNotes();
        animationId = requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error('GameLoop Error:', e);
    }
}

function hitNote(lane) {
    try {
        let hit = false;
        const judgeLine = canvas.height - 80;
        const hitWindow = 40; // 判定範圍
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            if (note.lane !== lane) continue;
            if (!note.isLong) {
                // 短音符：中心點落在判定線附近
                const noteCenter = note.y + note.height / 2;
                if (Math.abs(noteCenter - judgeLine) <= hitWindow) {
                    notes.splice(i, 1);
                    score++;
                    scoreDiv.textContent = `分數：${score}`;
                    hit = true;
                    break;
                }
            } else {
                // 長音符：底部落在判定線附近
                const noteBottom = note.y + note.height;
                if (Math.abs(noteBottom - judgeLine) <= hitWindow) {
                    note.holding = true;
                    hit = true;
                    break;
                }
            }
        }
        // 拖鞋特效（命中顏色/未命中顏色）
        slipperEffects.push({
            x: lane * laneWidth + laneWidth / 2,
            y: canvas.height - 78,
            alpha: 1,
            isHit: hit
        });
    } catch (e) {
        console.error('hitNote Error:', e);
    }
}

document.addEventListener('keydown', (e) => {
    try {
        const key = e.key.toLowerCase();
        const lane = keys.indexOf(key);
        if (lane !== -1 && !holding[lane]) {
            holding[lane] = true;
            hitNote(lane);
        }
    } catch (e) {
        console.error('keydown Error:', e);
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    const lane = keys.indexOf(key);
    if (lane !== -1) {
        holding[lane] = false;
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            if (note.lane === lane && note.isLong && note.holding) {
                note.holding = false;
            }
        }
    }
});

let noteInterval;

function startGame() {
    notes = [];
    score = 0;
    scoreDiv.textContent = '分數：0';
    clearInterval(noteInterval);
    noteInterval = setInterval(spawnNote, NOTE_INTERVAL);
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

restartBtn.addEventListener('click', startGame);

startGame();
