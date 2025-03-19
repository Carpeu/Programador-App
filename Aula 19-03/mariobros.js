const mario = document.getElementById('mario');
const obstacle = document.getElementById('obstacle');
let isJumping = false;
let marioBottom = 0;
let obstacleRight = -30;
let gameSpeed = 3;
let score = 0;

function jump() {
    if (isJumping) return;
    isJumping = true;

    let upInterval = setInterval(() => {
        if (marioBottom >= 300) { // Aumentei a altura máxima do pulo
            clearInterval(upInterval);

            let downInterval = setInterval(() => {
                if (marioBottom <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                    marioBottom = 0;
                    mario.style.bottom = marioBottom + 'px';
                } else {
                    marioBottom -= 8; // Reduzi a velocidade de descida
                    mario.style.bottom = marioBottom + 'px';
                }
            }, 20);
        } else {
            marioBottom += 15; // Reduzi a velocidade de subida
            mario.style.bottom = marioBottom + 'px';
        }
    }, 20);
}

function moveObstacle() {
    obstacleRight -= gameSpeed;
    obstacle.style.right = obstacleRight + 'px';

    if (obstacleRight < -30) {
        obstacleRight = 800;
        score++;
        console.log('Score:', score);
    }

    requestAnimationFrame(moveObstacle);
}

function checkCollision() {
    const marioRect = mario.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
        marioRect.left < obstacleRect.right &&
        marioRect.right > obstacleRect.left &&
        marioRect.bottom > obstacleRect.top
    ) {
        alert('Game Over! Score: ' + score);
        obstacleRight = -30;
        score = 0;
    }
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        jump();
    }
});

moveObstacle();
setInterval(checkCollision, 10);