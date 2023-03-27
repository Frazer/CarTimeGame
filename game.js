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
    angleDiff: (Math.random() * Math.PI * 0.22) + Math.PI * 0.11,
    speed: Math.random() * 1 + 0.5,
    image: newCarImage(color),
    topSpeed: Math.random() * 8 + 5,
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
  
  // move the car forward
  playersCar.x -= playersCar.speed * Math.sin(playersCar.angle);
  playersCar.y += playersCar.speed * Math.cos(playersCar.angle);    
  
  // make sure the car stays on the screen
  if(playersCar.x < 0){
    playersCar.x = 0;
  }else if(playersCar.x > canvas.width - carWidth){
    playersCar.x = canvas.width - carWidth;
  }
  if(playersCar.y < 0){
    playersCar.y = 0;
  }else if(playersCar.y > canvas.height - carHeight){
    playersCar.y = canvas.height - carHeight;
  }

  

  // have the other caars chase the player car
  cars.forEach(car=>{

    car.angle = Math.atan2(car.y - playersCar.y ,  car.x - playersCar.x)+ Math.PI/4 + car.angleDiff;
    // move the car forward
    car.x -= car.speed * Math.sin(car.angle);
    car.y += car.speed * Math.cos(car.angle);

    // make sure the car stays on the screen
    if(car.x < 0){
      car.x = 0;
    }else if(car.x > canvas.width - carWidth){
      car.x = canvas.width - carWidth;
    }
    if(car.y < 0){
      car.y = 0;
    }else if(car.y > canvas.height - carHeight){
      car.y = canvas.height - carHeight;
    }


  });

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

draw = ()=>{
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawCar(playersCar);

  cars.forEach(car=>{
    drawCar(car);
  });

}

fetch('./car_topview.svg')
  .then(response => response.text())
  .then(svgText => {
    carString = svgText;
      
    initialize();
  });

initialize = ()=>{

  playersCar = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    image: newCarImage('ff0000'),
    angle: 0,
    speed: 0,
    topSpeed: 13,
  }

  cars = [];
  for(var i = 0; i < 20; i++){
    cars.push(randomCar());
  }

  requestAnimationFrame(tick);
}

