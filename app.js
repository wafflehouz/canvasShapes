const canvas = document.querySelector("#ballsCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const balls = [];
const squares = [];
const triangles = [];
const particles = [];

class Ball {
    constructor(x,y) {
        this.id = 'ball-' + Math.random();
        this.x = x;
        this.y = y;
        this.xVelocity = (Math.random() - 0.5) * 10;
        this.yVelocity = (Math.random() - 0.5) * 10;
        this.color = Ball.getRandomColor();
        this.borderColor = Ball.getRandomColor();
        this.size = Math.random() * 30 + 25;
        this.rotation = 0;
        this.rotationSpeed = 0; // Speed in radians per frame
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
        // ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        // ctx.stroke();
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
        this.borderColor = Square.getRandomColor();
        this.size = Math.random() * 30 + 25;
        this.rotation = 0;
        this.rotationSpeed = 0; // Speed in radians per frame
    }

    static getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`
    }

    // Example for the Square class
    draw() {
        ctx.save(); // Save the current context state
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2); // Move the rotation center to the shape's center
        ctx.rotate(this.rotation); // Rotate the context
        ctx.translate(-this.size / 2, -this.size / 2); // Adjust to draw correctly
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(0, 0, this.size, this.size); // Draw the rectangle centered on the new origin
        ctx.fill();
        ctx.restore(); // Restore the context state
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
        this.borderColor = Triangle.getRandomColor();
        this.size = Math.random() * 30 + 25;  // This controls the size of the triangle
        this.rotation = 0;
        this.rotationSpeed = 0; // Speed in radians per frame
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
        this.size = Math.random() * 5 + 2;  // Size of each particle
        this.xVelocity = (Math.random() - 0.5) * 10;  // Horizontal velocity
        this.yVelocity = (Math.random() - 0.5) * 10;  // Vertical velocity
        this.color = color;
        this.lifespan = 100;  // Lifespan in frames
    }

    update() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.lifespan -= 1;  // Decrease lifespan each frame
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

function globalUpdate(shape) {
    // Boundary checks
    if ((shape.x + shape.size) >= canvas.width || (shape.x - shape.size) <= 0) {
        shape.xVelocity = -shape.xVelocity;
    }
    if ((shape.y + shape.size) >= canvas.height || (shape.y - shape.size) <= 0) {
        shape.yVelocity = -shape.yVelocity;
    }
    // Gravity effect
    if ((shape.y + shape.size) < canvas.height) {
        shape.yVelocity += 0.05;
    }
    // Update position
    
    shape.x += shape.xVelocity;
    shape.y += shape.yVelocity;
    shape.rotation += shape.rotationSpeed; // Apply rotation
}

// Collission detection function
function handleCollision(shape1, shape2) {
    const dx = shape2.x - shape1.x;
    const dy = shape2.y - shape1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = shape1.size + shape2.size;  // This uses size to approximate the collision radius

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

        shape1.rotationSpeed = (shape1.xVelocity + shape1.yVelocity) * 0.015; // Example calculation
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

function isPointInsideShape(x, y, shape) {
    // Approximate each shape as a circle for simplicity
    const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
    return distance <= shape.size; // Checks if the click is within the shape's area
}

let mode = 'explode'; // Modes: 'explode', 'add'

const clearButton = document.querySelector("#clear");
const modeButton = document.querySelector("#ballToggle");

clearButton.addEventListener('click', () => {
    balls.length = 0;
    squares.length = 0;
    triangles.length = 0;
    particles.length = 0;
});

modeButton.addEventListener('click', () => {
    mode = mode === 'explode' ? 'add' : 'explode';
    modeButton.textContent = mode === 'explode' ? 'Mode: Explode' : 'Mode: Add';
});

canvas.addEventListener('click', function (e) {
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (mode === 'explode') {
        removeShapeIfClicked(clickX, clickY);
    } else if (mode === 'add') {
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) {
            balls.push(new Ball(clickX, clickY));
        } else if (shapeType === 1) {
            squares.push(new Square(clickX, clickY));
        } else {
            triangles.push(new Triangle(clickX, clickY));
        }
    }
});

function removeShapeIfClicked(x, y) {
    // Check each array
    [balls, squares, triangles].forEach((shapeArray, index) => {
        for (let i = shapeArray.length - 1; i >= 0; i--) {
            const shape = shapeArray[i];
            if (isPointInsideShape(x, y, shape)) {
                // Generate particles
                for (let j = 0; j < 20; j++) {  // Create 20 particles
                    particles.push(new Particle(shape.x, shape.y, shape.color));
                }
                shapeArray.splice(i, 1);  // Remove the shape from its array
                break;  // Stop checking once a shape has been removed
            }
        }
    });
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Ensure all shapes are within the new canvas bounds
    [...balls, ...squares, ...triangles].forEach(shape => {
        if (shape.x > canvas.width) shape.x = canvas.width - shape.size;
        if (shape.y > canvas.height) shape.y = canvas.height - shape.size;
        if (shape.x < 0) shape.x = shape.size;
        if (shape.y < 0) shape.y = shape.size;
    });

    redrawShapes();
}


function redrawShapes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allShapes = [...balls, ...squares, ...triangles];
    allShapes.forEach(shape => {
        shape.draw();
    });
    particles.forEach(particle => {
        if (particle.isAlive()) {
            particle.draw();
        }
    });
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // To set up initial dimensions and position shapes correctly

function loop() {
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

    // Update and draw particles
    particles.forEach((particle, index) => {
        if (particle.isAlive()) {
            particle.update();
            particle.draw();
        } else {
            particles.splice(index, 1);  // Remove dead particles
        }
    });

    requestAnimationFrame(loop);
}

loop();

function addShapes(num) {
    for (let i = 0; i < num; i++) {
        const shapeType = Math.floor(Math.random() * 3);
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        if (shapeType === 0) {
            balls.push(new Ball(x, y));
        } else if (shapeType === 1) {
            squares.push(new Square(x, y));
        } else {
            triangles.push(new Triangle(x, y));
        }
    }
}

addShapes(10);
