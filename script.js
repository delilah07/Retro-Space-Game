class Player {
  constructor(game) {
    this.game = game;
    this.width = 140;
    this.height = 120;
    this.x = this.game.width / 2 - this.width / 2;
    this.y = this.game.height - this.height;
    this.speed = 5;
    this.lives = 3;
    this.maxLives = 10;
    this.image = document.getElementById('player');
    this.jets_image = document.getElementById('player_jets');
    this.frameX = 0;
    this.jetsFrameX = 1;

    this.smallLaser = new SmallLaser(this.game);
    this.bigLaser = new BigLaser(this.game);

    this.energy = 50;
    this.maxEnergy = 100;
    this.cooldown = false;
  }
  draw(context) {
    //handle sprite frames
    // this.game.keys.indexOf('1') > -1 ? (this.frameX = 1) : (this.frameX = 0);
    if (this.game.keys.indexOf('1') > -1) {
      this.frameX = 1;
    } else if (this.game.keys.indexOf('2') > -1) {
      this.smallLaser.render(context);
    } else if (this.game.keys.indexOf('3') > -1) {
      this.bigLaser.render(context);
    } else {
      this.frameX = 0;
    }
    context.drawImage(
      this.image,
      this.frameX * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    context.drawImage(
      this.jets_image,
      this.jetsFrameX * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  update() {
    // energy recharge
    if (this.energy < this.maxEnergy) this.energy += 0.05;
    if (this.energy < 1) {
      this.cooldown = true;
    } else if (this.energy > this.maxEnergy / 5) {
      this.cooldown = false;
    }

    //horizontal movement
    if (this.game.keys.indexOf('ArrowLeft') > -1) {
      this.x -= this.speed;
      this.jetsFrameX = 0;
    } else if (this.game.keys.indexOf('ArrowRight') > -1) {
      this.x += this.speed;
      this.jetsFrameX = 2;
    } else {
      this.jetsFrameX = 1;
    }

    //horizontal boundaries
    if (this.x < -this.width / 2) this.x = -this.width / 2;
    if (this.x > this.game.width - this.width / 2)
      this.x = this.game.width - this.width / 2;
  }

  shoot() {
    const projectile = this.game.getProjectile();

    if (projectile) projectile.start(this.x + this.width / 2, this.y);
  }

  restart() {
    this.x = this.game.width / 2 - this.width / 2;
    this.y = this.game.height - this.height;
    this.lives = 3;
  }
}

class Projectile {
  constructor() {
    this.width = 3;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }

  draw(context) {
    if (!this.free) {
      context.save();
      context.fillStyle = 'gold';
      context.fillRect(this.x, this.y, this.width, this.height);
      context.restore();
    }
  }
  update() {
    if (!this.free) this.y -= this.speed;
    if (this.y < -this.height) this.reset();
  }
  start(x, y) {
    this.x = x - this.width / 2;
    this.y = y;
    this.free = false;
  }
  reset() {
    this.free = true;
  }
}

class Enemy {
  constructor(game, positionX, positionY) {
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x = 0;
    this.y = 0;
    this.positionX = positionX;
    this.positionY = positionY;

    this.speed = 20;

    this.markedForDetection = false;
  }
  draw(context) {
    // context.strokeRect(this.x, this.y, this.width, this.height);
    // context.drawImage(this.image, this.x, this.y, this.width, this.height);
    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  update(x, y) {
    this.x = x + this.positionX;
    this.y = y + this.positionY;

    //check collision between enemy and projectile
    this.game.projectilesPool.forEach((projectile) => {
      if (
        !projectile.free &&
        this.game.checkCollision(this, projectile) &&
        this.lives > 0
      ) {
        // this.markedForDetection = true;
        this.hit(1);
        projectile.reset();
        // if (!this.game.gameOver) this.game.score++;
      }
    });
    if (this.lives < 1) {
      if (this.game.spriteUpdate) this.frameX++;

      if (this.frameX > this.maxFrames) {
        this.markedForDetection = true;
        if (!this.game.gameOver) this.game.score += this.maxLives;
      }
    }

    //check collision between enemy and player
    if (this.game.checkCollision(this, this.game.player) && this.lives > 0) {
      // this.markedForDetection = true;
      // if (!this.game.gameOver && this.game.score > 0) this.game.score--;
      this.lives = 0;
      this.game.player.lives--;
      // if (this.game.player.lives < 1) this.game.gameOver = true;
    }

    //lose condition
    if (this.y + this.height > this.game.height || this.game.player.lives < 1) {
      this.game.gameOver = true;
    }
  }
  hit(damage) {
    this.lives -= damage;
  }
}

class Beetlemorph extends Enemy {
  constructor(game, positionX, positionY) {
    super(game, positionX, positionY);
    this.image = document.getElementById('beetlemorph');
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 1;

    this.maxFrames = 2;
    this.maxLives = this.lives;
  }
}

class Rhinomorph extends Enemy {
  constructor(game, positionX, positionY) {
    super(game, positionX, positionY);
    this.image = document.getElementById('rhinomorph');
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 4;

    this.maxFrames = 5;
    this.maxLives = this.lives;
  }
  hit(damage) {
    this.lives -= damage;
    this.frameX = this.maxLives - Math.floor(this.lives);
  }
}

class Wave {
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;

    this.enemies = [];
    this.create();

    this.nextWaveTrigger = false;

    this.markedForDetection = false;
  }
  render(context) {
    // context.strokeRect(this.x, this.y, this.width, this.height);
    if (this.y < 0) this.y += 5;

    this.speedY = 0;

    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }
    this.x += this.speedX;
    this.y += this.speedY;

    this.enemies.forEach((enemy) => {
      enemy.update(this.x, this.y);
      enemy.draw(context);
    });
    this.enemies = this.enemies.filter((obj) => !obj.markedForDetection);

    if (this.enemies.length <= 0) this.markedForDetection = true;
  }
  create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        let enemyX = x * this.game.enemySize;
        let enemyY = y * this.game.enemySize;
        const procentOfRhinomorpth = this.game.wavesCount * 0.05 + 0.05;
        if (Math.random() < procentOfRhinomorpth) {
          this.enemies.push(new Rhinomorph(this.game, enemyX, enemyY));
        } else {
          this.enemies.push(new Beetlemorph(this.game, enemyX, enemyY));
        }
      }
    }
  }
}

