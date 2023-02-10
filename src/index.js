import "./styles.css";

const canvas = document.getElementById("app");
const context = canvas.getContext("2d");
const [canvasWidth, canvasHeight] = [canvas.width, canvas.height];
const size = 10;

const multiply = (p, n) => p.map((val) => val * n);
const add = (p1, p2) => [p1[0] + p2[0], p1[1] + p2[1]];

const getContextRenderer = (render, context) => (...args) =>
  render(context, ...args);

const renderScore = getContextRenderer((context, score) => {
  context.font = "14px Arial";
  context.fillStyle = "white";
  context.fillText(score, 10, 24);
}, context);

const getRandomPosition = (history, snake) => {
  const snakePositionList = history.slice(-snake.length);
  let randomPosition = snakePositionList[0];

  const findIsInPositionList = (positionList, position) =>
    positionList.find(([x, y]) => position[0] === x && position[1] === y) !==
    undefined;

  while (findIsInPositionList(snakePositionList, randomPosition)) {
    randomPosition = [
      Math.floor(Math.random() * (canvasWidth / size - 1)) * size,
      Math.floor(Math.random() * (canvasHeight / size - 1)) * size
    ];
  }
  return randomPosition;
};

const renderFood = getContextRenderer((context, food) => {
  context.fillStyle = "pink";
  context.fillRect(food.position[0], food.position[1], size, size);
}, context);

const getLatestPosition = (history) => history[history.length - 1];

const getSnakePosition = ({ snake, directionVector, history }) => {
  const latestPosition = getLatestPosition(history);
  if (latestPosition[1] === 0 && directionVector[1] === -1) {
    return [latestPosition[0], canvasHeight - size];
  } else if (
    latestPosition[1] === canvasHeight - size &&
    directionVector[1] === 1
  ) {
    return [latestPosition[0], 0];
  } else if (latestPosition[0] === 0 && directionVector[0] === -1) {
    return [canvasWidth - size, latestPosition[1]];
  } else if (
    latestPosition[0] === canvasWidth - size &&
    directionVector[0] === 1
  ) {
    return [0, latestPosition[1]];
  } else {
    return [
      latestPosition[0] + snake.velocity * directionVector[0],
      latestPosition[1] + snake.velocity * directionVector[1]
    ];
  }
};

const findIsBothPositionTheSame = (p1, p2) =>
  p1[0] === p2[0] && p1[1] === p2[1];

const detectCollision = ({ snake, history, directionVector, restartGame }) => {
  const latestPosition = add(
    getLatestPosition(history),
    multiply(directionVector, size)
  );
  const tail = history.slice(-snake.length).slice(0, snake.length - 2);
  const isGameFinished = tail.reduce(
    (isGameFinished, position) =>
      findIsBothPositionTheSame(position, latestPosition) || isGameFinished,
    false
  );
  if (isGameFinished) {
    restartGame();
  }
};

const renderSnake = getContextRenderer(
  (context, snake, directionVector, history) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = "white";
    history.push(getSnakePosition({ snake, history, directionVector }));

    history.slice(-snake.length).forEach(([x, y]) => {
      context.fillRect(x, y, size, size);
    });
  },
  context
);

const directionVectorMap = {
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0]
};
const getFood = (history, snake) => ({
  score: Math.floor(Math.random() * snake.length || 1),
  position: getRandomPosition(history, snake)
});

const detectEat = ({ snake, history, food, directionVector }) => {
  const latestPosition = add(
    getLatestPosition(history),
    multiply(directionVector, size)
  );
  if (findIsBothPositionTheSame(latestPosition, food.position)) {
    snake.length++;
    const newFood = getFood(history, snake);
    food.position = newFood.position;
    food.score = newFood.score;
  }
};

const startGame = () => {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  let renderId;
  let directionVector = directionVectorMap.ArrowRight;
  const initialLength = 3;
  const snake = {
    length: initialLength,
    velocity: 10
  };
  const history = [...Array(snake.length).keys()].map((i) => [
    150 + i * size,
    150
  ]);
  const food = getFood(history, snake);
  const render = ({
    snake,
    directionVector,
    history,
    renderId,
    foodRefreshId
  }) => {
    const restartGame = () => {
      clearInterval(renderId);
      clearInterval(foodRefreshId);
      startGame();
    };
    detectCollision({ snake, directionVector, history, restartGame });
    detectEat({ snake, history, food, directionVector });
    renderSnake(snake, directionVector, history);
    renderScore(snake.length - initialLength);
    renderFood(food);
  };

  document.addEventListener("keydown", (event) => {
    directionVector = directionVectorMap[event.key];
  });

  const foodRefreshId = setInterval(() => {
    const newFood = getFood(history, snake);
    food.position = newFood.position;
    food.score = newFood.score;
  }, 20000);

  renderId = setInterval(() => {
    render({ snake, directionVector, history, renderId, foodRefreshId });
  }, 400);
};

startGame();
