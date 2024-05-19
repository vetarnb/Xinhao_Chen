const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const socket = new WebSocket('wss://xinhaochen0727-309bf2d7e201.herokuapp.com');

const gravity = 0.7;

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  w: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowUp: { pressed: false },
};

let player, enemy, role;

socket.onopen = () => {
  console.log('Connected to WebSocket server');
  const roomNumber = localStorage.getItem('roomNumber');
  socket.send(JSON.stringify({ type: 'joinRoom', room: roomNumber }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.message === 'waiting') {
    document.getElementById('waitingMessage').style.display = 'block';
  } else if (data.start) {
    document.getElementById('waitingMessage').style.display = 'none';
    role = data.role;
    initializeGame(data.role);
  } else if (data.type === 'update') {
    updateGame(data);
  }
};

function initializeGame(role) {
  if (role === 'player') {
    player = new Fighter({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8,
      scale: 2.5,
      offset: { x: 215, y: 157 },
      sprites: {
        idle: { imageSrc: './img/samuraiMack/Idle.png', framesMax: 8 },
        run: { imageSrc: './img/samuraiMack/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/samuraiMack/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/samuraiMack/Fall.png', framesMax: 2 },
        attack1: { imageSrc: './img/samuraiMack/Attack1.png', framesMax: 6 },
        takeHit: { imageSrc: './img/samuraiMack/Take Hit - white silhouette.png', framesMax: 4 },
        death: { imageSrc: './img/samuraiMack/Death.png', framesMax: 6 }
      },
      attackBox: {
        offset: { x: 255, y: 50 },
        width: 175,
        height: 30
      }
    });

    enemy = new Fighter({
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      color: 'blue',
      offset: { x: -50, y: 0 },
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4,
      scale: 2.5,
      offset: { x: 215, y: 167 },
      sprites: {
        idle: { imageSrc: './img/kenji/Idle.png', framesMax: 4 },
        run: { imageSrc: './img/kenji/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/kenji/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/kenji/Fall.png', framesMax: 2 },
        attack1: { imageSrc: './img/kenji/Attack1.png', framesMax: 4 },
        takeHit: { imageSrc: './img/kenji/Take hit.png', framesMax: 3 },
        death: { imageSrc: './img/kenji/Death.png', framesMax: 7 }
      },
      attackBox: {
        offset: { x: -115, y: 50 },
        width: 115,
        height: 30
      }
    });
  } else {
    enemy = new Fighter({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8,
      scale: 2.5,
      offset: { x: 215, y: 157 },
      sprites: {
        idle: { imageSrc: './img/samuraiMack/Idle.png', framesMax: 8 },
        run: { imageSrc: './img/samuraiMack/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/samuraiMack/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/samuraiMack/Fall.png', framesMax: 2 },
        attack1: { imageSrc: './img/samuraiMack/Attack1.png', framesMax: 6 },
        takeHit: { imageSrc: './img/samuraiMack/Take Hit - white silhouette.png', framesMax: 4 },
        death: { imageSrc: './img/samuraiMack/Death.png', framesMax: 6 }
      },
      attackBox: {
        offset: { x: 255, y: 50 },
        width: 175,
        height: 30
      }
    });

    player = new Fighter({
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      color: 'blue',
      offset: { x: -50, y: 0 },
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4,
      scale: 2.5,
      offset: { x: 215, y: 167 },
      sprites: {
        idle: { imageSrc: './img/kenji/Idle.png', framesMax: 4 },
        run: { imageSrc: './img/kenji/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/kenji/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/kenji/Fall.png', framesMax: 2 },
        attack1: { imageSrc: './img/kenji/Attack1.png', framesMax: 4 },
        takeHit: { imageSrc: './img/kenji/Take hit.png', framesMax: 3 },
        death: { imageSrc: './img/kenji/Death.png', framesMax: 7 }
      },
      attackBox: {
        offset: { x: -115, y: 50 },
        width: 115,
        height: 30
      }
    });
  }

  animate();
}

function updateGame(data) {
  if (data.role === 'player') {
    player.position = data.position;
    player.velocity = data.velocity;
    player.health = data.health;
    player.attackBox = data.attackBox;
    player.framesCurrent = data.framesCurrent;
    player.isAttacking = data.isAttacking;
  } else if (data.role === 'enemy') {
    enemy.position = data.position;
    enemy.velocity = data.velocity;
    enemy.health = data.health;
    enemy.attackBox = data.attackBox;
    enemy.framesCurrent = data.framesCurrent;
    enemy.isAttacking = data.isAttacking;
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  enemy.update();

  // Player movement with boundary checks
  if (keys.a.pressed && player.lastKey === 'a' && player.position.x > 0) {
    player.velocity.x = -3;
    player.mirrored = true;
    player.attackBox.offset.x = -player.attackBox.width;
  } else if (keys.d.pressed && player.lastKey === 'd' && player.position.x + player.width < canvas.width) {
    player.velocity.x = 3;
    player.mirrored = false;
    player.attackBox.offset.x = player.width;
  } else {
    player.velocity.x = 0;
  }

  if (player.position.y + player.height + player.velocity.y >= canvas.height) {
    player.velocity.y = 0;
    player.position.y = canvas.height - player.height;
  } else {
    player.velocity.y += gravity;
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && enemy.position.x > 0) {
    enemy.velocity.x = -3;
    enemy.mirrored = true;
    enemy.attackBox.offset.x = -enemy.attackBox.width;
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && enemy.position.x + enemy.width < canvas.width) {
    enemy.velocity.x = 3;
    enemy.mirrored = false;
    enemy.attackBox.offset.x = enemy.width;
  } else {
    enemy.velocity.x = 0;
  }

  if (enemy.position.y + enemy.height + enemy.velocity.y >= canvas.height) {
    enemy.velocity.y = 0;
    enemy.position.y = canvas.height - enemy.height;
  } else {
    enemy.velocity.y += gravity;
  }

  // Collision detection
  if (player.isAttacking && rectCollision(player, enemy)) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    });
  }

  if (enemy.isAttacking && rectCollision(enemy, player)) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to('#playerHealth', {
      width: player.health + '%'
    });
  }

  // Send player update to server
  if (role === 'player') {
    socket.send(JSON.stringify({
      type: 'update',
      role: 'player',
      position: player.position,
      velocity: player.velocity,
      health: player.health,
      attackBox: player.attackBox,
      framesCurrent: player.framesCurrent,
      isAttacking: player.isAttacking
    }));
  } else if (role === 'enemy') {
    socket.send(JSON.stringify({
      type: 'update',
      role: 'enemy',
      position: enemy.position,
      velocity: enemy.velocity,
      health: enemy.health,
      attackBox: enemy.attackBox,
      framesCurrent: enemy.framesCurrent,
      isAttacking: enemy.isAttacking
    }));
  }
}

function rectCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = true;
      player.lastKey = 'd';
      break;
    case 'a':
      keys.a.pressed = true;
      player.lastKey = 'a';
      break;
    case 'w':
      if (player.velocity.y === 0) {
        player.velocity.y = -15;
      }
      break;
    case 'ArrowRight':
      keys.ArrowRight.pressed = true;
      enemy.lastKey = 'ArrowRight';
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = true;
      enemy.lastKey = 'ArrowLeft';
      break;
    case 'ArrowUp':
      if (enemy.velocity.y === 0) {
        enemy.velocity.y = -15;
      }
      break;
    case ' ':
      player.attack();
      break;
    case 'Enter':
      enemy.attack();
      break;
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
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});
