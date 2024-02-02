function handleDeviceMotion(event) {
    if (gameActive) {
        // Swap and negate X and Y acceleration for landscape orientation
        const accelerationX = isLandscape() ? -event.accelerationIncludingGravity.y : event.accelerationIncludingGravity.x;
        const accelerationY = isLandscape() ? event.accelerationIncludingGravity.x : -event.accelerationIncludingGravity.y;

        // Adjust the ball's position based on device acceleration
        ball.x += accelerationX;
        ball.y += accelerationY;

        // Ensure the ball stays within the canvas boundaries
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
        }
        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
        }
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        }
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
        }

        updateBall();
    }
}
