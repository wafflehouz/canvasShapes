const canvas = document.querySelector("#ballsCanvas");
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.querySelector("#start-screen");
const gameOverScreen = document.querySelector("#game-over-screen");
const inGameControls = document.querySelector("#in-game-controls");
const addModeCounter = document.querySelector("#add-mode-counter");
const startExplodeModeBtn = document.querySelector("#start-explode-mode");
const startAddModeBtn = document.querySelector("#start-add-mode");
const playAgainBtn = document.querySelector("#play-again");
const clearBtn = document.querySelector("#clear");
const modeBtn = document.querySelector("#ballToggle");
const gameOverMessage = document.querySelector("#game-over-message");

// Game State
let gameState = 'initial'; // initial, playing, gameOver
let mode = 'explode'; // explode, add
const ADD_MODE_GOAL = 200;
let animationFrameId;

const balls = [];
const squares = [];
const triangles = [];
const particles = [];

// Shape Classes (Ball, Square, Triangle, Particle)
class Ball {
    constructor(x,y) {
        this.id = 'ball-' + Math.random();
        this.x = x;
        this.y = y;
        this.xVelocity = (Math.random() - 0.5) * 10;
        this.yVelocity = (Math.random() - 0.5) * 10;
        this.color = Ball.getRandomColor();
        this.size = Math.random() * 30 + 25;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    static getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Square {
    constructor(x,y) {
        this.id = 'square-' + Math.random();
        this.x = x;
        this.y = y;
        this.xVelocity = (Math.random() - 0.5) * 10;
        this.yVelocity = (Math.random() - 0.5) * 10;
        this.color = Square.getRandomColor();
        this.size = Math.random() * 30 + 25;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    static getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.size / 2, -this.size / 2);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(0, 0, this.size, this.size);
        ctx.fill();
        ctx.restore();
    }
}

class Triangle {
    constructor(x, y) {
        this.id = 'triangle-' + Math.random();
        this.x = x;
        this.y = y;
        this.xVelocity = (Math.random() - 0.5) * 10;
        this.yVelocity = (Math.random() - 0.5) * 10;
        this.color = Triangle.getRandomColor();
        this.size = Math.random() * 30 + 25;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }

    static getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.xVelocity = (Math.random() - 0.5) * 10;
        this.yVelocity = (Math.random() - 0.5) * 10;
        this.color = color;
        this.lifespan = 100;
    }

    update() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.lifespan -= 1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive() {
        return this.lifespan > 0;
    }
}

// Game Logic
function init() {
    cancelAnimationFrame(animationFrameId);
    gameState = 'initial';
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    inGameControls.classList.add('hidden');
    addModeCounter.classList.add('hidden');
    canvas.classList.add('hidden');
    clearCanvas();
}

function startGame(selectedMode) {
    mode = selectedMode;
    gameState = 'playing';
    startScreen.classList.add('hidden');
    inGameControls.classList.remove('hidden');
    canvas.classList.remove('hidden');

    if (mode === 'add') {
        addModeCounter.classList.remove('hidden');
        clearBtn.classList.remove('hidden');
        modeBtn.disabled = true;
        modeBtn.textContent = "Mode: Add";
        clearCanvas();
    } else {
        addModeCounter.classList.add('hidden');
        clearBtn.classList.add('hidden');
        modeBtn.disabled = true;
        modeBtn.textContent = "Mode: Explode";
        addShapes(10);
    }
    loop();
}

function endGame(message) {
    cancelAnimationFrame(animationFrameId);
    gameState = 'gameOver';
    gameOverMessage.textContent = message;
    gameOverScreen.classList.remove('hidden');
    inGameControls.classList.add('hidden');
    addModeCounter.classList.add('hidden');
}

