const container = document.getElementById('container');
const waitingContainer = document.getElementById('waiting-container');
const waitingCounter = document.getElementById('waiting-counter');
const stoppedContainer = document.getElementById('stopped-container');
const stoppedCounter = document.getElementById('stopped-counter');
const stopButton = document.getElementById('stop-button');
const scrollControlButton = document.getElementById('scroll_control_button');
const noActiveGameZonePanel = document.getElementById(
  'bottom_game_zone_panel-no_active'
);
const bonusPanel = document.getElementById('bonuses_panel');
const scrollPanel = document.getElementById('scroll_panel');
const scrollPanelArrowBack = document.getElementById('scroll_panel-arrow_back');
const warningZone = document.getElementById('last_step_warning_zone');

const ballSpead = 8;
const ballsSize = container.clientWidth / 50;
const elementsSize = container.clientWidth / 11;
const maxLineNumber = Math.floor((container.clientHeight-ballsSize*2)/elementsSize);

let elementsStacks = 1;
let currentNewLineNumber = 1;

waitingContainer.style.width = ballsSize + 'px';
waitingContainer.style.height = ballsSize + 'px';
waitingContainer.style.fontSize = elementsSize / 2 + 'px';
stoppedContainer.style.width = ballsSize + 'px';
stoppedContainer.style.height = ballsSize + 'px';
stoppedContainer.style.fontSize = elementsSize / 2 + 'px';

stopButton.style.display = 'none';
scrollPanel.style.display = 'none';

let isGameOver = false;
let balls = [];
let waitingBalls = [];
let stopPosition = {
  left: container.offsetWidth / 2 - ballsSize / 2,
  top: container.clientHeight - ballsSize,
  isUpdated: false,
};
let isAnimating = false;
let isBallsInWaitingContainer = true;
let forceStopBallsMoving = false;
let trajectoryElement;
let extraBallsQue = 0;
let temporaryExtraBalls = 0;

const maxTrajectoryLength = container.offsetHeight * 1.2;

const containerRect = container.getBoundingClientRect();

const levels = [
  {
    rows: [
      [
        { type: 'box', stacks: 10 },
        ,
        ,
        { type: 'triangle', mainAngle: 'RT', stacks: 10 },
        { type: 'triangle', mainAngle: 'LB', stacks: 10 },
      ],
      [],
      [
        { type: 'box', stacks: 10 },
        ,
        ,
        { type: 'triangle', mainAngle: 'RB', stacks: 10 },
      ],
      [
        { type: 'box', stacks: 10 },
        ,
        ,
        { type: 'triangle', mainAngle: 'LT', stacks: 10 },
        { type: 'box', stacks: 10 },
      ],
    ],
  },
  {
    rows: [
      [
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'LT', stacks: 555 },
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
      ],
      [
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
      [
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        ,
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        ,
        ,
        ,
        { type: 'triangle', mainAngle: 'LT', stacks: 5 },
        { type: 'triangle', mainAngle: 'RT', stacks: 5 },
        ,
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
      [
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        { type: 'addBalls', bonus: 1 },
        { type: 'addBalls', bonus: 3 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
      [
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'box', stacks: 7 },
        ,
        ,
        ,
        { type: 'box', stacks: 7 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
    ],
  },
  {
    rows: [
      [
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'box', stacks: 7 },
        ,
        { type: 'laser', direction: 'TB' },
        { type: 'laser', direction: 'LR' },
        { type: 'box', stacks: 7 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
    ],
  },
];

// Выбираем нужный уровень
const levelConfig = levels[2];

// Создаем 10 шаров
for (let i = 0; i < 1; i++) {
  createBall();
}

// generateLevel(levelConfig);
addNewLineClassicMode(10, elementsStacks++);
stopButton.addEventListener('click', stopAnimation);
container.addEventListener('mousedown', startDrawingTrajectory);
container.addEventListener('mousemove', updateTrajectory);

// Переключение между бонусами и управлением с помощью скролла
scrollControlButton.addEventListener('click', function () {
  bonusPanel.style.display = 'none';
  scrollPanel.style.display = 'flex';
});
scrollPanelArrowBack.addEventListener('click', function () {
  bonusPanel.style.display = 'flex';
  scrollPanel.style.display = 'none';
});

// Генерация уровня
function generateLevel(config) {
  config.rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell) {
        const x = cellIndex * elementsSize;
        const y = rowIndex * elementsSize;
        switch (cell.type) {
          case 'box':
            createBox({x, y, stacks: cell.stacks});
            break;
          case 'triangle':
            createTriangle({x, y, mainAngle: cell.mainAngle, stacks: cell.stacks});
            break;
          case 'addBalls':
            createBonusBallsElement({x, y, bonus: cell.bonus});
            break;
          case 'laser':
            createLaserElement({x, y, direction: cell.direction});
            break;
        }
      }
    });
  });
}

