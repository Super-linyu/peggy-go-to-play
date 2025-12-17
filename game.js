// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5;
const APPLE_SIZE = 30;
const OBSTACLE_SIZE = 40;
const HOUSE_SIZE = 60;
const GRAVITY = 0.5;
const JUMP_FORCE = 25; // 进一步增加跳跃力

// 游戏状态
let game = {
    isRunning: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1,
    player: {
        x: 50,
        y: CANVAS_HEIGHT - PLAYER_SIZE - 100,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        speedX: 0,
        speedY: 0,
        jumping: false,
        emoji: '🐷'
    },
    apples: [],
    obstacles: [],
    house: {
        x: CANVAS_WIDTH - HOUSE_SIZE - 50,
        y: CANVAS_HEIGHT - HOUSE_SIZE - 100,
        width: HOUSE_SIZE,
        height: HOUSE_SIZE,
        emoji: '🏠'
    },
    keys: {},
    gameOver: false
};

// 关卡配置
const levels = [
    {
        apples: 3,
        obstacles: 2
    },
    {
        apples: 5,
        obstacles: 4
    },
    {
        apples: 7,
        obstacles: 6
    }
];

// 游戏初始化
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // 绑定事件
    bindEvents();
    
    // 初始化关卡
    initLevel(game.level);
    
    // 开始游戏循环
    gameLoop();
}

// 绑定事件
function bindEvents() {
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
            jump();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });
    
    // 按钮事件
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('replayBtn').addEventListener('click', replayLevel);
}

// 初始化关卡
function initLevel(level) {
    // 重置玩家位置
    game.player.x = 50;
    game.player.y = CANVAS_HEIGHT - PLAYER_SIZE - 100;
    game.player.speedX = 0;
    game.player.speedY = 0;
    game.player.jumping = false;
    
    // 清空对象
    game.apples = [];
    game.obstacles = [];
    
    // 根据关卡生成苹果
    const appleCount = levels[level-1]?.apples || 3;
    for (let i = 0; i < appleCount; i++) {
        generateApple();
    }
    
    // 根据关卡生成障碍物
    const obstacleCount = levels[level-1]?.obstacles || 2;
    for (let i = 0; i < obstacleCount; i++) {
        generateObstacle();
    }
    
    // 更新UI
    updateUI();
}

// 生成苹果
function generateApple() {
    let x, y;
    let validPosition = false;
    
    while (!validPosition) {
        x = Math.random() * (CANVAS_WIDTH - APPLE_SIZE - 100) + 50;
        y = Math.random() * (CANVAS_HEIGHT - APPLE_SIZE - 150) + 50;
        
        validPosition = true;
        
        // 检查是否与障碍物重叠
        for (let obstacle of game.obstacles) {
            if (isColliding(x, y, APPLE_SIZE, APPLE_SIZE, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                validPosition = false;
                break;
            }
        }
        
        // 检查是否与房屋重叠
        if (isColliding(x, y, APPLE_SIZE, APPLE_SIZE, game.house.x, game.house.y, game.house.width, game.house.height)) {
            validPosition = false;
        }
    }
    
    game.apples.push({
        x: x,
        y: y,
        width: APPLE_SIZE,
        height: APPLE_SIZE,
        emoji: '🍎',
        collected: false
    });
}

// 生成障碍物
function generateObstacle() {
    let x, y;
    let validPosition = false;
    
    while (!validPosition) {
        x = Math.random() * (CANVAS_WIDTH - OBSTACLE_SIZE - 200) + 100;
        y = CANVAS_HEIGHT - OBSTACLE_SIZE - 100;
        
        validPosition = true;
        
        // 检查是否与其他障碍物重叠
        for (let obstacle of game.obstacles) {
            if (isColliding(x, y, OBSTACLE_SIZE, OBSTACLE_SIZE, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                validPosition = false;
                break;
            }
        }
        
        // 检查是否与玩家或房屋太近
        if (Math.abs(x - game.player.x) < 100 || Math.abs(x - game.house.x) < 100) {
            validPosition = false;
        }
    }
    
    game.obstacles.push({
        x: x,
        y: y,
        width: OBSTACLE_SIZE,
        height: OBSTACLE_SIZE,
        emoji: '🚧'
    });
}

// 跳跃
function jump() {
    if (!game.player.jumping) {
        game.player.speedY = -JUMP_FORCE;
        game.player.jumping = true;
    }
}

// 游戏循环
function gameLoop() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制背景
    drawBackground(ctx);
    
    // 更新和绘制游戏对象
    if (game.isRunning && !game.isPaused && !game.gameOver) {
        updatePlayer();
        updateObjects();
        checkCollisions();
    }
    
    drawPlayer(ctx);
    drawObjects(ctx);
    
    // 继续游戏循环
    requestAnimationFrame(gameLoop);
}

// 绘制背景
function drawBackground(ctx) {
    // 天空
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - 100);
    
    // 地面
    ctx.fillStyle = '#98FB98';
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);
    
    // 云朵
    ctx.fillStyle = 'white';
    for (let i = 0; i < 5; i++) {
        const x = i * 150 + 50;
        const y = 50 + Math.sin(i) * 20;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 更新玩家
function updatePlayer() {
    // 水平移动
    if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
        game.player.speedX = -PLAYER_SPEED;
    } else if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
        game.player.speedX = PLAYER_SPEED;
    } else {
        game.player.speedX = 0;
    }
    
    // 应用重力
    game.player.speedY += GRAVITY;
    
    // 更新位置
    game.player.x += game.player.speedX;
    game.player.y += game.player.speedY;
    
    // 边界检查
    if (game.player.x < 0) {
        game.player.x = 0;
    } else if (game.player.x > CANVAS_WIDTH - game.player.width) {
        game.player.x = CANVAS_WIDTH - game.player.width;
    }
    
    // 计算1/2高度（从地面到顶部的1/2）
    const maxJumpHeight = CANVAS_HEIGHT - 100 - (CANVAS_HEIGHT - 100) / 2;
    
    // 顶部边界检查 - 限制最大跳跃高度为1/2，并允许自然下落
    if (game.player.y < maxJumpHeight) {
        game.player.y = maxJumpHeight;
        // 不设置speedY为0，让重力继续作用，自然下落
        // 如果已经到达最高点，确保speedY开始变为正值（下落）
        if (game.player.speedY < 0) {
            game.player.speedY = 0;
        }
    } else if (game.player.y > CANVAS_HEIGHT - game.player.height - 100) {
        game.player.y = CANVAS_HEIGHT - game.player.height - 100;
        game.player.speedY = 0;
        game.player.jumping = false;
    }
}

