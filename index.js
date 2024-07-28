const container = document.getElementById('container');
const waitingContainer = document.getElementById('waiting-container');
const waitingCounter = document.getElementById('waiting-counter');
const stoppedContainer = document.getElementById('stopped-container');
const stoppedCounter = document.getElementById('stopped-counter');
const stopButton = document.getElementById('stop-button');

const ballsSize = 10;
let balls = [];
let waitingBalls = [];
let stopPosition = { left: container.offsetWidth/2 - ballsSize/2, top: container.clientHeight - ballsSize, isUpdated: false};
let isAnimating = false;
let isBallsInWaitingContainer = true;
let forceStopBallsMoving = false;

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
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
      [
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
        ,
        { type: 'triangle', mainAngle: 'LB', stacks: 5 },
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
        // { type: 'addBalls', bonus: 1},
        // { type: 'addBalls', bonus: 3},
        ,
        ,
        ,
        ,
        ,
        ,
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
      [
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'box', stacks: 7 },
        ,
        ,
        { type: 'box', stacks: 7 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
      ],
    ],
  },
];

// Выбираем нужный уровень
const levelConfig = levels[1];

// Создаем 10 шаров
for (let i = 0; i < 10; i++) {
  createBall();
}

// Генерация уровня
function generateLevel(config) {
  const elementSize = 50; // Размер элемента

  config.rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell) {
        const x = cellIndex * elementSize;
        const y = rowIndex * elementSize;
        switch (cell.type) {
          case 'box':
            createBox(x, y, cell.stacks);
            break;
          case 'triangle':
            createTriangle(x, y, cell.mainAngle, cell.stacks);
            break;
          case 'addBalls':
            createBonusBallsElement(x, y, cell.bonus);
            break;
        }
      }
    });
  });
}

function createCounter(stacks) {
  const counterContainer = document.createElement('div');
  counterContainer.className = 'counter_container';
  counterContainer.style.width = '50px';
  counterContainer.style.height = '50px';
  const stacksCounter = document.createElement('span');
  stacksCounter.innerText = stacks;
  counterContainer.appendChild(stacksCounter);
  return counterContainer;
}

// Создание коробки
function createBox(x, y, stacks) {
  const box = document.createElement('div');
  box.setAttribute('data-stacks', stacks);
  box.className = 'element box';
  box.style.left = x + 'px';
  box.style.top = y + 'px';
  box.appendChild(createCounter(stacks));
  container.appendChild(box);
}

// Создание треугольника
function createTriangle(x, y, mainAngle, stacks) {
  const triangle = document.createElement('div');
  triangle.className = `element triangle triangle-${mainAngle}`;
  triangle.setAttribute('data-main-angle', mainAngle);
  triangle.setAttribute('data-stacks', stacks);

  switch (mainAngle) {
    case 'RB':
      triangle.style.borderLeft = '50px solid transparent';
      triangle.style.borderBottom = '50px solid blue';
      break;
    case 'LB':
      triangle.style.borderRight = '50px solid transparent';
      triangle.style.borderBottom = '50px solid blue';
      break;
    case 'RT':
      triangle.style.borderLeft = '50px solid transparent';
      triangle.style.borderTop = '50px solid blue';
      break;
    case 'LT':
      triangle.style.borderRight = '50px solid transparent';
      triangle.style.borderTop = '50px solid blue';
      break;
  }

  triangle.style.left = x + 'px';
  triangle.style.top = y + 'px';
  triangle.appendChild(createCounter(stacks));
  container.appendChild(triangle);
}

function createBonusBallsElement(x, y, bonus) {
  const box = document.createElement('div');
  box.className = 'element bonus-box';
  box.style.left = x + 'px';
  box.style.top = y + 'px';
  const bonusBallsElement = document.createElement('div');
  bonusBallsElement.className = 'circle-bonus bonus-balls-circle';
  const bonusTitle = document.createElement('span');
  bonusTitle.innerText = `+${bonus}`;
  bonusBallsElement.appendChild(bonusTitle);
  box.appendChild(bonusBallsElement);
  container.appendChild(box);
}

// Создание мяча и добавление его в массив мячей
function createBall() {
  let ball = document.createElement('div');
  ball.className = 'ball';
  const ballElement = {
    element: ball,
    x: stopPosition.left,
    y: stopPosition.top,
    velX: 0,
    velY: 0,
  }
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
}

function updateStoppedCounter() {
  const counterValue = stoppedContainer.getElementsByClassName('ball').length;
  stoppedCounter.innerText = counterValue === 0 ? '' : `x${counterValue}`;
}