class Boss {
  constructor(game) {
    this.game = game;
    this.width = 200;
    this.height = 200;
    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;
    this.lives = this.game.bossLives;
    this.maxLives = this.lives;
    this.markedForDetection = false;
    this.image = document.getElementById('boss');
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrames = 11;
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.lives >= 1) {
      context.save();
      context.textAlign = 'center';
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.shadowColor = 'black';
      context.fillText(
        Math.floor(this.lives),
        this.x + this.width / 2,
        this.y + 30
      );
      context.restore();
    }
  }
  update() {
    this.speedY = 0;
    if (this.game.spriteUpdate && this.lives >= 1) this.frameX = 0;
    if (this.y < 0) this.y += 4;
    if (
      this.x < 0 ||
      (this.x > this.game.width - this.width && this.lives >= 1)
    ) {
      this.speedX *= -1;
      this.speedY = this.height / 2;
    }
    this.x += this.speedX;
    this.y += this.speedY;

    //collision detection between boss and projectile
    this.game.projectilesPool.forEach((projectile) => {
      if (
        this.game.checkCollision(this, projectile) &&
        !projectile.free &&
        this.lives >= 1
      ) {
        this.hit(1);
        projectile.reset();
      }
    });
    //collision detection between boss and player
    if (this.game.checkCollision(this, this.game.player) && this.lives >= 1) {
      this.game.gameOver = true;
      this.lives = 0;
    }
    //boss destroyed
    if (this.lives < 1 && this.game.spriteUpdate) {
      this.frameX++;
      if (this.frameX > this.maxFrames) {
        this.markedForDetection = true;
        this.game.score += this.maxLives;
        if (!this.game.gameOver) this.game.newWave();
      }
    }
    // lose condition
    if (this.y + this.height > this.game.height) this.game.gameOver = true;
  }
  hit(damage) {
    this.lives -= damage;
    if (this.lives >= 1) this.frameX = 1;
  }
}

class Laser {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.height = this.game.height - 50;
  }
  render(context) {
    this.x = this.game.player.x + this.game.player.width / 2 - this.width / 2;
    this.game.player.energy -= this.damage;

    context.save();
    context.fillStyle = 'gold';
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = 'white';
    context.fillRect(
      this.x + this.width / 4,
      this.y,
      this.width / 2,
      this.height
    );
    context.restore();

    if (this.game.spriteUpdate) {
      this.game.waves.forEach((wave) => {
        wave.enemies.forEach((enemy) => {
          if (this.game.checkCollision(enemy, this)) {
            enemy.hit(this.damage);
          }
        });
      });
      this.game.bossArray.forEach((boss) => {
        if (this.game.checkCollision(boss, this) && boss.y >= 0) {
          boss.hit(this.damage);
        }
      });
    }
  }
}

class SmallLaser extends Laser {
  constructor(game) {
    super(game);
    this.width = 5;
    this.damage = 0.3;
  }
  render(context) {
    if (this.game.player.energy > 1 && !this.game.player.cooldown) {
      super.render(context);
      this.game.player.frameX = 2;
    }
  }
}

