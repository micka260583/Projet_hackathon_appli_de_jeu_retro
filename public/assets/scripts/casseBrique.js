let menuBtn = document.getElementById('btn');
var score = 0;
menuBtn.addEventListener("click", e => {
    var canvas = document.getElementById("myCanvas");
    canvas.style = "border: 7px solid black"
    var ctx = canvas.getContext("2d");
    var ballRadius = 10;
    var x = canvas.width / 2;
    var y = canvas.height - 30;
    var dx = 1 + Math.random()
    var dy = dx - 3
    var paddleHeight = 10;
    var paddleWidth = 75;
    var paddleX = (canvas.width - paddleWidth) / 2;
    var rightPressed = false;
    var leftPressed = false;
    var brickRowCount = 5;
    var brickColumnCount = 3;
    var brickWidth = 75;
    var brickHeight = 20;
    var brickPadding = 10;
    var brickOffsetTop = 30;
    var brickOffsetLeft = 30;
    var lives = 3;
    var bonus = 0;
    var numberBricks = brickColumnCount * brickRowCount;
    score = 0;

    var bricks = [];
    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);

    function keyDownHandler(e) {
        if (e.key == "Right" || e.key == "ArrowRight") {
            rightPressed = true;
        } else if (e.key == "Left" || e.key == "ArrowLeft") {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key == "Right" || e.key == "ArrowRight") {
            rightPressed = false;
        } else if (e.key == "Left" || e.key == "ArrowLeft") {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }

    function collisionDetection() {
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                var b = bricks[c][r];
                if (b.status == 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score += 1 + bonus;
                        bonus++;
                        numberBricks--
                        if (numberBricks == 0) {
                            dx = 0
                            dy = 0
                            score *= lives
                            drawScore();
                            endgame()
                        }
                    }
                }
            }
        }

    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#75cbfb";
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status == 1) {
                    var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                    var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    switch (c) {
                        case 0:
                            ctx.fillStyle = "#ef22fc";
                            break;
                        case 1:
                            ctx.fillStyle = "#cf22ac";
                            break;
                        case 2:
                            ctx.fillStyle = "#af227c";
                            break;
                    }
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function drawScore() {
        ctx.font = "16px Verdana";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Score: " + score, 8, 20);
    }

    function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                bonus = 0
                let distance = x - (paddleX + paddleWidth / 2)
                    //deltaCenter donne l'angle relatif au paddle (ie positif à droite, négatif à gauche du centre) normé par la moitié de la width du paddle
                let deltaCenter = Math.floor(Math.abs(distance)) * distance / Math.abs(distance) / paddleWidth * 2
                dx = deltaCenter * 3
                dy = (Math.abs(dx) - 3)
                dy *= 1 + 5 / (numberBricks + 1)
            } else {
                lives--;
                if (!lives) {
                    dx = 0
                    dy = 0
                    score = 0
                    gameover()
                } else {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    dx = 1 + Math.random()
                    dy = dx - 3
                    paddleX = (canvas.width - paddleWidth) / 2;
                }
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;
        requestAnimationFrame(draw);
    }

    draw();
});

function endgame() {
    jQuery(function() {
        $('#btn').html('Rejouer')
        $('form').removeClass('visually-hidden')
        $('form').submit(function(event) {
            var formData = {
                game: $('#game').data('id'),
                score: score
            }
            console.log(formData, window.location)
            $.ajax({
                type: "POST",
                url: "/game/savescore",
                data: formData,
                dataType: "json",
                encode: true,
            }).done(function(data) {
                console.log(data)
                $('form').addClass('visually-hidden')
            })
            event.preventDefault();
        })
        $('#btn').click(() => {
            $('form').addClass('visually-hidden')
            $('#btn').html('Jouer')
        })
    })
}

function gameover() {
    jQuery(function() {
        $('#btn').html('Rejouer')
        $('#btn').click(() => {
            $('#btn').html('Jouer')
        })
    })
}