// Генерация новой линии со случайными блоками (предпоследний блок - всегда бонусный мяч)
function generateLine(config) {
  config.rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cellIndex === 8) {
        const x = cellIndex * elementsSize;
        const y = rowIndex * elementsSize;
        createBonusBallsElement({x, y, bonus: 1});
      } else if (cell) {
        const x = cellIndex * elementsSize;
        const y = rowIndex * elementsSize;
        
        switch (cell.type) {
          case 'box':
            createBox({x, y, stacks: cell.stacks});
            break;
          case 'triangle':
            createTriangle({x, y, mainAngle: cell.mainAngle, stacks: cell.stacks});
            break;
          case 'addBalls':
            createBonusBallsElement({x, y, bonus: cell.bonus});
            break;
          case 'laser':
            createLaserElement({x, y, direction: cell.direction});
            break;
        }
      }
    });
  });
}

// Создание новой строки блоков со сдвигом вниз
function addNewLineClassicMode(size, stacks) {
  const elements = document.querySelectorAll('.element');

  elements.forEach((element) => {
    element.style.top = element.offsetTop + elementsSize + 'px';
  });

  generateLine(newLineGenerating(size, stacks));
  currentNewLineNumber++;
}

// Генерация строки случайных элементов (!дополнить типами элементов)
function newLineGenerating(length, stacks) {
  function createRandomElement(stack) {
    const randomNumber = Math.floor(Math.random() * 100);
    if (randomNumber >= 0 && randomNumber < 15) {
      return {
        type: 'box',
        stacks: stack,
      };
    } else if (randomNumber >= 15 && randomNumber < 50) {
      const randomTriangleAngleType = Math.floor(Math.random() * 4);
      switch (randomTriangleAngleType) {
        case 0:
          return {
            type: 'triangle',
            mainAngle: 'RB',
            stacks: stack,
          };
        case 1:
          return {
            type: 'triangle',
            mainAngle: 'LB',
            stacks: stack,
          };
        case 2:
          return {
            type: 'triangle',
            mainAngle: 'RT',
            stacks: stack,
          };
        case 3:
          return {
            type: 'triangle',
            mainAngle: 'LT',
            stacks: stack,
          };
      }
    } else if (randomNumber >= 50 && randomNumber < 98) {
      return;
    } else if (randomNumber >= 98 && randomNumber < 100) {
      const randomType = Math.floor(Math.random() * 2);
      switch (randomType) {
        case 0:
          return { 
            type: 'laser',
            direction: 'TB'
          };
        case 1:
          return { 
            type: 'laser',
            direction: 'LR'
          };
      }
    } else {
      return;
    }
  }
  const newLine = {
    rows: [[]],
  };
  for (let i = 0; i < length; i++) {
    newLine.rows[0].push(createRandomElement(stacks));
  }

  return newLine;
}

function createCounter(stacks) {
  const counterContainer = document.createElement('div');
  counterContainer.className = 'counter_container';
  counterContainer.style.width = elementsSize + 'px';
  counterContainer.style.height = elementsSize + 'px';
  const stacksCounter = document.createElement('span');
  stacksCounter.innerText = stacks;
  stacksCounter.style.fontSize = elementsSize / 3 + 'px';
  counterContainer.appendChild(stacksCounter);
  return counterContainer;
}

// Создание коробки
function createBox(config) {
  const box = document.createElement('div');
  box.dataset.stacks = config.stacks;
  box.dataset.line = currentNewLineNumber;
  box.className = 'element box';
  box.style.width = elementsSize + 'px';
  box.style.height = elementsSize + 'px';
  box.style.left = config.x + 'px';
  box.style.top = config.y + 'px';
  box.appendChild(createCounter(config.stacks));
  container.appendChild(box);
}

// Создание треугольника
function createTriangle(config) {
  const triangle = document.createElement('div');
  triangle.className = `element triangle triangle-${config.mainAngle}`;

  triangle.dataset.mainAngle = config.mainAngle;
  triangle.dataset.stacks = config.stacks;
  triangle.dataset.line = currentNewLineNumber;

  switch (config.mainAngle) {
    case 'RB':
      triangle.style.borderLeft = `${elementsSize}px solid transparent`;
      triangle.style.borderBottom = `${elementsSize}px solid blue`;
      break;
    case 'LB':
      triangle.style.borderRight = `${elementsSize}px solid transparent`;
      triangle.style.borderBottom = `${elementsSize}px solid blue`;
      break;
    case 'RT':
      triangle.style.borderLeft = `${elementsSize}px solid transparent`;
      triangle.style.borderTop = `${elementsSize}px solid blue`;
      break;
    case 'LT':
      triangle.style.borderRight = `${elementsSize}px solid transparent`;
      triangle.style.borderTop = `${elementsSize}px solid blue`;
      break;
  }

  triangle.style.left = config.x + 'px';
  triangle.style.top = config.y + 'px';
  triangle.appendChild(createCounter(config.stacks));
  container.appendChild(triangle);
}

function createBonusBallsElement(config) {
  const box = document.createElement('div');
  box.className = 'element bonus-box add-balls-bonus';

  box.dataset.extraBalls = config.bonus;
  box.dataset.line = currentNewLineNumber;

  box.style.width = elementsSize + 'px';
  box.style.height = elementsSize + 'px';
  box.style.left = config.x + 'px';
  box.style.top = config.y + 'px';
  const bonusBallsElement = document.createElement('div');
  bonusBallsElement.className = 'circle-bonus bonus-balls-circle';
  const bonusTitle = document.createElement('span');
  bonusTitle.innerText = `+${config.bonus}`;
  bonusTitle.style.fontSize = elementsSize / 3 + 'px';
  bonusBallsElement.appendChild(bonusTitle);
  box.appendChild(bonusBallsElement);
  container.appendChild(box);
}

