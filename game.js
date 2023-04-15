// set up the canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
canvas.height = window.innerHeight - 90;
canvas.width = window.innerWidth -20;

//window resize listener to change size of canvas
window.addEventListener('resize', ()=>{
  canvas.height = window.innerHeight - 90;
  canvas.width = window.innerWidth -20;
} );

// set up a keys array
var keys = [];
obstacles = [];

let highScore = 0;
let playerWithHighScore = 0;

// add a keylistener to update the keys array
document.addEventListener("keydown", (event)=>{
  keys[event.key] = true;
})

document.addEventListener("keyup", (event)=>{
  keys[event.key] = false;
})

// make a random color
var randomColor = ()=>{
  var letters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let carString = "";

const newCarImage = (color = "ff3333")=>{
  let carImage = new Image();
  let newCarString = carString.replace(/XBODYX/g, color);
    // Create an Image object from the SVG contents
  carImage.src = `data:image/svg+xml;base64,${btoa(newCarString)}`;
  return carImage;
}

// make  araandom car
var randomCar = (color = randomColor())=>{
  return {
    x: Math.random() * (canvas.width - carWidth),
    y: Math.random() * (canvas.height - carHeight),
    angle: Math.random() * Math.PI * 2,
    angleDiff: (Math.random() * Math.PI * 0.22) + Math.PI * 0.11,
    speed: Math.random() * 1 + 0.5,
    image: newCarImage(color),
    topSpeed: Math.random() * 8 + 5,
    acceleration: Math.random() * 0.5 + 0.05,
  }
}

const accelerate = (car)=>{
  // accelerate the car smoothly making it harder as it approaches top speed

  //breaking from reverse
  if(car.speed < 0 ){
    car.speed = car.speed*0.9;
  }
  
  if(car.speed < car.topSpeed*3/4){
    car.speed = car.speed + 0.1;
  }else if(car.speed < car.topSpeed){
    car.speed = (car.topSpeed - car.speed) * 0.005 + car.speed;
  }
}

const reverse = (car)=>{
  // decelerate the car smoothly making it harder as it approaches top speed

  //breaking from forward
  if(car.speed > 0 ){
    car.speed = car.speed*0.9;
  }

  if(car.speed > -car.topSpeed/4){
    car.speed = car.speed - 0.1;
  }else if(car.speed > -car.topSpeed/2){
    car.speed = (car.topSpeed/2 - car.speed) * 0.005 + car.speed;
  }
}

const decelerate = (car)=>{
  car.speed = car.speed * 0.99
};

update = ()=>{

  let p1Contact = false;
  let p2Contact = false;

  if(keys["ArrowLeft"]){
    playersCar.angle -= Math.PI / 60;
  }else if(keys["ArrowRight"]){
    playersCar.angle += Math.PI / 60;
  }

  if(keys["ArrowUp"]){
    accelerate(playersCar);
  }else if(keys["ArrowDown"]){
    reverse(playersCar);
  }else{
    decelerate(playersCar);
  }

  if(keys["w"]){
    accelerate(player2Car);
  }else if(keys["s"]){
    reverse(player2Car);
  }else{
    decelerate(player2Car);
  }

  if(keys["a"]){
    player2Car.angle -= Math.PI / 60;
  }else if(keys["d"]){
    player2Car.angle += Math.PI / 60;
  }

  // move the car forward
  playersCar.x -= playersCar.speed * Math.sin(playersCar.angle);
  playersCar.y += playersCar.speed * Math.cos(playersCar.angle);  

  player2Car.x -= player2Car.speed * Math.sin(player2Car.angle);
  player2Car.y += player2Car.speed * Math.cos(player2Car.angle);
  
  checkBounds(playersCar);
  checkBounds(player2Car);
  
  // have the other caars chase the player car
  cars.forEach(car=>{
    // find the closest playr car
    let closestPlayerCar = playersCar;
    let distanceToPlayer1 = (Math.pow(car.x - playersCar.x, 2) + Math.pow(car.y - playersCar.y, 2));
    if(Math.pow(car.x - player2Car.x, 2) + Math.pow(car.y - player2Car.y, 2) < distanceToPlayer1){
      closestPlayerCar = player2Car;
    } 

    let angleToTarget = changeDirection(car, closestPlayerCar, Math.PI/90);

    if(angleToTarget < Math.PI/6){
      accelerate(car);
    }else{
      decelerate(car);
    }
    // move the car forward
    car.x -= car.speed * Math.sin(car.angle);
    car.y += car.speed * Math.cos(car.angle);

    checkBounds(car);

    // check if the car is with either plaayer car
    if(car.x < playersCar.x + carWidth &&
      car.x + carWidth > playersCar.x &&
      car.y < playersCar.y + carHeight &&
      car.y + carHeight > playersCar.y){
        p1Contact = true;
      }
    if(car.x < player2Car.x + carWidth &&
      car.x + carWidth > player2Car.x &&
      car.y < player2Car.y + carHeight &&
      car.y + carHeight > player2Car.y){
        p2Contact = true;
      }

  });

  playersCar.score++;
  player2Car.score++;

  if(p1Contact){
    playersCar.score = 0;
  }
  if(p2Contact){
    player2Car.score = 0;
  }

  if(playersCar.score > highScore){
    highScore = playersCar.score;
    playerWithHighScore = 1;
  }
  if(player2Car.score > highScore){
    highScore = player2Car.score;
    playerWithHighScore = 2;
  }

}

const changeDirection = (car, target, maxTurnAngle)=>{
  let angleToTarget = Math.atan2(car.y - target.y ,  car.x - target.x) + Math.PI/4 + car.angleDiff;

  // Add/subtract 2PI if the target wraps around 
  if (Math.abs(angleToTarget) > Math.PI) {angleToTarget -= Math.sign(angleToTarget) * 2 * Math.PI;}
  
  let differnce = angleToTarget - car.angle;
  if (Math.abs(differnce) > Math.PI) {differnce -= Math.sign(differnce) * 2 * Math.PI;}

  // Make sure we don't overshoot the turn
  turnAmount = Math.min(Math.abs(differnce), maxTurnAngle); 

  // Turn left or right depending on which direction is shorter
  if (differnce > 0){
    car.angle += turnAmount; 
  } else {
    car.angle -= turnAmount; 
  }

  if(car.angle > Math.PI*2){
    car.angle -= Math.PI*2;
  }else if(car.angle < -Math.PI*2){
    car.angle += Math.PI*2;
  }
  
  return Math.abs(differnce);
}

tick = ()=>{
  update();
  draw();
  requestAnimationFrame(tick);
}

let carWidth = 25;
let carHeight = 37.5;

drawCar = (car)=>{
  
  ctx.translate(car.x, car.y);
  ctx.translate(carWidth/2, carHeight/2);
  ctx.rotate(car.angle + Math.PI);
  ctx.translate(-carWidth/2, -carHeight/2);
  
  ctx.drawImage(car.image, 0, 0, carWidth, carHeight);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

drawObstacles = ()=>{
  obstacles.forEach(obstacle=>{
    ctx.fillStyle = "#78491a";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.fillStyle = "white";
  });
}

draw = ()=>{
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawObstacles();

  cars.forEach(car=>{
    drawCar(car);
  });

  drawCar(playersCar);

  drawCar(player2Car);

  drawScores();

}

fetch('./car_topview.svg')
  .then(response => response.text())
  .then(svgText => {
    carString = svgText;
      
    initialize();
  });

initialize = ()=>{

  highScore = 0;
  playerWithHighScore = 0;

  playersCar = {
    x: window.innerWidth * 0.75,
    y: window.innerHeight * 0.75,
    image: newCarImage('ff0000'),
    angle: Math.PI,
    speed: 0,
    topSpeed: 13,
    acceleration: 0.1,
    score: 0,
  }

  player2Car = {
    x: window.innerWidth * 0.25,
    y: window.innerHeight * 0.25,
    image: newCarImage('0000ff'),
    angle: 0,
    speed: 0,
    topSpeed: 13,
    acceleration: 0.1,
    score: 0,
  }

  createObstacles();

  cars = [];
  for(var i = 0; i < 20; i++){
    cars.push(randomCar());
  }

  requestAnimationFrame(tick);
}

const createObstacles = ()=>{
  // create some obstacles, maaking sure not to overlap with the cars
  for(var i = 0; i < 10; i++){
    let obstacle = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
    }
    let overlap = false;
    [playersCar, player2Car].forEach(car=>{
      if(obstacle.x < car.x + carWidth &&
        obstacle.x + obstacle.width > car.x &&
        obstacle.y < car.y + carHeight &&
        obstacle.y + obstacle.height > car.y){
          overlap = true;
        }
    });
    if(!overlap){
      obstacles.push(obstacle);
    }
  }
  
}


function drawScores() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Red: " + playersCar.score, canvas.width - 100, canvas.height - 50);
  ctx.fillStyle = "blue";
  ctx.fillText("Blue: " + player2Car.score, 10, 50);
  if(playerWithHighScore == 1){
    ctx.fillStyle = "red";
  }else if(playerWithHighScore == 2){
    ctx.fillStyle = "blue";
  }else{
    ctx.fillStyle = "purple";
  }
  ctx.fillText("High: " + highScore, 10, canvas.height - 50);
}

function checkBounds(car) {
  // make sure the car stays on the screen
  if (car.x < 0) {
    car.x = 0;
  } else if (car.x > canvas.width - carWidth) {
    car.x = canvas.width - carWidth;
  }
  if (car.y < 0) {
    car.y = 0;
  } else if (car.y > canvas.height - carHeight) {
    car.y = canvas.height - carHeight;
  }

  // check if the car is colliding with any obstacles
  obstacles.forEach(obstacle=>{
    if(car.x < obstacle.x + obstacle.width &&
      car.x + carWidth > obstacle.x &&
      car.y < obstacle.y + obstacle.height &&
      car.y + carHeight > obstacle.y){
        // collision detected!
        car.speed = car.speed * 0.85;
      }
  }
  );
}