function moveBall(ball) {
  let ballStopped = false;
  
  // Объявление начальной позиции мяча
  ball.x = stopPosition.left;
  ball.y = stopPosition.top;


  function move() {
    if (ballStopped) return;
    
    const ballRect = ball.element.getBoundingClientRect();
    
    ball.x += ball.velX;
    ball.y += ball.velY;
    
    // Проверка столкновения с контейнером
    if (ball.x <= 0 || ball.x + ballRect.width >= container.clientWidth) {
      ball.x -= ball.velX; // Шаг назад
      ball.velX = -ball.velX;
    }

    if (ball.y <= 0) {
      ball.y -= ball.velY; // Шаг назад
      ball.velY = -ball.velY;
    }

    ball.element.style.left = ball.x + 'px';
    ball.element.style.top = ball.y + 'px';

    // Проверка столкновения с нижней гранью контейнера + принудительная остановка
    if (ball.y + ballRect.height >= container.clientHeight || forceStopBallsMoving) {
      ballStopped = true;
      ball.element.style.top = container.clientHeight - ballRect.height + 'px';
      if (!stopPosition.isUpdated) {
        stopPosition.isUpdated = true;
        stopPosition.left = forceStopBallsMoving ? stopPosition.left : ball.x;
        stopPosition.top = container.clientHeight - ballRect.height;
        if (isBallsInWaitingContainer) {
          stoppedContainer.style.left = stopPosition.left + ballRect.width/2 + 'px';
          stoppedContainer.style.top = container.clientHeight - ballRect.height + 'px';
          stoppedContainer.appendChild(ball.element);
        } else {
          waitingContainer.style.left = stopPosition.left + ballRect.width/2 + 'px';
          waitingContainer.style.top = container.clientHeight - ballRect.height + 'px';
          waitingContainer.appendChild(ball.element);
        }
        ball.element.style.left = 0;
        ball.element.style.top = 0;
        balls = balls.filter(filteredBall => filteredBall.element !== ball.element);
      } else {
        stopBallAnimation(ball);
      }
      setTimeout(() => {
        isBallsInWaitingContainer ? updateStoppedCounter() : updateWaitingCounter();
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

  const centerX = rect1.left+ballsSize/2;
  const centerY = rect1.top+ballsSize/2;

  elements.forEach(element => {
      const rect2 = element.getBoundingClientRect();
      if (centerX > rect2.left && centerX < rect2.right && centerY> rect2.top && centerY < rect2.bottom) {
          handleCollision(ball, element);
      }
  });
}

// Обработка столкновения
function handleCollision(ball, element) {
  const ballRect = ball.element.getBoundingClientRect();

  const ballPrevX = ballRect.left+ballsSize/2 - ball.velX;
  const ballPrevY = ballRect.top+ballsSize/2 - ball.velY;

  if (element.classList.contains('triangle')) {
      const vertices = getTriangleVertices(element, element.getBoundingClientRect());
      if (isPointInTriangle({ x: ballRect.left+ballsSize/2, y: ballRect.top+ballsSize/2 }, vertices)) {
        const side = getCollisionSideTriangle(ballPrevX, ballPrevY, ballRect.left+ballsSize/2, ballRect.top+ballsSize/2, element);
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
      const side = getCollisionSideBox(ballPrevX, ballPrevY, ballRect.left+ballsSize/2, ballRect.top+ballsSize/2, element);
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
  }
}

// Определение стороны столкновения c box
function getCollisionSideBox(prevX, prevY, x, y, element) {
  const rect = element.getBoundingClientRect();

  const left = { x1: rect.left, y1: rect.top, x2: rect.left, y2: rect.bottom };
  const right = { x1: rect.right, y1: rect.top, x2: rect.right, y2: rect.bottom };
  const top = { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top };
  const bottom = { x1: rect.left, y1: rect.bottom, x2: rect.right, y2: rect.bottom };
  
  const distanceToLeft = intersectsRay(prevX, prevY, x, y, left);
  const distanceToRight = intersectsRay(prevX, prevY, x, y, right);
  const distanceToTop = intersectsRay(prevX, prevY, x, y, top);
  const distanceToBottom = intersectsRay(prevX, prevY, x, y, bottom)

  const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

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
  const right = { x1: rect.right, y1: rect.top, x2: rect.right, y2: rect.bottom };
  const top = { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top };
  const bottom = { x1: rect.left, y1: rect.bottom, x2: rect.right, y2: rect.bottom };
  
  let minDistance;
  
  const distanceToLeft = intersectsRay(prevX, prevY, x, y, left);
  const distanceToRight = intersectsRay(prevX, prevY, x, y, right);
  const distanceToTop = intersectsRay(prevX, prevY, x, y, top);
  const distanceToBottom = intersectsRay(prevX, prevY, x, y, bottom);
  let distanceToHypotenuse;
  // Проверка для гипотенузы треугольника
  let hypotenuse;
  if (mainAngle === 'RB') {
      hypotenuse = { x1: rect.left, y1: rect.bottom, x2: rect.right, y2: rect.top };
      distanceToHypotenuse = intersectsRay(prevX, prevY, x, y, hypotenuse);
      minDistance = Math.min(distanceToRight, distanceToBottom, distanceToHypotenuse);
  } else if (mainAngle === 'LB') {
      hypotenuse = { x1: rect.right, y1: rect.bottom, x2: rect.left, y2: rect.top };
      distanceToHypotenuse = intersectsRay(prevX, prevY, x, y, hypotenuse);
      minDistance = Math.min(distanceToLeft, distanceToBottom, distanceToHypotenuse);
  } else if (mainAngle === 'RT') {
      hypotenuse = { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.bottom };
      distanceToHypotenuse = intersectsRay(prevX, prevY, x, y, hypotenuse);
      minDistance = Math.min(distanceToRight, distanceToTop, distanceToHypotenuse);
  } else if (mainAngle === 'LT') {
      hypotenuse = { x1: rect.right, y1: rect.top, x2: rect.left, y2: rect.bottom };
      distanceToHypotenuse = intersectsRay(prevX, prevY, x, y, hypotenuse);
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
  const distance = Math.sqrt(Math.pow(intersectionX - x1, 2) + Math.pow(intersectionY - y1, 2));

  return distance;
}

function checkAllBallsStopped() {
  if (balls.length === 0 && waitingBalls.every(ball => ball.element.parentNode === isBallsInWaitingContainer ? stoppedContainer : waitingContainer)) {
    stopPosition.isUpdated = false;
    isAnimating = false;
    isBallsInWaitingContainer = !isBallsInWaitingContainer;
    forceStopBallsMoving = false;
  }
}

function startBalls(velX, velY) {
  if (isAnimating) return;
  isAnimating = true;
  let delay = 0;
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
      moveBall(ball);
      isBallsInWaitingContainer ? updateWaitingCounter() : updateStoppedCounter();
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
      ball.element.style.left = stopPosition.left + 'px';
      ball.element.style.top = stopPosition.top + 'px';
      setTimeout(() => {
        if (isBallsInWaitingContainer) {
          stoppedContainer.appendChild(ball.element);
        } else {
          waitingContainer.appendChild(ball.element);
        }
        ball.element.classList.remove('moving');
        ball.element.style.transform = '';
        ball.element.style.left = 0;
        ball.element.style.top = 0;
        balls = balls.filter(filteredBall => filteredBall.element !== ball.element);
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

function pointToLineDistance(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = dot / len_sq;

  let xx, yy;

  if (param < 0 || (x1 === x2 && y1 === y2)) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPreviousPosition(rect, velX, velY) {
  return {
    left: rect.left - velX * 3,
    right: rect.right - velX * 3,
    top: rect.top - velY * 3,
    bottom: rect.bottom - velY * 3,
  };
}

function checkCollisionWithTriangle(rect, vertices, velX, velY) {
  // Вычисление центра текущей позиции
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;

  if (isPointInTriangle({ x: centerX, y: centerY }, vertices)) {
    // Получение предыдущей позиции
    const prevRect = getPreviousPosition(rect, velX, velY);

    // Вычисление центра предыдущей позиции
    const prevCenterX = (prevRect.left + prevRect.right) / 2;
    const prevCenterY = (prevRect.top + prevRect.bottom) / 2;

    const distToLeft = Math.abs(centerX - vertices[0].x);
    const distToRight = Math.abs(centerX - vertices[2].x);
    const distToTop = Math.abs(centerY - vertices[0].y);
    const distToBottom = Math.abs(centerY - vertices[2].y);

    const hypotenuse = {
      x1: vertices[0].x,
      y1: vertices[0].y,
      x2: vertices[2].x,
      y2: vertices[2].y,
    };

    const distToHypotenuse = pointToLineDistance(
      prevCenterX,
      prevCenterY,
      hypotenuse.x1,
      hypotenuse.y1,
      hypotenuse.x2,
      hypotenuse.y2
    );

    console.log(`
    distToLeft - ${distToLeft},
    distToRight - ${distToRight},
    distToTop - ${distToTop},
    distToBottom - ${distToBottom},
    distToHypotenuse - ${distToHypotenuse},
    velX - ${velX},
    velY - ${velY},
    rect pos x/y - ${centerX}/${centerY}
    rect prev pos x/y - ${prevCenterX}/${prevCenterY}
    `);

    const minDist = Math.min(
      distToLeft,
      distToRight,
      distToTop,
      distToBottom,
      distToHypotenuse
    );

    if (minDist === distToHypotenuse) return 'hypotenuse';
    if (minDist === distToLeft) return 'left';
    if (minDist === distToRight) return 'right';
    if (minDist === distToTop) return 'top';
    if (minDist === distToBottom) return 'bottom';
  }
  return null;
}

// Функция для обновления позиции
// function updatePosition() {
//   if (!isAnimating) return;

//   posX += velX;
//   posY += velY;

//   // Проверка столкновения с границами контейнера
//   if (posX <= 0 || posX + ball.offsetWidth >= container.clientWidth) {
//     posX -= velX; // Шаг назад
//     velX = -velX;
//   }
//   if (posY <= 0 || posY + ball.offsetHeight >= container.clientHeight) {
//     posY -= velY; // Шаг назад
//     velY = -velY;
//   }

//   // Проверка столкновения с другим элементом
//   const ballRect = ball.getBoundingClientRect();

//   const elements = document.querySelectorAll('.element');

//   elements.forEach((element) => {
//     if (element !== ball) {
//       const rect2 = element.getBoundingClientRect();

//       if (
//         !(
//           ballRect.right < rect2.left ||
//           ballRect.left > rect2.right ||
//           ballRect.bottom < rect2.top ||
//           ballRect.top > rect2.bottom
//         )
//       ) {
//         if (element.classList.contains('box')) {
//           // Collision detected
//           let stacks = parseInt(element.getAttribute('data-stacks'));
//           stacks -= 1;
//           if (stacks <= 0) {
//             element.remove();
//           } else {
//             element.setAttribute('data-stacks', stacks);
//             element.querySelector('.counter_container span').innerText = stacks;
//           }

//           const overlapLeft = ballRect.right - rect2.left;
//           const overlapRight = rect2.right - ballRect.left;
//           const overlapTop = ballRect.bottom - rect2.top;
//           const overlapBottom = rect2.bottom - ballRect.top;

//           const minOverlap = Math.min(
//             overlapLeft,
//             overlapRight,
//             overlapTop,
//             overlapBottom
//           );

//           // Шаг назад перед изменением направления
//           if (minOverlap === overlapLeft || minOverlap === overlapRight) {
//             posX -= velX * 3;
//             velX = -velX;
//           }
//           if (minOverlap === overlapTop || minOverlap === overlapBottom) {
//             posY -= velY * 3;
//             velY = -velY;
//           }
//         } else if (element.classList.contains('triangle')) {
//           const vertices = getTriangleVertices(element, rect2);
//           const collisionSide = checkCollisionWithTriangle(
//             ballRect,
//             vertices,
//             velX,
//             velY
//           );
//           if (collisionSide) {
//             // Collision detected
//             let stacks = parseInt(element.getAttribute('data-stacks'));
//             stacks -= 1;
//             if (stacks <= 0) {
//               element.remove();
//             } else {
//               element.setAttribute('data-stacks', stacks);
//               element.querySelector('.counter_container span').innerText =
//                 stacks;
//             }
//           }

//           if (collisionSide === 'left' || collisionSide === 'right') {
//             posX -= velX * 3; // Шаг назад
//             velX = -velX;
//           } else if (collisionSide === 'top' || collisionSide === 'bottom') {
//             posY -= velY * 3; // Шаг назад
//             velY = -velY;
//           } else if (collisionSide === 'hypotenuse') {
//             const newVelX = -velY;
//             const newVelY = -velX;

//             if (collisionSide === 'hypotenuse') {
//               posX -= velX * 3;
//               posY -= velY * 3;

//               velX = newVelX;
//               velY = newVelY;
//             }
//           }
//         }
//       }
//     }
//   });
// }

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

// Обработчик события mouseup для запуска анимации
container.addEventListener('mouseup', function (event) {
  if (isAnimating) return;

  // Позиция мыши в момент отпускания кнопки
  const mouseX = event.clientX - container.getBoundingClientRect().left;
  const mouseY = event.clientY - container.getBoundingClientRect().top;

  // Вычисление направления движения
  const deltaX = mouseX - stopPosition.left;
  const deltaY = mouseY - stopPosition.top;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Задание скорости и направления
  velX = (deltaX / distance) * 4; // Коэффициент скорости
  velY = (deltaY / distance) * 4;

  // Запуск анимации
  startBalls(velX, velY);
});

generateLevel(levelConfig);
stopButton.addEventListener('click', stopAnimation);