function createLaserElement(config) {
  const box = document.createElement('div');
  box.className = 'element bonus-box laser-bonus';

  box.dataset.direction = config.direction;
  box.dataset.activated = 'false';
  box.dataset.line = currentNewLineNumber;

  box.style.width = elementsSize + 'px';
  box.style.height = elementsSize + 'px';
  box.style.left = config.x + 'px';
  box.style.top = config.y + 'px';
  const laserElement = document.createElement('div');
  laserElement.className = 'circle-bonus laser-circle';
  const bonusTitle = document.createElement('span');

  bonusTitle.innerText = '<>';
  bonusTitle.style.transform = config.direction === 'TB' ? 'rotate(90deg)' : null;
  bonusTitle.style.fontSize = elementsSize / 3 + 'px';
  laserElement.appendChild(bonusTitle);
  box.appendChild(laserElement);
  container.appendChild(box);
}

// Создание мяча и добавление его в массив мячей
function createBall() {
  let ball = document.createElement('div');
  ball.dataset.isThisBonusUsed = 'false';
  ball.className = 'ball';
  ball.style.width = ballsSize + 'px';
  ball.style.height = ballsSize + 'px';
  ball.style.left = -ballsSize / 2 + 'px';
  const ballElement = {
    element: ball,
    x: stopPosition.left,
    y: stopPosition.top,
    velX: 0,
    velY: 0,
  };
  waitingBalls.push(ballElement);
  if (isBallsInWaitingContainer) {
    waitingContainer.appendChild(ballElement.element);
    updateWaitingCounter();
  } else {
    stoppedContainer.appendChild(ballElement.element);
    updateStoppedCounter();
  }
}

function updateWaitingCounter() {
  const counterValue = waitingContainer.getElementsByClassName('ball').length;
  waitingCounter.innerText = counterValue === 0 ? '' : `x${counterValue}`;
  if (extraBallsQue !== 0 && !isBallsInWaitingContainer) {
    waitingCounter.innerText += ` +${extraBallsQue}`;
  }
}

function updateStoppedCounter() {
  const counterValue = stoppedContainer.getElementsByClassName('ball').length;
  stoppedCounter.innerText = counterValue === 0 ? '' : `x${counterValue}`;
  if (extraBallsQue !== 0 && isBallsInWaitingContainer) {
    stoppedCounter.innerText += ` +${extraBallsQue}`;
  }
}

function moveBall(ball, startedPosition) {
  let ballStopped = false;

  // Объявление начальной позиции мяча
  ball.x = startedPosition.left;
  ball.y = startedPosition.top;

  function move() {
    if (ballStopped) return;

    const ballRect = ball.element.getBoundingClientRect();

    ball.x += ball.velX;
    ball.y += ball.velY;

    // Поворот шара в направлении движения
    let angle = Math.atan2(ball.velY, ball.velX) * (180 / Math.PI);
    ball.element.style.transform = `rotate(${angle - 90}deg)`;

    // Проверка столкновения с контейнером
    if (
      ball.x - ballsSize / 2 <= 0 ||
      ball.x - ballsSize / 2 + ballRect.width >= container.clientWidth
    ) {
      ball.x -= ball.velX; // Шаг назад
      ball.velX = -ball.velX;
    }

    if (ball.y <= 0) {
      ball.y -= ball.velY; // Шаг назад
      ball.velY = -ball.velY;
    }

    ball.element.style.left = ball.x - ballsSize / 2 + 'px';
    ball.element.style.top = ball.y + 'px';

    // Проверка столкновения с нижней гранью контейнера + принудительная остановка
    if (
      ball.y + ballRect.height >= container.clientHeight ||
      forceStopBallsMoving
    ) {
      ballStopped = true;
      ball.element.style.top = container.clientHeight - ballRect.height + 'px';
      ball.element.style.transform = 'rotate(0)';
      if (!stopPosition.isUpdated) {
        stopPosition.isUpdated = true;
        stopPosition.left = forceStopBallsMoving ? stopPosition.left : ball.x;
        stopPosition.top = container.clientHeight - ballRect.height;
        if (isBallsInWaitingContainer) {
          stoppedContainer.style.left =
            stopPosition.left + ballRect.width / 2 + 'px';
          stoppedContainer.style.top =
            container.clientHeight - ballRect.height + 'px';
          stoppedContainer.appendChild(ball.element);
        } else {
          waitingContainer.style.left =
            stopPosition.left + ballRect.width / 2 + 'px';
          waitingContainer.style.top =
            container.clientHeight - ballRect.height + 'px';
          waitingContainer.appendChild(ball.element);
        }
        ball.element.style.left = 0 - ballsSize / 2 + 'px';
        ball.element.style.top = 0;
        balls = balls.filter(
          (filteredBall) => filteredBall.element !== ball.element
        );
      } else {
        stopBallAnimation(ball);
      }
      setTimeout(() => {
        isBallsInWaitingContainer
          ? updateStoppedCounter()
          : updateWaitingCounter();
        checkAllBallsStopped();
      }, 100);
      return;
    }

    // Проверка столкновения с другими элементами
    checkCollision(ball);

    requestAnimationFrame(move);
  }

  move();
}

