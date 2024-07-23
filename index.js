const container = document.getElementById('container');
const waitingContainer = document.getElementById('waiting-container');
const waitingCounter = document.getElementById('waiting-counter');
const stoppedContainer = document.getElementById('stopped-container');
const stoppedCounter = document.getElementById('stopped-counter');
const stopButton = document.getElementById('stop-button');

const ballsSize = 10;
let balls = [];
let waitingBalls = [];
let stopPosition = { left: container.clientWidth/2 + ballsSize/2, top: container.clientHeight - ballsSize, isUpdated: false};
let animationRunning = false;
let isBallsInWaitingContainer = true;
let forceStopBallsMoving = false;

const containerRect = container.getBoundingClientRect();

// Стартовая позиция точки запуска
let launchX = container.offsetWidth/2 - ballsSize/2;
let launchY = container.offsetHeight - ballsSize;

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
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
        { type: 'triangle', mainAngle: 'RB', stacks: 5 },
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

function createBall() {
  let ball = document.createElement('div');
  ball.className = 'ball';
  ball.style.backgroundColor = 'red';
  waitingBalls.push(ball);
  if (isBallsInWaitingContainer) {
    waitingContainer.appendChild(ball);
    updateWaitingCounter();
  } else {
    stoppedContainer.appendChild(ball);
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

function moveBall(ball, velX, velY) {
  let ballStopped = false;
  
  // Объявление начальной позиции мяча
  let posX = launchX;
  let posY = launchY;

  function move() {
    if (ballStopped) return;
    
    const ballRect = ball.getBoundingClientRect();

    // Обновление позиции мяча
    posX += velX;
    posY += velY;
    
    // Проверка столкновения с контейнером
    if (posX <= 0 || posX + ballRect.width >= container.clientWidth) {
      posX -= velX; // Шаг назад
      velX = -velX;
    }

    if (posY <= 0) {
      posY -= velY; // Шаг назад
      velY = -velY;
    }

    ball.style.left = posX + 'px';
    ball.style.top = posY + 'px';

    // Проверка столкновения с нижней гранью контейнера + принудительная остановка
    if (posY + ballRect.height >= container.clientHeight || forceStopBallsMoving) {
      ballStopped = true;
      ball.style.top = container.clientHeight - ballRect.height + 'px';
      console.log(stopPosition);
      if (!stopPosition.isUpdated) {
        stopPosition.isUpdated = true;
        stopPosition.left = forceStopBallsMoving ? stopPosition.left : posX;
        stopPosition.top = container.clientHeight - ballRect.height;
        launchX = stopPosition.left;
        launchY = stopPosition.top;
        if (isBallsInWaitingContainer) {
          stoppedContainer.style.left = stopPosition.left + ballRect.width/2 + 'px';
          stoppedContainer.style.top = container.clientHeight - ballRect.height + 'px';
          stoppedContainer.appendChild(ball);
        } else {
          waitingContainer.style.left = stopPosition.left + ballRect.width/2 + 'px';
          waitingContainer.style.top = container.clientHeight - ballRect.height + 'px';
          waitingContainer.appendChild(ball);
        }
        ball.style.left = 0;
        ball.style.top = 0;
        balls = balls.filter(filteredBall => filteredBall !== ball);
      } else {
        stopBallAnimation(ball);
      }
      console.log(ball.style.left, ball.style.top);
      setTimeout(() => {
        isBallsInWaitingContainer ? updateStoppedCounter() : updateWaitingCounter();
        checkAllBallsStopped();
      }, 100);
      return;
    }

    // Check collision with other elements
    const elements = document.querySelectorAll('.element');
    elements.forEach(element => {
      const rect2 = element.getBoundingClientRect();
      if (
        ballRect.left < rect2.left + rect2.width &&
        ballRect.left + ballRect.width > rect2.left &&
        ballRect.top < rect2.top + rect2.height &&
        ballRect.top + ballRect.height > rect2.top
      ) {
      //   // Collision detected
      // //   console.log('touch box - ',  ballRect.left < rect2.left + rect2.width,
      // //   ballRect.left + ballRect.width > rect2.leftwidth,
      // //   ballRect.top < rect2.top + rect2.heightwidth,
      // //   ballRect.top + ballRect.height > rect2.top
      // // );
        let stacks = parseInt(element.getAttribute('data-stacks'));
        stacks -= 1;
        if (stacks <= 0) {
          element.remove();
        } else {
          element.setAttribute('data-stacks', stacks);
          element.querySelector('.counter_container span').innerText = stacks;
        }

        // Change direction based on collision side
        if (ballRect.left + ballRect.width - velX <= rect2.left || ballRect.left - velX >= rect2.left + rect2.width) {
          velX = -velX;
        }

        if (ballRect.top + ballRect.height - velY <= rect2.top || ballRect.top - velY >= rect2.top + rect2.height) {
          velY = -velY;
        }
      }
      
        // if (element.classList.contains('box')) {
        //   // Collision detected
        //   let stacks = parseInt(element.getAttribute('data-stacks'));
        //   stacks -= 1;
        //   if (stacks <= 0) {
        //     element.remove();
        //   } else {
        //     element.setAttribute('data-stacks', stacks);
        //     element.querySelector('.counter_container span').innerText = stacks;
        //   }

        //   const overlapLeft = ballRect.right - rect2.left;
        //   const overlapRight = rect2.right - ballRect.left;
        //   const overlapTop = ballRect.bottom - rect2.top;
        //   const overlapBottom = rect2.bottom - ballRect.top;

        //   const minOverlap = Math.min(
        //     overlapLeft,
        //     overlapRight,
        //     overlapTop,
        //     overlapBottom
        //   );

        //   // Шаг назад перед изменением направления
        //   if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        //     posX -= velX * 3;
        //     velX = -velX;
        //   }
        //   if (minOverlap === overlapTop || minOverlap === overlapBottom) {
        //     posY -= velY * 3;
        //     velY = -velY;
        //   }
        // } else if (element.classList.contains('triangle')) {
        //   const vertices = getTriangleVertices(element, rect2);
        //   const collisionSide = checkCollisionWithTriangle(
        //     ballRect,
        //     vertices,
        //     velX,
        //     velY
        //   );
        //   if (collisionSide) {
        //     // Collision detected
        //     let stacks = parseInt(element.getAttribute('data-stacks'));
        //     stacks -= 1;
        //     if (stacks <= 0) {
        //       element.remove();
        //     } else {
        //       element.setAttribute('data-stacks', stacks);
        //       element.querySelector('.counter_container span').innerText =
        //         stacks;
        //     }
        //   }

        //   if (collisionSide === 'left' || collisionSide === 'right') {
        //     posX -= velX * 3; // Шаг назад
        //     velX = -velX;
        //   } else if (collisionSide === 'top' || collisionSide === 'bottom') {
        //     posY -= velY * 3; // Шаг назад
        //     velY = -velY;
        //   } else if (collisionSide === 'hypotenuse') {
        //     const newVelX = -velY;
        //     const newVelY = -velX;

        //     if (collisionSide === 'hypotenuse') {
        //       posX -= velX * 3;
        //       posY -= velY * 3;

        //       velX = newVelX;
        //       velY = newVelY;
        //     }
        //   }
        // }
      // }
    });

    requestAnimationFrame(move);
  }

  move();
}

function checkAllBallsStopped() {
  if (balls.length === 0 && waitingBalls.every(ball => ball.parentNode === isBallsInWaitingContainer ? stoppedContainer : waitingContainer)) {
    stopPosition.isUpdated = false;
    animationRunning = false;
    isBallsInWaitingContainer = !isBallsInWaitingContainer;
    forceStopBallsMoving = false;
  }
}

function startBalls(velX, velY) {
  if (animationRunning) return;
  animationRunning = true;
  let delay = 0;
  waitingBalls.forEach((ball, index) => {
    setTimeout(() => {
      if (isBallsInWaitingContainer) {
        waitingContainer.removeChild(ball);
      } else {
        stoppedContainer.removeChild(ball);
      }
      container.appendChild(ball);
      balls.push(ball);
      moveBall(ball, velX, velY);
      isBallsInWaitingContainer ? updateWaitingCounter() : updateStoppedCounter();
    }, delay);
    delay += 100;
  });
}

function stopAnimation() {
  if (!animationRunning) return;
  forceStopBallsMoving = true;
}

function stopBallAnimation(ball) {
    if (!ball.classList.contains('moving')) {
      ball.classList.add('moving');
      ball.style.left = stopPosition.left + 'px';
      ball.style.top = stopPosition.top + 'px';
      setTimeout(() => {
        if (isBallsInWaitingContainer) {
          stoppedContainer.appendChild(ball);
        } else {
          waitingContainer.appendChild(ball);
        }
        ball.classList.remove('moving');
        ball.style.transform = '';
        ball.style.left = 0;
        ball.style.top = 0;
        balls = balls.filter(filteredBall => filteredBall !== ball);
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
  if (animationRunning) return;

  // Позиция мыши в момент отпускания кнопки
  const mouseX = event.clientX - container.getBoundingClientRect().left;
  const mouseY = event.clientY - container.getBoundingClientRect().top;

  // Вычисление направления движения
  const deltaX = mouseX - launchX;
  const deltaY = mouseY - launchY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Задание скорости и направления
  velX = (deltaX / distance) * 4; // Коэффициент скорости
  velY = (deltaY / distance) * 4;

  // Запуск анимации
  startBalls(velX, velY);
});

generateLevel(levelConfig);
stopButton.addEventListener('click', stopAnimation);
