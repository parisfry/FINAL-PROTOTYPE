let audio; 

let port;   //declares a port to handle communication between arduino and p5js
let connectBtn;  // declares connectBtn for the connect button
let myVal1 = 0; //declares myVal to store the potentiometer readings
let myVal2 = 0;
let myVal3 = 0;

//create arrays for three categories of colours using RGB values
let colours = {
  gentle: [200, 200, 200], //a light grey calm colour
  happy: [255, 105, 180], //a bright pink
  bright: [255, 69, 0],  //orange/red colour
};

let canvas;
let currentColours = colours.gentle; // Begin sketch with gentle colours
let steps = 360;
let r = 100; //base radius for the shapes
let noiseScale = 0.002;
let noiseAmount = 300;
let shapeType = 'circle'; //begin sketch with circle shape as the audio will begin at a normal tempo

function preload() {
  audio = loadSound('audio.mp3');
}

function setup() {

  //using the createDiv function to position the question above the canvas
  let textDiv = createDiv('Select a tempo and respond to the music using the dials');
  textDiv.position(20, 18); 
  textDiv.style('font-size', '25px');
  textDiv.style('color', 'DarkGrey');

  canvas = createCanvas(800, 400); //landscape canvas to represent a live music performance screen
  canvas.position(0, 75); //position the canvas below the buttons so it is an outcome of the input
  noFill();
  stroke(255,50);
  background(200);

port = createSerial();//initialises a serial connection 

connectBtn = createButton('Connect to Arduino');//creates a button
connectBtn.position(20, 475);//position of the button
connectBtn.mousePressed(connectBtnClick);
//when the mouse is pressed it initiates the button clicked function

  // Create buttons to change the audio playback speed 
  let slowAudioButton = createButton('0.5x Tempo');
  slowAudioButton.position(100, 50);
  slowAudioButton.mousePressed(() => setAudioRate(0.5));

  let normalAudioButton = createButton('1x Tempo');
  normalAudioButton.position(300, 50);
  normalAudioButton.mousePressed(() => setAudioRate(1));

  let fastAudioButton = createButton('2x Tempo ');
  fastAudioButton.position(500, 50);
  fastAudioButton.mousePressed(() => setAudioRate(2));
}

function draw() {

  let val = port.readUntil("\n"); 
  if (val) {
    let values = split(val.trim(), ","); // Splits the string into two parts

    //Convert each value from the string into an integer and assign them to variable Val 1,2 or 3
    if (values.length === 3) {
      myVal1 = int(values[0]); // First potentiometer value
      myVal2 = int(values[1]); // Second potentiometer value
      myVal3 = int(values[2]); // third potentiometer value 
    }
  } 

   noFill();
  background(0, 10); // background with an echo effect 
  stroke(currentColours[0], currentColours[1], currentColours[2], 80); 

  //Assign each function to either Val1, Val2, or Val3
  setMovement(myVal1);

  setShape(myVal2);

  setColours(myVal3);

//use if and else statements to determine which shape to to draw 
  if (shapeType === 'circle') {
    distortedCircle();
  } else if (shapeType === 'grid') {
    distortedGrid();
  } else if (shapeType === 'spiral') {
    distortedSpiral();
  }

}
//ensuring that i use noise within all my distorted shapes so that the visual is fluid and connects with the audio
function distortedCircle() {
  beginShape();
  for (let i = 0; i <= steps; i++) {
    let x = width / 2 + r * cos((TWO_PI * i) / steps);
    let y = height / 2 + r * sin((TWO_PI * i) / steps);
    x += map(
      noise(noiseScale * x, noiseScale * y, frameCount / 100), 0, 1, -noiseAmount, noiseAmount);
    y += map(
      noise(noiseScale * x, noiseScale * y, 1), 0, 1, -noiseAmount, noiseAmount);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function distortedGrid() {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let x = 70 + i * 70;
      let y = 70 + j * 70;

      let xOffset = map(
        noise(noiseScale * x, noiseScale * y, frameCount * 0.01), 0, 1, -noiseAmount, noiseAmount);
      let yOffset = map(
        noise(noiseScale * x, noiseScale * y, frameCount * 0.02), 0, 1, -noiseAmount, noiseAmount);
      rect(x + xOffset, y + yOffset, 50, 50);
    }
  }
}

function distortedSpiral() {
  beginShape();
  for (let i = 0; i < steps; i++) {
    let angle = i * 0.1;
    let radius = r + i * 0.5;

    let x = width / 2 + radius * cos(angle);
    let y = height / 2 + radius * sin(angle);

    x += map(noise(noiseScale * x, frameCount / 100), 0, 1, -noiseAmount, noiseAmount);
    y += map(noise(noiseScale * y, frameCount / 100), 0, 1, -noiseAmount, noiseAmount);

    vertex(x, y);
  }
  endShape();
}

//using the value from the first potentiometer to alter the amount of noise scale and noise amount
function setMovement(val){
  noiseScale = map(val, 0, 1023, 0.001, 0.03);
  noiseAmount = map(val, 0, 1023, 50, 200); // ensure i map the arduino values to an appropriate range
}

//using the value from the second potentiometer to alter the shape of the visual
//i had to split the potentiometer readings (0-1023) into three groups as i had three shapes 
function setShape(val){
  if (val < 421){ //use if and else values to determine the shape
    shapeType = 'circle';
  } else if (val >= 341 && val < 682){
    shapeType = 'grid';
  } else {
    shapeType = 'spiral';
  }
}
//using the values from the third potentiometer to alter the colour 
//i had to split the potentiometer readings (0-1023) into three groups as i had three shapes
function setColours(val) {
  if (val < 341) {
    currentColours = colours.gentle;
  } else if (val >= 341 && val < 682) {
    currentColours = colours.happy;
  } else {
    currentColours = colours.bright;
  }

}
//checks that the audio is playing
function setAudioRate(rate) {
  audio.rate(rate);
  if (!audio.isPlaying()) {
    audio.play();
  }
}

function connectBtnClick() {
  console.log('Button clicked');
  if (!port.opened()) {
    port.open('Arduino', 9600); // Open the port at 9600 baud rate
  } else {
    port.close();
  }
}
