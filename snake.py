import pygame
import sys
import random

# Initialize Pygame
pygame.init()

# Set up game window
screen_width, screen_height = 800, 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Snake Game")

# Set up colors
black = (0, 0, 0)
white = (255, 255, 255)
red = (255, 0, 0)
green = (0, 255, 0)

# Set up Snake
snake_size = 20
snake_speed = 20
snake = [(screen_width // 2, screen_height // 2)]
snake_direction = (1, 0)

# Set up initial food position
food = (random.randint(0, screen_width - snake_size), random.randint(0, screen_height - snake_size))

# Set up obstacles
obstacle_size = 20
obstacles = [(200, 200), (400, 400), (600, 200)]

# Set up score
score = 0
font = pygame.font.SysFont(None, 30)

# Function to generate a new random position for food avoiding obstacles
def generate_food_position():
    while True:
        new_food = (random.randint(0, screen_width - snake_size), random.randint(0, screen_height - snake_size))
        if not any(new_food[0] < obstacle[0] + obstacle_size and
                   new_food[0] + snake_size > obstacle[0] and
                   new_food[1] < obstacle[1] + obstacle_size and
                   new_food[1] + snake_size > obstacle[1] for obstacle in obstacles):
            return new_food

# Game loop
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and snake_direction != (1, 0):
        snake_direction = (-1, 0)
    elif keys[pygame.K_RIGHT] and snake_direction != (-1, 0):
        snake_direction = (1, 0)
    elif keys[pygame.K_UP] and snake_direction != (0, 1):
        snake_direction = (0, -1)
    elif keys[pygame.K_DOWN] and snake_direction != (0, -1):
        snake_direction = (0, 1)

    # Move Snake
    x, y = snake[0]
    x += snake_direction[0] * snake_speed
    y += snake_direction[1] * snake_speed
    snake.insert(0, (x, y))

    # Check for collision with food
    if x < food[0] + snake_size and x + snake_size > food[0] and y < food[1] + snake_size and y + snake_size > food[1]:
        food = generate_food_position()
        score += 1
    else:
        snake.pop()

    # Check for collision with obstacles
    if any(segment == (x, y) for segment in obstacles) or (
        x < 0 or x + snake_size > screen_width or
        y < 0 or y + snake_size > screen_height or
        any(segment == (x, y) for segment in snake[1:])
    ):
        pygame.quit()
        sys.exit()

    # Draw background
    screen.fill(black)

    # Draw Snake
    for segment in snake:
        pygame.draw.rect(screen, white, (*segment, snake_size, snake_size))

    # Draw food
    pygame.draw.rect(screen, red, (*food, snake_size, snake_size))

    # Draw obstacles
    for obstacle in obstacles:
        pygame.draw.rect(screen, green, (*obstacle, obstacle_size, obstacle_size))

    # Draw score
    score_text = font.render(f"Score: {score}", True, white)
    screen.blit(score_text, (10, 10))

    # Update display
    pygame.display.flip()

    # Control game speed
    pygame.time.Clock().tick(10)