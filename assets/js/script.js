const k = kaplay({
    global: false,
    background: [100, 100, 200],
    touchToMouse: true,
});

k.loadSprite("player", "./assets/players/player/player.png");
k.loadSprite("enemy", "./assets/players/enemy/enemy.png");
k.loadFont("mania", "./assets/fonts/mania.ttf");

let debugMode = false;

k.scene("game", () => {
    k.camScale(1.5);

    const player = k.add([
        k.sprite("player"),
        k.anchor("center"),
        k.area(),
        k.pos(k.center()),
        k.rotate(0),
        k.health(5), // Player now has 5 lives
        "player",
    ]);

    let playerScore = 0;

    const score = k.add([
        k.text("Score: 0", { size: 50, font: "mania" }),
        k.pos(20, 20),
        k.fixed(),
        "scoreLabel",
    ]);

    const lives = k.add([
        k.text("❤️❤️❤️❤️❤️", { size: 20, font: "mania" }),
        k.pos(20, 80),
        k.fixed(),
        "livesLabel",
    ]);

    // Variabili per il movimento continuo
    const playerSpeed = 200;

    player.onUpdate(() => {
        // Movimento continuo in base ai tasti premuti
        if (k.isKeyDown("left") || k.isKeyDown("a")) {
            player.pos.x -= playerSpeed * k.dt();
        }
        if (k.isKeyDown("right") || k.isKeyDown("d")) {
            player.pos.x += playerSpeed * k.dt();
        }
        if (k.isKeyDown("up") || k.isKeyDown("w")) {
            player.pos.y -= playerSpeed * k.dt();
        }
        if (k.isKeyDown("down") || k.isKeyDown("s")) {
            player.pos.y += playerSpeed * k.dt();
        }

        // Ruota il giocatore verso il mouse
        player.rotateTo(k.mousePos().angle(player.pos));
    });

    k.onClick(() => {
        k.add([
            k.rect(10, 10, { radius: 6 }),
            k.pos(player.pos),
            k.area(),
            k.anchor(k.vec2(-2, -2)),
            k.offscreen({ destroy: true }),
            k.rotate(player.angle),
            k.move(k.mousePos().sub(player.pos).unit(), 1200),
            "bullet",
        ]);
    });

    function updateLivesUI() {
        const hearts = "❤️".repeat(player.hp());
        lives.text = hearts;
    }

    function makeEnemy() {
        const spawnPoints = [
            k.vec2(k.width() / 2, k.height()),
            k.vec2(0, k.height()),
            k.vec2(k.width(), k.height()),
            k.vec2(0, k.height() / 2),
            k.vec2(k.width(), 0),
            k.vec2(0, -k.height()),
            k.vec2(0, -k.height() / 2),
        ];

        const selectedSpawnPoint = spawnPoints[k.randi(spawnPoints.length)];
        const enemy = k.add([
            k.sprite("enemy"),
            k.anchor("center"),
            k.area(),
            k.pos(selectedSpawnPoint),
            k.rotate(0),
            k.health(3),
            "enemy",
        ]);

        // Movimento dei nemici verso il giocatore
        enemy.onUpdate(() => {
            enemy.moveTo(player.pos, 60); // I nemici si muovono verso il giocatore con velocità di 60
        });

        enemy.onCollide("player", (player) => {
            player.hurt(1);
            updateLivesUI();
            if (player.hp() === 0) {
                k.go("gameover");
            }
        });

        enemy.onCollide("bullet", (bullet) => {
            k.destroy(bullet);
            if (enemy.hp() > 0) {
                enemy.hurt();
                enemy.use(k.color(200, 0, 0));
                k.wait(0.2, () => enemy.unuse("color"));
                return;
            }
            playerScore += 10;
            score.text = `Score: ${playerScore}`;
            k.destroy(enemy);
        });

        if (!debugMode) {
            k.loop(3, () => {
                if (enemy.exists()) {
                    k.add([
                        k.rect(8, 8, { radius: 4 }),
                        k.pos(enemy.pos),
                        k.area(),
                        k.anchor(k.vec2(-2, -2)),
                        k.offscreen({ destroy: true }),
                        k.rotate(enemy.angle),
                        k.move(player.pos.sub(enemy.pos).unit(), 600),
                        "enemyBullet",
                    ]);
                }
            });
        }
    }

    k.loop(1, () => {
        makeEnemy();
    });

    k.onCollide("player", "enemyBullet", (player, bullet) => {
        player.hurt(1);
        updateLivesUI();
        k.destroy(bullet);
        if (player.hp() === 0) {
            k.go("gameover");
        }
    });
});

k.scene("gameover", () => {
    k.add([
        k.text("Game Over! Click to Restart", { size: 50, font: "mania" }),
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    k.onClick(() => k.go("game"));
});

k.onKeyPress("f1", () => {
    debugMode = !debugMode;
});

k.go("game");
