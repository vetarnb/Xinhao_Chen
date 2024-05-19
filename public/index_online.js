const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 1

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

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
})

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
})

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
}

const ws = new WebSocket(`wss://${location.host}`);
let isPlayer = false;
let room;

// Listen for messages from the server
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'init':
      isPlayer = data.isPlayer;
      break;
    case 'playerMove':
      updatePlayer(data);
      break;
    case 'playerAttack':
      handlePlayerAttack(data);
      break;
    case 'gameState':
      syncGameState(data);
      break;
    default:
      break;
  }
}

function updatePlayer(data) {
  const playerToUpdate = data.id === player.id ? player : enemy;
  playerToUpdate.position.x = data.position.x;
  playerToUpdate.position.y = data.position.y;
  playerToUpdate.velocity.x = data.velocity.x;
  playerToUpdate.velocity.y = data.velocity.y;
  playerToUpdate.switchSprite(data.sprite);
}

function handlePlayerAttack(data) {
  const playerToUpdate = data.id === player.id ? player : enemy;
  playerToUpdate.attack();
}

function syncGameState(data) {
  player.position = data.player.position;
  player.velocity = data.player.velocity;
  player.health = data.player.health;

  enemy.position = data.enemy.position;
  enemy.velocity = data.enemy.velocity;
  enemy.health = data.enemy.health;

  gsap.to('#playerHealth', {
    width: player.health + '%'
  });

  gsap.to('#enemyHealth', {
    width: enemy.health + '%'
  });
}

function sendPlayerAction(action, details = {}) {
  ws.send(JSON.stringify({
    type: action,
    room: room,
    id: player.id,
    ...details
  }));
}

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  if (isPlayer) {
    player.velocity.x = 0

    // player movement with boundary checks
    if (keys.a.pressed && player.lastKey === 'a' && player.position.x > 0) {
      player.velocity.x = -3
      player.mirrored = true
      player.attackBox.offset.x = -player.attackBox.width - 20 // Adjust attack box to left
      player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd' && player.position.x + player.width < canvas.width) {
      player.velocity.x = 3
      player.mirrored = false
      player.attackBox.offset.x = 20 // Adjust attack box to right
      player.switchSprite('run')
    } else {
      player.switchSprite('idle')
    }

    // jumping with boundary checks
    if (player.velocity.y < 0 && player.position.y > 0) {
      player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
      player.switchSprite('fall')
    } else if (player.position.y + player.height >= canvas.height) {
      player.velocity.y = 0
      player.position.y = canvas.height - player.height
    }

    // Send player state to server
    sendPlayerAction('playerMove', {
      position: player.position,
      velocity: player.velocity,
      sprite: player.currentSprite
    });

    // detect for collision & enemy gets hit
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: enemy
      }) &&
      player.isAttacking &&
      player.framesCurrent === 4
    ) {
      enemy.takeHit(4) // Adjust damage as needed
      player.isAttacking = false

      gsap.to('#enemyHealth', {
        width: enemy.health + '%'
      });

      // Send attack action to server
      sendPlayerAction('playerAttack');
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
      player.isAttacking = false
    }
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        player.mirrored = false
        player.attackBox.offset.x = 20 // Adjust attack box to right
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        player.mirrored = true
        player.attackBox.offset.x = -player.attackBox.width - 20 // Adjust attack box to left
        break
      case 'w':
        if (player.position.y > 0) {
          player.velocity.y = -15
        }
        break
      case 's':
        player.attack()
        sendPlayerAction('playerAttack');
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        enemy.mirrored = true
        enemy.attackBox.offset.x = 20 // Adjust attack box to right
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        enemy.mirrored = false
        enemy.attackBox.offset.x = -enemy.attackBox.width - 20 // Adjust attack box to left
        break
      case 'ArrowUp':
        if (enemy.position.y > 0) {
          enemy.velocity.y = -15
        }
        break
      case 'l':
        enemy.attack()
        sendPlayerAction('playerAttack');
        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})













    