// 绘制玩家
function drawPlayer(ctx) {
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(game.player.emoji, game.player.x + game.player.width / 2, game.player.y + game.player.height / 2);
}

// 更新游戏对象
function updateObjects() {
    // 可以添加苹果和障碍物的动画效果
}

// 绘制游戏对象
function drawObjects(ctx) {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制苹果
    for (let apple of game.apples) {
        if (!apple.collected) {
            ctx.fillText(apple.emoji, apple.x + apple.width / 2, apple.y + apple.height / 2);
        }
    }
    
    // 绘制障碍物
    ctx.font = '40px Arial';
    for (let obstacle of game.obstacles) {
        ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    }
    
    // 绘制房屋
    ctx.font = '60px Arial';
    ctx.fillText(game.house.emoji, game.house.x + game.house.width / 2, game.house.y + game.house.height / 2);
}

// 碰撞检测
function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// 检查所有碰撞
function checkCollisions() {
    // 检查苹果碰撞
    for (let i = game.apples.length - 1; i >= 0; i--) {
        const apple = game.apples[i];
        if (!apple.collected && isColliding(
            game.player.x, game.player.y, game.player.width, game.player.height,
            apple.x, apple.y, apple.width, apple.height
        )) {
            apple.collected = true;
            game.score += 10;
            updateUI();
        }
    }
    
    // 检查障碍物碰撞
    for (let obstacle of game.obstacles) {
        // 只有当玩家底部与障碍物重叠，并且玩家不在空中跳跃时才检测碰撞
        // 这样玩家可以跳过高障碍物
        if (isColliding(
            game.player.x, game.player.y, game.player.width, game.player.height,
            obstacle.x, obstacle.y, obstacle.width, obstacle.height
        ) && 
        // 只有当玩家真正在地面上（y坐标等于或非常接近地面）时才检测碰撞
        !game.player.jumping && 
        Math.abs(game.player.y - (CANVAS_HEIGHT - PLAYER_SIZE - 100)) < 5) {
            // 碰撞障碍物，失去生命
            game.lives--;
            updateUI();
            
            if (game.lives <= 0) {
                game.gameOver = true;
                showGameOver();
            } else {
                // 重置玩家位置
                game.player.x = 50;
                game.player.y = CANVAS_HEIGHT - PLAYER_SIZE - 100;
                game.player.speedX = 0;
                game.player.speedY = 0;
                game.player.jumping = false;
            }
            
            break;
        }
    }
    
    // 检查房屋碰撞（到达终点）
    if (isColliding(
        game.player.x, game.player.y, game.player.width, game.player.height,
        game.house.x, game.house.y, game.house.width, game.house.height
    )) {
        showLevelComplete();
    }
}

// 更新UI
function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('level').textContent = game.level;
}

// 显示游戏结束
function showGameOver() {
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('finalLevel').textContent = game.level;
    document.getElementById('gameOver').classList.remove('hidden');
    game.isRunning = false;
}

// 显示关卡完成
function showLevelComplete() {
    document.getElementById('levelScore').textContent = game.score;
    document.getElementById('levelComplete').classList.remove('hidden');
    game.isRunning = false;
}

// 开始游戏
function startGame() {
    game.isRunning = true;
    game.isPaused = false;
    game.gameOver = false;
    document.getElementById('message').textContent = '游戏进行中...';
}

// 暂停游戏
function pauseGame() {
    if (game.isRunning) {
        game.isPaused = !game.isPaused;
        document.getElementById('message').textContent = game.isPaused ? '游戏已暂停' : '游戏进行中...';
    }
}

// 重置游戏
function resetGame() {
    game.isRunning = false;
    game.isPaused = false;
    game.score = 0;
    game.lives = 3;
    game.level = 1;
    game.gameOver = false;
    
    // 隐藏弹窗
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    
    // 初始化关卡
    initLevel(game.level);
    
    document.getElementById('message').textContent = '点击开始游戏';
}

// 下一关
function nextLevel() {
    game.level++;
    game.isRunning = false;
    game.isPaused = false;
    game.gameOver = false;
    
    // 隐藏弹窗
    document.getElementById('levelComplete').classList.add('hidden');
    
    // 初始化新关卡
    initLevel(game.level);
    
    document.getElementById('message').textContent = '点击开始游戏';
}

// 重玩本关
function replayLevel() {
    game.isRunning = false;
    game.isPaused = false;
    game.gameOver = false;
    
    // 隐藏弹窗
    document.getElementById('levelComplete').classList.add('hidden');
    
    // 初始化当前关卡
    initLevel(game.level);
    
    document.getElementById('message').textContent = '点击开始游戏';
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);