class BigLaser extends Laser {
  constructor(game) {
    super(game);
    this.width = 20;
    this.damage = 0.6;
  }
  render(context) {
    if (this.game.player.energy > 1 && !this.game.player.cooldown) {
      super.render(context);
      this.game.player.frameX = 3;
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.player = new Player(this);

    this.projectilesPool = [];
    this.numberOfProjectile = 15;

    this.createProjectiles();

    this.columns = 1;
    this.rows = 1;
    this.enemySize = 80;

    this.waves = [];
    this.wavesCount = 1;
    // this.waves.push(new Wave(this));

    this.bossArray = [];
    this.bossLives = 10;

    this.score = 0;
    this.gameOver = false;

    this.fired = false;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 150;

    this.restart();

    // event listener
    window.addEventListener('keydown', (e) => {
      if (e.key === '1' && !this.fired) this.player.shoot();
      this.fired = true;
      if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
      if (e.key === 'r' && this.gameOver) this.restart();
    });

    window.addEventListener('keyup', (e) => {
      this.fired = false;
      const index = this.keys.indexOf(e.key);
      if (index > -1) this.keys.splice(index, 1);
    });
  }
  render(context, deltaTime) {
    //sptite timing

    if (this.spriteTimer > this.spriteInterval) {
      this.spriteUpdate = true;
      this.spriteTimer = 0;
    } else {
      this.spriteUpdate = false;

      this.spriteTimer += deltaTime;
    }

    this.drawStatusText(context);

    this.projectilesPool.forEach((projectile) => {
      projectile.update();
      projectile.draw(context);
    });

    this.player.draw(context);
    this.player.update();

    this.waves.forEach((wave) => {
      wave.render(context);
      if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver) {
        this.newWave();

        wave.nextWaveTrigger = true;
      }
    });

    this.bossArray.forEach((boss) => {
      boss.draw(context);
      boss.update();
    });
    this.bossArray = this.bossArray.filter(
      (object) => !object.markedForDetection
    );
  }

  // create Projectiles object pool
  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectile; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }

  //get free projectile object from the pool
  getProjectile() {
    for (let i = 0; i < this.projectilesPool.length; i++) {
      if (this.projectilesPool[i].free) return this.projectilesPool[i];
    }
  }

  //collision detection between 2 recktangles
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  drawStatusText(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = '#000';

    context.fillText(`Score: ${this.score}`, 20, 40);

    context.fillText(`Wave: ${this.wavesCount}`, 20, 80);
    for (let i = 0; i < this.player.maxLives; i++) {
      context.strokeRect(20 + 20 * i, 100, 10, 15);
    }
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(20 + 20 * i, 100, 10, 15);
    }

    //energy
    context.save();
    this.player.cooldown
      ? (context.fillStyle = 'red')
      : (context.fillStyle = 'gold');
    for (let i = 0; i < this.player.energy; i++) {
      context.fillRect(20 + 2 * i, 130, 2, 15);
    }
    context.restore();

    // game over
    if (this.gameOver) {
      context.textAlign = 'center';
      context.font = '100px Impact';
      context.fillText(`GAME OVER!`, this.width / 2, this.height / 2);
      context.font = '20px Impact';
      context.fillText(
        `Press R to restart!`,
        this.width / 2,
        this.height / 2 + 30
      );
    }
    context.restore();
  }

  newWave() {
    this.wavesCount++;
    if (this.player.lives < this.player.maxLives) this.player.lives++;
    if (this.wavesCount % 4 === 0) {
      this.bossArray.push(new Boss(this));
      this.bossLives += 10;
    } else {
      if (
        Math.random() < 0.5 &&
        this.columns * this.enemySize < this.width * 0.8
      ) {
        this.columns++;
      } else if (this.rows * this.enemySize < this.height * 0.6) {
        this.rows++;
      }
      this.waves.push(new Wave(this));
    }
    this.waves = this.waves.filter((object) => !object.markedForDetection);
  }
  restart() {
    this.player.restart();
    this.columns = 1;
    this.rows = 1;

    this.waves = [];
    this.wavesCount = 1;
    this.waves.push(new Wave(this));

    this.bossArray = [];
    this.bossLives = 10;
    // this.bossArray.push(new Boss(this));
    console.log(this.waves, this.bossArray);

    this.score = 0;
    this.gameOver = false;
  }
}

window.addEventListener('load', function () {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  canvas.height = 800;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.font = '30px Impact';

  const game = new Game(canvas);

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;

    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate); // window.requestAnimationFrame(animate);
  }
  animate(0);
});
