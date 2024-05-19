const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 1;

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 255,
      y: 50
    },
    width: 175,
    height: 30
  }
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -115,
      y: 50
    },
    width: 115,
    height: 30
  }
});

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  },
  ArrowUp: {
    pressed: false
  }
};

let aiMoveDirection = 'left';
let aiMoveCooldown = 0;

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = 'rgba(255, 255, 255, 0.15)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Player movement with boundary checks
  if (keys.a.pressed && player.lastKey === 'a' && player.position.x > 0) {
    player.velocity.x = -3;
    player.mirrored = true;
    player.attackBox.offset.x = -player.attackBox.width - 20; // Adjust attack box to left
    player.switchSprite('run');
  } else if (keys.d.pressed && player.lastKey === 'd' && player.position.x + player.width < canvas.width) {
    player.velocity.x = 3;
    player.mirrored = false;
    player.attackBox.offset.x = 20; // Adjust attack box to right
    player.switchSprite('run');
  } else {
    player.switchSprite('idle');
  }

  // Player jumping with boundary checks
  if (player.velocity.y < 0 && player.position.y > 0) {
    player.switchSprite('jump');
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall');
  } else if (player.position.y + player.height >= canvas.height) {
    player.velocity.y = 0;
    player.position.y = canvas.height - player.height;
  }

  // AI logic for enemy movement with randomness
  if (aiMoveCooldown <= 0) {
    if (Math.random() > 0.5) {
      aiMoveDirection = 'left';
    } else {
      aiMoveDirection = 'right';
    }
    aiMoveCooldown = 60; // Change direction every 60 frames
  } else {
    aiMoveCooldown--;
  }

  if (aiMoveDirection === 'left' && enemy.position.x > player.position.x - 100 && enemy.position.x > 0) {
    enemy.velocity.x = -3;
    enemy.mirrored = false;
    enemy.attackBox.offset.x = -enemy.attackBox.width - 20; // Adjust attack box to left
    enemy.switchSprite('run');
  } else if (aiMoveDirection === 'right' && enemy.position.x < player.position.x + 100 && enemy.position.x + enemy.width < canvas.width) {
    enemy.velocity.x = 3;
    enemy.mirrored = true;
    enemy.attackBox.offset.x = 20; // Adjust attack box to right
    enemy.switchSprite('run');
  } else {
    enemy.switchSprite('idle');
  }

  // AI logic for enemy jumping
  if (enemy.position.y > player.position.y && enemy.position.y > 0 && Math.random() > 0.98) {
    enemy.velocity.y = -15;
    enemy.switchSprite('jump');
  }

  // AI logic for enemy attacking
  if (
    Math.abs(player.position.x - enemy.position.x) < 50 &&
    Math.abs(player.position.y - enemy.position.y) < 50 &&
    !enemy.isAttacking
  ) {
    enemy.attack();
  }

  // Detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit(2.358); // Adjust damage as needed
    player.isAttacking = false;

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    });
  }

  // If player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // Detect for collision & player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit(17); // Adjust damage as needed
    enemy.isAttacking = false;

    gsap.to('#playerHealth', {
      width: player.health + '%'
    });
  }

  // If enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // End game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        player.mirrored = false;
        player.attackBox.offset.x = 20; // Adjust attack box to right
        break;
      case 'a':
        keys.a.pressed = true;
        player.lastKey = 'a';
        player.mirrored = true;
        player.attackBox.offset.x = -player.attackBox.width - 20; // Adjust attack box to left
        break;
      case 'w':
        if (player.position.y > 0) {
          player.velocity.y = -15;
        }
        break;
      case 's':
        player.attack();
        break;
      case 'r':
        if (player.health < 100) {
          player.receiveHealth(100);
        }
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = 'ArrowRight';
        enemy.mirrored = true;
        enemy.attackBox.offset.x = 20; // Adjust attack box to right
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = 'ArrowLeft';
        enemy.mirrored = false;
        enemy.attackBox.offset.x = -enemy.attackBox.width - 20; // Adjust attack box to left
        break;
      case 'ArrowUp':
        if (enemy.position.y > 0) {
          enemy.velocity.y = -15;
        }
        break;
      case 'l':
        enemy.attack();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
  }

  // Enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});