// Проверка столкновения с другими элементами
function checkCollision(ball) {
  const rect1 = ball.element.getBoundingClientRect();
  const elements = document.querySelectorAll('.element');

  elements.forEach((element) => {
    const rect2 = element.getBoundingClientRect();
    if (
      rect1.right > rect2.left &&
      rect1.left < rect2.right &&
      rect1.bottom > rect2.top &&
      rect1.top < rect2.bottom
    ) {
      handleCollision(ball, element);
    }
  });
}

// Обработка столкновения
function handleCollision(ball, element) {
  const ballRect = ball.element.getBoundingClientRect();

  const ballPrevX = ballRect.left + ballsSize / 2 - ball.velX;
  const ballPrevY = ballRect.top + ballsSize / 2 - ball.velY;

  if (element.classList.contains('triangle')) {
    const vertices = getTriangleVertices(
      element,
      element.getBoundingClientRect()
    );
    if (
      isPointInTriangle({ x: ballRect.left, y: ballRect.top }, vertices) ||
      isPointInTriangle({ x: ballRect.right, y: ballRect.top }, vertices) ||
      isPointInTriangle({ x: ballRect.left, y: ballRect.bottom }, vertices) ||
      isPointInTriangle({ x: ballRect.right, y: ballRect.bottom }, vertices)
    ) {
      const side = getCollisionSideTriangle(
        ballPrevX,
        ballPrevY,
        ballRect.left + ballsSize / 2,
        ballRect.top + ballsSize / 2,
        element
      );
      if (side === 'hypotenuse') {
        // Логика для гипотенузы
        [ball.velX, ball.velY] = [-ball.velY, -ball.velX]; // Поворот на 90 градусов
      } else {
        // Логика для сторон треугольника
        if (side === 'left' || side === 'right') {
          ball.velX = -ball.velX;
        } else if (side === 'top' || side === 'bottom') {
          ball.velY = -ball.velY;
        }
      }
      // Уменьшение счетчика и удаление элемента, если он достиг 0
      const counter = element.querySelector('.counter_container span');
      if (counter) {
        let stacks = parseInt(counter.innerText);
        stacks--;
        if (stacks <= 0) {
          element.remove();
        } else {
          counter.innerText = stacks;
        }
      }
    }
  } else if (element.classList.contains('box')) {
    const side = getCollisionSideBox(
      ballPrevX,
      ballPrevY,
      ballRect.left + ballsSize / 2,
      ballRect.top + ballsSize / 2,
      element
    );
    if (side === 'left' || side === 'right') {
      ball.velX = -ball.velX;
    } else if (side === 'top' || side === 'bottom') {
      ball.velY = -ball.velY;
    }
    // Уменьшение счетчика и удаление элемента, если он достиг 0
    const counter = element.querySelector('.counter_container span');
    if (counter) {
      let stacks = parseInt(counter.innerText);
      stacks--;
      if (stacks <= 0) {
        element.remove();
      } else {
        counter.innerText = stacks;
      }
    }
  } else if (element.classList.contains('add-balls-bonus')) {
    const circleElement = element.querySelector('.circle-bonus');
    const circleElementRect = circleElement.getBoundingClientRect();

    if (
      isPointInCircle(ballRect.left, ballRect.top, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      }) ||
      isPointInCircle(ballRect.left, ballRect.bottom, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      }) ||
      isPointInCircle(ballRect.right, ballRect.top, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      }) ||
      isPointInCircle(ballRect.right, ballRect.bottom, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      })
    ) {
      const extraBalls = element.dataset.extraBalls;
      extraBallsQue += +extraBalls;
      element.remove();
      isBallsInWaitingContainer
        ? updateStoppedCounter()
        : updateWaitingCounter();
    }
  } else if (element.classList.contains('laser-bonus')) {
    const circleElement = element.querySelector('.circle-bonus');
    const circleElementRect = circleElement.getBoundingClientRect();

    if (
      isPointInCircle(ballRect.left, ballRect.top, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      }) ||
      isPointInCircle(ballRect.left, ballRect.bottom, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      }) ||
      isPointInCircle(ballRect.right, ballRect.top, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      }) ||
      isPointInCircle(ballRect.right, ballRect.bottom, {
        x: circleElementRect.left + circleElementRect.width / 2,
        y: circleElementRect.top + circleElementRect.height / 2,
        r: circleElementRect.width / 2,
      })
    ) {
      if (ball.element.dataset.isThisBonusUsed === 'false') {
        const laserRect = element.getBoundingClientRect();
        ball.element.dataset.isThisBonusUsed = 'true';
        element.dataset.activated = 'true';

        // Создание контейнера лазера
        if (element.dataset.direction === 'TB') {
          createLaserContainer(
            laserRect.left -
              containerRect.left +
              elementsSize / 2 -
              (laserRect.width * 0.3) / 2,
            0,
            laserRect.width * 0.3,
            containerRect.height
          );
        } else if (element.dataset.direction === 'LR') {
          createLaserContainer(
            0,
            laserRect.top -
              containerRect.top +
              elementsSize / 2 -
              (laserRect.height * 0.3) / 2,
            containerRect.width,
            laserRect.height * 0.3
          );
        }
      }
    } else {
      ball.element.dataset.isThisBonusUsed = 'false';
    }
  }
}

