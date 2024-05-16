from browser import document, html, timer, window

# Set up game constants
WIDTH, HEIGHT = 800, 600
SNAKE_SIZE = 20
SNAKE_SPEED = 20
FPS = 10

# Set up colors
BLACK = 'black'
WHITE = 'white'
RED = 'red'
GREEN = 'green'

# Set up initial game state
snake = [(WIDTH // 2, HEIGHT // 2)]
snake_direction = (SNAKE_SIZE, 0)
food = (0, 0)
score = 0

# Create canvas and context
canvas = document["snake-canvas"]
context = canvas.getContext("2d")

# Function to draw the game
def draw():
    context.fillStyle = BLACK
    context.fillRect(0, 0, WIDTH, HEIGHT)
    
    context.fillStyle = WHITE
    for segment in snake:
        context.fillRect(segment[0], segment[1], SNAKE_SIZE, SNAKE_SIZE)
    
    context.fillStyle = RED
    context.fillRect(food[0], food[1], SNAKE_SIZE, SNAKE_SIZE)
    
    context.fillStyle = WHITE
    context.font = "30px Arial"
    context.fillText(f"Score: {score}", 10, 30)

# Function to update the game state
def update():
    global snake, food, score
    
    # Move snake
    new_head = (snake[0][0] + snake_direction[0], snake[0][1] + snake_direction[1])
    snake.insert(0, new_head)
    
    # Check for collision with food
    if new_head[0] == food[0] and new_head[1] == food[1]:
        score += 1
        place_food()
    else:
        snake.pop()
    
    # Check for collision with walls
    if new_head[0] < 0 or new_head[0] >= WIDTH or new_head[1] < 0 or new_head[1] >= HEIGHT:
        game_over()
    
    # Check for collision with itself
    if new_head in snake[1:]:
        game_over()

# Function to place the food at a random position
def place_food():
    from random import randint
    global food
    food = (randint(0, (WIDTH - SNAKE_SIZE) // SNAKE_SIZE) * SNAKE_SIZE,
            randint(0, (HEIGHT - SNAKE_SIZE) // SNAKE_SIZE) * SNAKE_SIZE)

# Function to handle game over
def game_over():
    global snake, food, score
    window.alert(f"Game Over! Your score was: {score}")
    snake = [(WIDTH // 2, HEIGHT // 2)]
    score = 0
    place_food()

# Function to handle key presses
def key_down(event):
    global snake_direction
    if event.key == "ArrowLeft" and snake_direction != (SNAKE_SIZE, 0):
        snake_direction = (-SNAKE_SIZE, 0)
    elif event.key == "ArrowRight" and snake_direction != (-SNAKE_SIZE, 0):
        snake_direction = (SNAKE_SIZE, 0)
    elif event.key == "ArrowUp" and snake_direction != (0, SNAKE_SIZE):
        snake_direction = (0, -SNAKE_SIZE)
    elif event.key == "ArrowDown" and snake_direction != (0, -SNAKE_SIZE):
        snake_direction = (0, SNAKE_SIZE)

# Set up event listeners
document.bind("keydown", key_down)

# Place initial food
place_food()

# Main game loop
def game_loop():
    update()
    draw()

# Run the game loop at a set interval
timer.set_interval(game_loop, 1000 // FPS)
