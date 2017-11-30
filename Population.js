

// global reference to population object
var population;
// global reference to food array
var food;

// gui
var gui;
// gui defaults
var generations = 25;

// how many food objects to put on the map
const NUMBER_OF_FOODS = 15;

// canvas parameters
var COURSE_WIDTH = 1900;
var COURSE_HEIGHT = 1000;
var course;
// Window parameters
var WINDOW_WIDTH = 2300;
var WINDOW_HEIGHT = 1500;

//diameter of body parts
var BODY_PARTS = 26

// 
var MAXFIT = 1;
var MUTATION_RATE = 0;
var LONGEST_LIVING = 0;

var LIFESPAN = 5000;

// population size of each generation
const POPULATION_SIZE = 1;

var count = 0;

/*
*****************************************************************************************
SETUP
*****************************************************************************************
*/

function setup() {

	// setup the gui
	gui = createGui('something', COURSE_WIDTH);

	// set up course;
	course = createVector(COURSE_WIDTH, COURSE_HEIGHT);

	// gui buttons
	gui.prototype.addButton('RUN ONE GENERATION', runGeneration);

	sliderRange(10, 300, 1);
	gui.addGlobals('generations');

	gui.prototype.addButton('CHARGE LAZARS', function () {
		console.log('running');
		var num = 0;
		while (num <= gui.prototype.getNumberValue('generations')) {
			runGeneration();
			if (num % 50 === 0) {
				console.log('.......')
			}
			num++;
		}
		console.log('done');
	});


	// create our population
	population = new Population();

	console.log(population)

	// initialize canvas
	createCanvas(COURSE_WIDTH, COURSE_HEIGHT)
	noLoop()

	// initialize our food array and put the right number of food items in it
	food = new Array(NUMBER_OF_FOODS);
	for (var i = 0; i < NUMBER_OF_FOODS; i++) {
		food[i] = new Food();
	}


}

/*
*****************************************************************************************
DRAW
*****************************************************************************************
*/


function draw() {

	
	fill (35);
	rect(0, 0, COURSE_WIDTH, COURSE_HEIGHT);

	if (count % 100 === 0) {
		console.log('....')
	}

	if (population.isDead() || count === LIFESPAN) {


		population.evaluate();
		MUTATION_RATE = 1 / population.averageFitness;
		console.log('mutation rate: ' + MUTATION_RATE);
		console.log('average: ' + population.averageFitness);
		population = population.selection();

		count = 0;
	}

	population.show();
	population.update();
	
	food.forEach(function (food) {
		food.show();
	})

	// check for collisions between the snake heads and the food object

	
	count++;
}

function runGeneration () {

	while (count < LIFESPAN) {

		if (population.isDead()) break;
		population.update();
		count++;
	}
	population.evaluate();

	MUTATION_RATE = 1 / (population.averageFitness * 24);
	console.log('MR ' + MUTATION_RATE);
	console.log('average: ' + population.averageFitness);
	console.log('example brain: ');
	console.log(this.population.snakes[0].snakeBrain);
	population = population.selection();

	count = 0;
}




function keyPressed () {

	if (keyCode === RIGHT_ARROW) {
		loop();
	} else if (keyCode === LEFT_ARROW) {
		noLoop();
	} 
}