// Определение стороны столкновения c box
function getCollisionSideBox(prevX, prevY, x, y, element) {
  const rect = element.getBoundingClientRect();

  const left = { x1: rect.left, y1: rect.top, x2: rect.left, y2: rect.bottom };
  const right = {
    x1: rect.right,
    y1: rect.top,
    x2: rect.right,
    y2: rect.bottom,
  };
  const top = { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top };
  const bottom = {
    x1: rect.left,
    y1: rect.bottom,
    x2: rect.right,
    y2: rect.bottom,
  };

  const distanceToLeft = intersectsRay(
    prevX + ballsSize / 2,
    prevY,
    x + ballsSize / 2,
    y,
    left
  );
  const distanceToRight = intersectsRay(
    prevX - ballsSize / 2,
    prevY,
    x - ballsSize / 2,
    y,
    right
  );
  const distanceToTop = intersectsRay(
    prevX,
    prevY + ballsSize / 2,
    x,
    y + ballsSize / 2,
    top
  );
  const distanceToBottom = intersectsRay(
    prevX,
    prevY - ballsSize / 2,
    x,
    y - ballsSize / 2,
    bottom
  );

  const minDistance = Math.min(
    distanceToLeft,
    distanceToRight,
    distanceToTop,
    distanceToBottom
  );

  switch (minDistance) {
    case distanceToLeft:
      return 'left';

    case distanceToRight:
      return 'right';

    case distanceToTop:
      return 'top';

    case distanceToBottom:
      return 'bottom';

    default:
      return null;
  }
}

// Определение стороны столкновения c triangle
function getCollisionSideTriangle(prevX, prevY, x, y, element) {
  const rect = element.getBoundingClientRect();
  const mainAngle = element.getAttribute('data-main-angle');

  const left = { x1: rect.left, y1: rect.top, x2: rect.left, y2: rect.bottom };
  const right = {
    x1: rect.right,
    y1: rect.top,
    x2: rect.right,
    y2: rect.bottom,
  };
  const top = { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top };
  const bottom = {
    x1: rect.left,
    y1: rect.bottom,
    x2: rect.right,
    y2: rect.bottom,
  };

  let minDistance;

  const distanceToLeft = intersectsRay(
    prevX + ballsSize / 2,
    prevY,
    x + ballsSize / 2,
    y,
    left
  );
  const distanceToRight = intersectsRay(
    prevX - ballsSize / 2,
    prevY,
    x - ballsSize / 2,
    y,
    right
  );
  const distanceToTop = intersectsRay(
    prevX,
    prevY + ballsSize / 2,
    x,
    y + ballsSize / 2,
    top
  );
  const distanceToBottom = intersectsRay(
    prevX,
    prevY - ballsSize / 2,
    x,
    y - ballsSize / 2,
    bottom
  );
  let distanceToHypotenuse;
  // Проверка для гипотенузы треугольника
  let hypotenuse;
  if (mainAngle === 'RB') {
    hypotenuse = {
      x1: rect.left,
      y1: rect.bottom,
      x2: rect.right,
      y2: rect.top,
    };
    distanceToHypotenuse = intersectsRay(
      prevX + ballsSize / 2,
      prevY + ballsSize / 2,
      x + ballsSize / 2,
      y + ballsSize / 2,
      hypotenuse
    );
    minDistance = Math.min(
      distanceToRight,
      distanceToBottom,
      distanceToHypotenuse
    );
  } else if (mainAngle === 'LB') {
    hypotenuse = {
      x1: rect.right,
      y1: rect.bottom,
      x2: rect.left,
      y2: rect.top,
    };
    distanceToHypotenuse = intersectsRay(
      prevX - ballsSize / 2,
      prevY + ballsSize / 2,
      x - ballsSize / 2,
      y + ballsSize / 2,
      hypotenuse
    );
    minDistance = Math.min(
      distanceToLeft,
      distanceToBottom,
      distanceToHypotenuse
    );
  } else if (mainAngle === 'RT') {
    hypotenuse = {
      x1: rect.left,
      y1: rect.top,
      x2: rect.right,
      y2: rect.bottom,
    };
    distanceToHypotenuse = intersectsRay(
      prevX + ballsSize / 2,
      prevY - ballsSize / 2,
      x + ballsSize / 2,
      y - ballsSize / 2,
      hypotenuse
    );
    minDistance = Math.min(
      distanceToRight,
      distanceToTop,
      distanceToHypotenuse
    );
  } else if (mainAngle === 'LT') {
    hypotenuse = {
      x1: rect.right,
      y1: rect.top,
      x2: rect.left,
      y2: rect.bottom,
    };
    distanceToHypotenuse = intersectsRay(
      prevX - ballsSize / 2,
      prevY - ballsSize / 2,
      x - ballsSize / 2,
      y - ballsSize / 2,
      hypotenuse
    );
    minDistance = Math.min(distanceToLeft, distanceToTop, distanceToHypotenuse);
  }

  switch (minDistance) {
    case distanceToLeft:
      return 'left';

    case distanceToRight:
      return 'right';

    case distanceToTop:
      return 'top';

    case distanceToBottom:
      return 'bottom';

    case distanceToHypotenuse:
      return 'hypotenuse';

    default:
      return null;
  }
}

