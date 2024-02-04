// Canvas and Variables
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'pink'; // Set canvas background color
canvas.style.margin = '0';
canvas.style.padding = '0';
canvas.style.display = 'none';

let lastTimestamp = 0;
let touchStartX = 0;
let touchEndX = 0;
let isSwipe = false;
let gameActive = false;
let gameFinished = false;
let ballColor = 'black';

const buttonStart = document.getElementById('fullScreen');
buttonStart.style.display = 'block';

function handleButtonClick() {
    const start = document.getElementById('startScreen');

    canvas.style.display = 'block';

    buttonStart.style.display = 'none';
    start.style.display = 'none';

    enterFullscreen();

    gameActive = true;

    // Start the game loop
    setInterval(updateGame, 16); // Adjust the interval as needed
}

buttonStart.addEventListener('click', handleButtonClick);

// Ball
const ball = {
    x: 100,
    y: canvas.height / 2,
    radius: 20,
    color: ballColor
};

const goal = {
    x: canvas.width - 40, // Adjust the x-coordinate as needed
    y: 0,                 // Adjust the y-coordinate as needed
    width: 40,            // Adjust the width as needed
    height: canvas.height, // Adjust the height as needed
    checkerSize: 10  
}

function drawBall(ball) {
    let gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, 'rgba(192, 192, 192, 1)'); 
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 1)'; // Shadow color
    ctx.shadowBlur = 10; // Shadow blur
    ctx.fill();
    ctx.closePath();
}

function updateBall() {
    ball.color = ballColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(ball);
}

function drawGoal() {
    ctx.fillStyle = 'white';

    // Draw red and white checkers
    for (let i = goal.y; i < goal.height; i += goal.checkerSize * 1.5) {
        ctx.fillRect(goal.x, i, goal.width, goal.checkerSize);
        ctx.clearRect(goal.x, i + goal.checkerSize, goal.width, goal.checkerSize);
    }
}

class Hole {
    constructor() {
        this.radius = ball.radius + 5; // Slightly bigger than the ball

        // Define a safe zone around the starting position
        const safeZoneRadius = 100;
        const safeZoneX = ball.x - safeZoneRadius;
        const safeZoneY = ball.y - safeZoneRadius;

        // Generate random coordinates outside the safe zone
        do {
            this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
            this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
        } while (
            this.x > safeZoneX &&
            this.x < safeZoneX + safeZoneRadius * 2 &&
            this.y > safeZoneY &&
            this.y < safeZoneY + safeZoneRadius * 2
        );

        this.color = 'black';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    checkCollision() {
        const distance = Math.sqrt((ball.x - this.x) ** 2 + (ball.y - this.y) ** 2);
        return distance < this.radius + ball.radius;
    }
}

// Array to store holes
const holes = [];

// Create 4 random holes
for (let i = 0; i < 6; i++) {
    holes.push(new Hole());
}

function updateGame(timestamp) {
    const deltaTime = timestamp - lastTimestamp;

    // Only clear the canvas if a sufficient amount of time has passed
    if (deltaTime > 16) { // Adjust this threshold as needed
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBall(ball);

        holes.forEach(hole => {
            hole.draw();

            if (hole.checkCollision()) {
                // Ball touched a hole
                ball.x = 100; // Reset ball position
                ball.y = canvas.height / 2;
                
                // Perform small vibration on the phone (you may need to adjust this)
                if ('vibrate' in navigator) {
                    navigator.vibrate([100, 30, 100]);
                }

                // You can add more effects or actions here
            }
        });

        drawGoal();

        lastTimestamp = timestamp;
    }

    // Call requestAnimationFrame to continue the animation loop
    requestAnimationFrame(updateGame);
}

// Start the game loop
requestAnimationFrame(updateGame);

// Landscape phone
function isLandscape() {
    return window.innerWidth > window.innerHeight;
}

// Function to enter fullscreen
function enterFullscreen() {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
    }
}

function handleDeviceMotion(event) {
    if (gameActive && !gameFinished) {
        // Swap X and Y acceleration for landscape orientation
        const accelerationX = isLandscape() ? event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
        const accelerationY = isLandscape() ? -event.accelerationIncludingGravity.x : event.accelerationIncludingGravity.y;

        // Adjust the ball's position based on device acceleration
        ball.x += accelerationX;
        ball.y -= accelerationY;

        // Ensure the ball stays within the canvas boundaries
        if (ball.x + ball.radius < 0) {
            ball.x = ball.radius;
        }
        if (ball.x - ball.radius > canvas.width) {
            ball.x = canvas.width + ball.radius;

            // Ball crossed the finish line
            gameFinished = true;

            // Display game completion message
            alert("Leik lokið!");
        }
        if (ball.y + ball.radius < 0) {
            ball.y = ball.radius;
        }
        if (ball.y - ball.radius > canvas.height) {
            ball.y = canvas.height + ball.radius;
        }

        updateBall();
    }
}

window.addEventListener('devicemotion', handleDeviceMotion);

// Touch events
window.addEventListener('touchstart', event => {
    console.log('start');
    touchStartX = event.touches[0].clientX;
    isSwipe = false;
});

window.addEventListener('touchmove', event => {
    console.log('moving');
    touchEndX = event.touches[0].clientX;
    isSwipe = true;
});

window.addEventListener('touchend', event => {
    console.log('end');
    const start = document.getElementById('startScreen');

    const swipeThreshold = 200;
    const swipeDistance = touchEndX - touchStartX;

    if (isLandscape()) {
        if (isSwipe && swipeDistance > swipeThreshold) {
            start.style.display = 'none';
            document.body.appendChild(start);
            gameActive = true;
            enterFullscreen(); // Enter fullscreen mode
            updateBall();
        }
    } else {
        enterFullscreen(); // Enter fullscreen mode
    }
});
