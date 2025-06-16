// 音符打擊特效圖案
const hitImages = [];
const hitImageSrcs = [
    'https://cdn.pixabay.com/photo/2017/01/31/13/14/apple-2027662_1280.png', // 蘋果
    'https://cdn.pixabay.com/photo/2016/03/05/19/02/abstract-1238247_1280.jpg', // 彩色背景
    'https://cdn.pixabay.com/photo/2012/04/13/00/22/star-31205_1280.png' // 星星
];
let loadedCount = 0;

hitImageSrcs.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => { loadedCount++; };
    hitImages.push(img);
});

const hitEffects = [];

function drawNotes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ...existing code...
    // 畫出音符（部分歪扭）
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
        ctx.fillStyle = note.color;
        ctx.globalAlpha = note.isLong && note.holding ? 0.5 : 1;
        ctx.fillRect(-((laneWidth - 20) / 2), -note.height / 2, laneWidth - 20, note.height);
        ctx.restore();
    });
    // 畫出判定線
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 4);
    // 畫出打擊特效
    hitEffects.forEach(eff => {
        if (loadedCount === hitImages.length) {
            ctx.save();
            ctx.globalAlpha = eff.alpha;
            ctx.drawImage(hitImages[eff.imgIdx], eff.x - eff.size/2, eff.y - eff.size/2, eff.size, eff.size);
            ctx.restore();
        }
    });
}

function hitNote(lane) {
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const judgeLine = canvas.height - 80;
        if (
            note.lane === lane &&
            (!note.isLong && note.y < judgeLine + 40 && note.y + note.height > judgeLine - 40)
        ) {
            // 加入更大更明顯的圖案特效
            hitEffects.push({
                x: note.lane * laneWidth + laneWidth / 2,
                y: judgeLine,
                imgIdx: Math.floor(Math.random() * hitImages.length),
                alpha: 1,
                size: 120
            });
            notes.splice(i, 1);
            score++;
            scoreDiv.textContent = `分數：${score}`;
            return;
        }
    }
}

function gameLoop() {
    if (!isPlaying) return;
    drawNotes();
    updateNotes();
    // 更新特效
    for (let i = hitEffects.length - 1; i >= 0; i--) {
        hitEffects[i].alpha -= 0.03;
        hitEffects[i].size += 2; // 擴大動畫
        if (hitEffects[i].alpha <= 0) hitEffects.splice(i, 1);
    }
    animationId = requestAnimationFrame(gameLoop);
}
// ...existing code...