// Проверка пересечения линий
function intersectsRay(x1, y1, x2, y2, line) {
  const dx1 = x2 - x1;
  const dy1 = y2 - y1;
  const dx2 = line.x2 - line.x1;
  const dy2 = line.y2 - line.y1;

  const det = dx1 * dy2 - dx2 * dy1;

  if (det === 0) return 10000; // Линии параллельны

  const t1 = -((line.y1 - y1) * dx2 - (line.x1 - x1) * dy2) / det;

  if (t1 < 0) return 10000; // Луч пересекается с линией в обратном направлении

  const intersectionX = x1 + t1 * dx1;
  const intersectionY = y1 + t1 * dy1;
  const distance = Math.sqrt(
    Math.pow(intersectionX - x2, 2) + Math.pow(intersectionY - y2, 2)
  );

  return distance;
}

function createLaserContainer(x, y, width, height) {
  const laserContainer = document.createElement('div');
  laserContainer.className = 'laser-container';
  laserContainer.style.left = x + 'px';
  laserContainer.style.top = y + 'px';
  laserContainer.style.width = width + 'px';
  laserContainer.style.height = height + 'px';
  container.appendChild(laserContainer);

  checkIntersections(laserContainer.getBoundingClientRect());

  setTimeout(() => {
    laserContainer.remove();
  }, 100);
}

// Проверка пересечения лазера с элементами
function checkIntersections(laserRect) {
  const elements = document.querySelectorAll('.box, .triangle');
  elements.forEach((element) => {
    const elementRect = element.getBoundingClientRect();
    if (
      laserRect.left < elementRect.right &&
      laserRect.right > elementRect.left &&
      laserRect.top < elementRect.bottom &&
      laserRect.bottom > elementRect.top
    ) {
      decreaseStacks(element);
    }
  });
}

// Снятие стаков с элемента
function decreaseStacks(element) {
  let stacks = parseInt(element.getAttribute('data-stacks'), 10);
  if (stacks > 1) {
    element.setAttribute('data-stacks', stacks - 1);
    element.querySelector('span').innerText = stacks - 1;
  } else {
    element.remove();
  }
}

function checkAllBallsStopped() {
  if (
    balls.length === 0 &&
    waitingBalls.every((ball) =>
      ball.element.parentNode === isBallsInWaitingContainer
        ? stoppedContainer
        : waitingContainer
    )
  ) {
    const usedBonuses = document.querySelectorAll(
      '.bonus-box[data-activated="true"]'
    );
    usedBonuses.forEach((laser) => {
      laser.remove();
    });
    stopPosition.isUpdated = false;
    isAnimating = false;
    isBallsInWaitingContainer = !isBallsInWaitingContainer;
    forceStopBallsMoving = false;
    if (extraBallsQue !== 0) {
      for (let i = 0; i < extraBallsQue; i++) {
        createBall();
      }
      extraBallsQue = 0;
      !isBallsInWaitingContainer
        ? updateStoppedCounter()
        : updateWaitingCounter();
    }
    if (temporaryExtraBalls !== 0) {
      for (let i = 0; i < temporaryExtraBalls; i++) {
        waitingBalls[0].element.remove();
        waitingBalls.shift();
      }
      temporaryExtraBalls = 0;
      !isBallsInWaitingContainer
        ? updateStoppedCounter()
        : updateWaitingCounter();
    }
    addNewLineClassicMode(10, elementsStacks++);
    noActiveGameZonePanel.style.display = 'flex';
    stopButton.style.display = 'none';
    bonusPanel.style.display = 'flex';
    scrollPanel.style.display = 'none';
    rewriteLineNumbers();
    checkIslastStepToWin();
    checkGameOver();
  }
}

// Проверка номера нижней линии и пересчет линий для дальшейшего определения поражения
function getLastLineNumber() {
  const elements = Array.from(document.querySelectorAll('.element:not(.bonus-box)'));
  const sortedArrayByLineNumber = elements.sort((element1, element2) => parseInt(element1.dataset.line) - parseInt(element2.dataset.line));
  const minLineNumber = parseInt(sortedArrayByLineNumber[0].dataset.line);

  return minLineNumber -1;
}

function getFirstLineNumber() {
  const elements = Array.from(document.querySelectorAll('.element:not(.bonus-box)'));
  const sortedArrayByLineNumber = elements.sort((element1, element2) => parseInt(element2.dataset.line) - parseInt(element1.dataset.line));
  const maxLineNumber = parseInt(sortedArrayByLineNumber[0].dataset.line);

  return maxLineNumber;
}

function rewriteLineNumbers() {
  const lastLineNumber = getLastLineNumber();

  if (lastLineNumber === 0) return;

  const elements = document.querySelectorAll('.element');

  currentNewLineNumber--;
  elements.forEach(element => element.dataset.line -= lastLineNumber)
}