function clearCanvas() {
    balls.length = 0;
    squares.length = 0;
    triangles.length = 0;
    particles.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loop() {
    if (gameState !== 'playing') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let allShapes = [...balls, ...squares, ...triangles];

    for (let i = 0; i < allShapes.length; i++) {
        for (let j = i + 1; j < allShapes.length; j++) {
            handleCollision(allShapes[i], allShapes[j]);
        }
    }

    allShapes.forEach(shape => {
        globalUpdate(shape);
        shape.draw();
    });

    particles.forEach((particle, index) => {
        if (particle.isAlive()) {
            particle.update();
            particle.draw();
        } else {
            particles.splice(index, 1);
        }
    });

    if (mode === 'explode' && allShapes.length === 0 && particles.length === 0) {
        endGame('You Win!');
    } else if (mode === 'add') {
        const shapeCount = allShapes.length;
        addModeCounter.textContent = `Shapes: ${shapeCount} / ${ADD_MODE_GOAL}`;
        if (shapeCount >= ADD_MODE_GOAL) {
            endGame('You Win!');
        }
    }

    animationFrameId = requestAnimationFrame(loop);
}

// Event Listeners
startExplodeModeBtn.addEventListener('click', () => startGame('explode'));
startAddModeBtn.addEventListener('click', () => startGame('add'));
playAgainBtn.addEventListener('click', init);
clearBtn.addEventListener('click', clearCanvas);

canvas.addEventListener('click', function (e) {
    if (gameState !== 'playing') return;
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (mode === 'explode') {
        removeShapeIfClicked(clickX, clickY);
    } else if (mode === 'add') {
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) balls.push(new Ball(clickX, clickY));
        else if (shapeType === 1) squares.push(new Square(clickX, clickY));
        else triangles.push(new Triangle(clickX, clickY));
    }
});

window.addEventListener('resize', resizeCanvas);

function removeShapeIfClicked(x, y) {
    [balls, squares, triangles].forEach((shapeArray) => {
        for (let i = shapeArray.length - 1; i >= 0; i--) {
            const shape = shapeArray[i];
            if (isPointInsideShape(x, y, shape)) {
                for (let j = 0; j < 20; j++) {
                    particles.push(new Particle(shape.x, shape.y, shape.color));
                }
                shapeArray.splice(i, 1);
                break;
            }
        }
    });
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function addShapes(num) {
    for (let i = 0; i < num; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) balls.push(new Ball(x, y));
        else if (shapeType === 1) squares.push(new Square(x, y));
        else triangles.push(new Triangle(x, y));
    }
}

function isPointInsideShape(x, y, shape) {
    const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
    return distance <= shape.size;
}

function handleCollision(shape1, shape2) {
    const dx = shape2.x - shape1.x;
    const dy = shape2.y - shape1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = shape1.size + shape2.size;

    if (distance < minDist) {
        const angle = Math.atan2(dy, dx);
        const u1 = rotate({x: shape1.xVelocity, y: shape1.yVelocity}, angle);
        const u2 = rotate({x: shape2.xVelocity, y: shape2.yVelocity}, angle);
        const m1 = shape1.size;
        const m2 = shape2.size;
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m2 - m1) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);
        shape1.xVelocity = vFinal1.x;
        shape1.yVelocity = vFinal1.y;
        shape2.xVelocity = vFinal2.x;
        shape2.yVelocity = vFinal2.y;
        shape1.rotationSpeed = (shape1.xVelocity + shape1.yVelocity) * 0.015;
        shape2.rotationSpeed = (shape2.xVelocity + shape2.yVelocity) * 0.015;
        const overlap = 0.5 * (minDist - distance + 1);
        shape1.x -= overlap * Math.cos(angle);
        shape1.y -= overlap * Math.sin(angle);
        shape2.x += overlap * Math.cos(angle);
        shape2.y += overlap * Math.sin(angle);
    }
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
}

function globalUpdate(shape) {
    if ((shape.x + shape.size) >= canvas.width || (shape.x - shape.size) <= 0) {
        shape.xVelocity = -shape.xVelocity;
    }
    if ((shape.y + shape.size) >= canvas.height || (shape.y - shape.size) <= 0) {
        shape.yVelocity = -shape.yVelocity;
    }
    if ((shape.y + shape.size) < canvas.height) {
        shape.yVelocity += 0.05;
    }
    shape.x += shape.xVelocity;
    shape.y += shape.yVelocity;
    shape.rotation += shape.rotationSpeed;
}

// Initial Setup
resizeCanvas();
init();