function checkIslastStepToWin() {
  const firstLineNumber = getFirstLineNumber();

  if (firstLineNumber === maxLineNumber) {
    warningZone.style.display = 'flex';
  } else {
    warningZone.style.display = 'none';
  }
}

// Проверка конца игры
function checkGameOver() {
  if (getFirstLineNumber() > maxLineNumber) {
    isGameOver = true;
  }
}

function startBalls(velX, velY) {
  if (isAnimating) return;
  isAnimating = true;
  let delay = 0;
  const startedPosition = {
    left: stopPosition.left,
    top: stopPosition.top,
  };
  stopButton.style.display = 'block';
  noActiveGameZonePanel.style.display = 'none';
  waitingBalls.forEach((ball, index) => {
    setTimeout(() => {
      ball.velX = velX;
      ball.velY = velY;
      if (isBallsInWaitingContainer) {
        waitingContainer.removeChild(ball.element);
      } else {
        stoppedContainer.removeChild(ball.element);
      }
      container.appendChild(ball.element);
      ball.element.style.left = stopPosition.left + 'px';
      ball.element.style.top = stopPosition.top + 'px';
      balls.push(ball);
      moveBall(ball, startedPosition);
      isBallsInWaitingContainer
        ? updateWaitingCounter()
        : updateStoppedCounter();
    }, delay);
    delay += 100;
  });
}

function stopAnimation() {
  if (!isAnimating) return;
  forceStopBallsMoving = true;
}

function stopBallAnimation(ball) {
  if (!ball.element.classList.contains('moving')) {
    ball.element.classList.add('moving');
    ball.element.style.left = stopPosition.left - ballsSize / 2 + 'px';
    ball.element.style.top = stopPosition.top + 'px';
    setTimeout(() => {
      if (isBallsInWaitingContainer) {
        stoppedContainer.appendChild(ball.element);
      } else {
        waitingContainer.appendChild(ball.element);
      }
      ball.element.classList.remove('moving');
      ball.element.style.transform = '';
      ball.element.style.left = 0 - ballsSize / 2 + 'px';
      ball.element.style.top = 0;
      balls = balls.filter(
        (filteredBall) => filteredBall.element !== ball.element
      );
    }, 100);
  }
}

// Функция для проверки, находится ли точка внутри треугольника
function isPointInTriangle(pt, v) {
  const areaOrig = Math.abs(
    (v[0].x * (v[1].y - v[2].y) +
      v[1].x * (v[2].y - v[0].y) +
      v[2].x * (v[0].y - v[1].y)) /
      2.0
  );
  const area1 = Math.abs(
    (pt.x * (v[1].y - v[2].y) +
      v[1].x * (v[2].y - pt.y) +
      v[2].x * (pt.y - v[1].y)) /
      2.0
  );
  const area2 = Math.abs(
    (v[0].x * (pt.y - v[2].y) +
      pt.x * (v[2].y - v[0].y) +
      v[2].x * (v[0].y - pt.y)) /
      2.0
  );
  const area3 = Math.abs(
    (v[0].x * (v[1].y - pt.y) +
      v[1].x * (pt.y - v[0].y) +
      pt.x * (v[0].y - v[1].y)) /
      2.0
  );
  return area1 + area2 + area3 === areaOrig;
}

// Функция для проверки, находится ли точка внутри круга
function isPointInCircle(x, y, circle) {
  const dx = x - circle.x;
  const dy = y - circle.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSquared = circle.r * circle.r;

  return distanceSquared <= radiusSquared;
}

function getTriangleVertices(triangle, rect) {
  let vertices;

  const triangleType = triangle.dataset.mainAngle;

  switch (triangleType) {
    case 'RT':
      vertices = [
        { x: rect.left, y: rect.top },
        { x: rect.right, y: rect.top },
        { x: rect.right, y: rect.bottom },
      ];
      break;
    case 'LB':
      vertices = [
        { x: rect.left, y: rect.top },
        { x: rect.left, y: rect.bottom },
        { x: rect.right, y: rect.bottom },
      ];
      break;
    case 'RB':
      vertices = [
        { x: rect.right, y: rect.top },
        { x: rect.right, y: rect.bottom },
        { x: rect.left, y: rect.bottom },
      ];
      break;
    case 'LT':
      vertices = [
        { x: rect.left, y: rect.bottom },
        { x: rect.left, y: rect.top },
        { x: rect.right, y: rect.top },
      ];
      break;
  }

  return vertices;
}

container.addEventListener('mouseup', mouseUpHandler);
function mouseUpHandler(event) {
  if (isGameOver) return;

  // Позиция мыши в момент отпускания кнопки
  const releaseX = event.clientX - container.getBoundingClientRect().left;
  const releaseY = event.clientY - container.getBoundingClientRect().top;

  // Вычисление направления движения
  const deltaX = releaseX - stopPosition.left - ballsSize / 2;
  const deltaY = releaseY - stopPosition.top;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Задание скорости и направления
  velX = (deltaX / distance) * ballSpead; // Коэффициент скорости
  velY = (deltaY / distance) * ballSpead;

  // Запуск анимации
  startBalls(velX, velY);

  // Удаление траектории
  clearTrajectory();
}

function startDrawingTrajectory(event) {
  if (isAnimating || isGameOver) return;
  clearTrajectory();
  const { clientX, clientY } = event;
  const startX = stopPosition.left + ballsSize / 2;
  const startY = stopPosition.top + ballsSize / 2;
  const endX = clientX - container.getBoundingClientRect().left + ballsSize / 2;
  const endY = clientY - container.getBoundingClientRect().top + ballsSize / 2;
  drawTrajectory(startX, startY, endX, endY);
}

function updateTrajectory(event) {
  if (!trajectoryElement) return;
  const { clientX, clientY } = event;
  const startX = stopPosition.left + ballsSize / 2;
  const startY = stopPosition.top + ballsSize / 2;
  const endX = clientX - container.getBoundingClientRect().left + ballsSize / 2;
  const endY = clientY - container.getBoundingClientRect().top + ballsSize / 2;
  drawTrajectory(startX, startY, endX, endY);
}

function drawTrajectory(startX, startY, endX, endY) {
  clearTrajectory();

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  let velX = (deltaX / distance) * 8;
  let velY = (deltaY / distance) * 8;

  trajectoryElement = document.createElement('div');
  trajectoryElement.classList.add('trajectory');

  let currentX = startX;
  let currentY = startY;
  let currentDistance = 0;

  while (currentDistance < maxTrajectoryLength) {
    currentX += velX;
    currentY += velY;
    currentDistance += Math.sqrt(
      (currentX - startX) ** 2 + (currentY - startY) ** 2
    );

    if (currentX <= 0 || currentX >= container.clientWidth) {
      velX *= -1;
      currentX = Math.min(Math.max(currentX, 0), container.clientWidth);
    }

    if (currentY <= 0 || currentY >= container.clientHeight) {
      velY *= -1;
      currentY = Math.min(Math.max(currentY, 0), container.clientHeight);
    }

    const segment = createTrajectorySegment(startX, startY, currentX, currentY);
    trajectoryElement.appendChild(segment);
    startX = currentX;
    startY = currentY;
  }

  container.appendChild(trajectoryElement);
}

function createTrajectorySegment(x1, y1, x2, y2) {
  const segment = document.createElement('div');
  segment.classList.add('trajectory-segment');

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  segment.style.width = `${length / 2}px`;
  segment.style.left = 0 - length / 2 + 'px';
  segment.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;

  return segment;
}

function clearTrajectory() {
  if (trajectoryElement) {
    trajectoryElement.remove();
    trajectoryElement = null;
  }
}

// Расходуемые бонусные эффекты

// Раскол, функция, снижающая прочность всех блоков на 33%
function crackBlocks() {
  const crackBlocksButtonCounter = document.getElementById(
    'bonuses_panel-crack_blocks-counter'
  );
  let stacks = crackBlocksButtonCounter.dataset.stacks;
  if (stacks === '0') {
    return;
  }
  stacks--;
  crackBlocksButtonCounter.dataset.stacks = stacks;
  crackBlocksButtonCounter.innerText = `x${stacks}`;
  const elements = document.querySelectorAll('.element');

  elements.forEach((element) => {
    // Уменьшение счетчика и удаление элемента, если он достиг 0
    const counter = element.querySelector('.counter_container span');
    if (counter) {
      let stacks = parseInt(counter.innerText);
      stacks = Math.floor(stacks * 0.66);
      if (stacks <= 0) {
        element.remove();
      } else {
        counter.innerText = stacks;
      }
    }
  });
}

const crackBlocksButton = document.getElementById('bonuses_panel-crack_blocks');
crackBlocksButton.addEventListener('click', crackBlocks);

// Удвоение количества шаров на 1 ход
function extraBallsForRaund() {
  const extraBallsButtonCounter = document.getElementById(
    'bonuses_panel-extra_balls-counter'
  );
  let stacks = extraBallsButtonCounter.dataset.stacks;
  if (stacks === '0') {
    return;
  }
  stacks--;
  extraBallsButtonCounter.dataset.stacks = stacks;
  extraBallsButtonCounter.innerText = `x${stacks}`;

  temporaryExtraBalls += waitingBalls.length;
  const cikleLength = waitingBalls.length;

  for (let i = 0; i < cikleLength; i++) {
    createBall();
  }
}

const extraBallsButton = document.getElementById('bonuses_panel-extra_balls');
extraBallsButton.addEventListener('click', extraBallsForRaund);

// Удаление нижней линии
function destroyFirstLine() {
  const destroyLineButtonCounter = document.getElementById(
    'bonuses_panel-destroy_line-counter'
  );
  let stacks = destroyLineButtonCounter.dataset.stacks;
  if (stacks === '0') {
    return;
  }
  stacks--;
  destroyLineButtonCounter.dataset.stacks = stacks;
  destroyLineButtonCounter.innerText = `x${stacks}`;

  temporaryExtraBalls += waitingBalls.length;
  const cikleLength = waitingBalls.length;

  for (let i = 0; i < cikleLength; i++) {
    createBall();
  }
}

const destroyLineButton = document.getElementById('bonuses_panel-destroy_line-counter');
destroyLineButton.addEventListener('click', destroyFirstLine);
