

function Snake (snakeBrain) {

	/*
	***********************************************************************************************
	SNAKE STATE
	***********************************************************************************************
	*/

	this.alive = true;
	
	/*
	***********************************************************************************************
	PHYSICAL SNAKE PARAMETERS
	***********************************************************************************************
	*/

	// size of each circles in the snake
	this.diameter = BODY_PARTS;

	// snakes will spawn randomly within these parameters
	const xmin = this.diameter * 2;
	const xmax = COURSE_WIDTH - (this.diameter * 2);
	const ymin = this.diameter * 2;
	const ymax = COURSE_HEIGHT - (this.diameter * 2);

	// variable for the head body part 
	var head = {
		position: createVector(random(xmin, xmax), random(ymin, ymax)),
		color: [255, 0, 0]
	}
	// the snake starts with a head and one body piece
	var firstBody = {
		position: createVector(head.position.x, head.position.y + this.diameter),
		color: [random(25, 225), random(25, 225), random(25, 225)]
	}

	var secondBody = {
		position: createVector(head.position.x, head.position.y + this.diameter*2),
		color: [random(25, 225), random(25, 225), random(25, 225)]
	}

	// array to keep track of the snakes body. More parts will be added as it grows.
	this.bodyParts = [head, firstBody, secondBody];

	/*
	***********************************************************************************************
	VELOCITY AND DIRECTION INFORMATION
	***********************************************************************************************
	*/

	// The snake will have a constant velocity
	this.velocity = 6;

	// It will be divied up between x velocity and y velocity depending on the snakes current direction
	this.velocityVector = createVector(0, this.velocity);

	// The current direction the snake is moving in
	this.direction = 3*PI/2;

	/*
	***********************************************************************************************
	FITNESS INFORMATION
	***********************************************************************************************
	*/

	// Keep up with how many foods the snake has eaten
	this.score = 0;
	this.timeSpentAlive = LIFESPAN;
	this.fitness = 0;




	/*
	***********************************************************************************************
	NEURAL NETWORK AND RELATED INFORMATION
	***********************************************************************************************
	*/

	if (snakeBrain) {
		this.snakeBrain = snakeBrain;
	} else {
		const INPUT_NODES = WALL_NODES + (FOOD_NODE_PAIRS * 2) + (BODY_NODE_PAIRS * 2);
		const HIDDEN_NODES = 15;
		const OUTPUT_NODES = 3;


		this.snakeBrain = new SnakeBrain(INPUT_NODES, HIDDEN_NODES, OUTPUT_NODES);
	}

	/*
	***********************************************************************************************
	THE SNAKES EYES
	***********************************************************************************************
	*/


	this.eyes = new SnakeEyes(this);



	// Input array for the snakeBrain
	// This will be updated each frame and comes in the for [[i1], [i2], ... , [im]] where each input is a 
	// float between -1.0 and 1.0 that whose sign represents either an obstacle (-)
	// or a food item (+) and whose magnitude represents the distance along eye line where the object is
	// high magnitude represents close by and low magnitude represents far away
	this.inputs = [];

	

	var methods = {


		/*
		***********************************************************************************************
		UPDATE AND SHOW
		***********************************************************************************************
		*/

		// update function to be called in our draw loop every frame
		update: function () {

			if (this.dies()) {
				this.alive = false;
			}

			if (this.alive) {
				for (var i = 0; i < food.length; i++) {
					if (this.eats(food[i])) {
						// get color of that food
						var color = food[i].getColor();
						// remove that food
						food.splice(i, 1);
						// new random food
						food.push(new Food());
						// add body part
						this.add(color);
					}
				}

				this.eyes.update();
				// this.updateDirection();
				
				this.act();
					
				this.velocityVector.x = this.velocity * cos(this.direction);
				this.velocityVector.y = this.velocity * sin(this.direction);

				var newX = this.bodyParts[0].position.x + this.velocityVector.x;
				var newY = this.bodyParts[0].position.y + this.velocityVector.y;

				this.moveTo(newX, newY);
			}

			

		},
		// actually draws all the elements of the snake
		show: function () {
			
			for (var i = 0; i < this.bodyParts.length; i++) {
				push()

				fill(...this.bodyParts[i].color);

				translate(this.bodyParts[i].position.x, this.bodyParts[i].position.y)
	 
				ellipse(0, 0, this.diameter, this.diameter);
				pop();

			}

			// this.eyes.show();
			
		},

		/*
		***********************************************************************************************
		MOVEMENT FUNCTIONS
		***********************************************************************************************
		*/

		// moves the head of the snake to the location (x, y) specified in the update function by the current position plus the velocity 
		// then calls join to bring all the other parts of the snake along
		moveTo: function (x, y) {
			this.bodyParts[0].position.x = x;
			this.bodyParts[0].position.y = y;

			this.join();
		},


		join: function () {
			// loop through each bodypart's position
			for (var i = 1; i < this.bodyParts.length; i++) {
				// get the last and current position
				const last = this.bodyParts[i - 1].position;
				const curr = this.bodyParts[i].position;

				// get the difference in x nad y between the two positions
				const dx = curr.x - last.x;
				const dy = curr.y - last.y;

				// calculate the andle between the two parts of the snake
				var angle = atan2(dy, dx);

				// get the new x and y using polar coordinates
				const nx = this.diameter * cos(angle);
				const ny = this.diameter * sin(angle);

				// add the new x and y to the last bodypart's position to join the two together without any gaps
				curr.x = nx + last.x;
				curr.y = ny + last.y;
			}
		},
		
		// switches the direction of the snake head toward the current location of the mouse
		/* MANUAL */
		updateDirection: function () {
			// get the current location of the mouse
			const mouse = createVector(mouseX, mouseY);
			const head = this.bodyParts[0].position
			// calculate the distance between the mouse and the center of the snake head
			const d = dist(head.x, head.y, mouse.x, mouse.y);
			// only changes the snakes direction if that distance is greater than 2 diameters
			if (d > 2 * this.diameter) {
				var theta = atan((mouse.y - head.y) / (mouse.x - head.x));
				if (mouse.x > head.x && mouse.y < head.y) {
					theta += TWO_PI;
				} else if (mouse.x < head.x && mouse.y > head.y) {
					theta += PI;
				} else if (mouse.x < head.x && mouse.y < head.y) {
					theta += PI;
				} else if (mouse.x > head.x && mouse.y > head.y) {
					theta = theta;
				}

				this.direction = theta;
			}
		},


		/* AUTOMATIC */
		act: function () {

			var output = this.snakeBrain.look(this.eyes);
			
			output = output.map(function (element) {
				return element[0];
			})

			var index = output.indexOf(Math.max(...output));
			if (index === 0) {
				if (this.direction + PI/16 > TWO_PI) {
					this.direction = (this.direction + PI/16) - TWO_PI;
				} else {
					this.direction += PI/16;
				}
				
			} if (index === 2) {
				if (this.direction - PI/16 < 0) {
					this.direction = (this.direction - PI/16) + TWO_PI;
				} else {
					this.direction -= PI/16;
				}
				
			}

		},

		// checks to see if the snake head has collided with the food object. Returns true if so
		eats: function(food) {

			
			var tip = createVector(this.bodyParts[0].position.x + ((this.diameter/2) * (cos(this.direction))), this.bodyParts[0].position.y + ((this.diameter/2) * sin(this.direction)));
			var right = createVector(this.bodyParts[0].position.x + ((this.diameter/2 * (cos(this.direction + PI/2)))), this.bodyParts[0].position.y + ((this.diameter/2) * sin(this.direction + PI/2)));
			var left = createVector(this.bodyParts[0].position.x + ((this.diameter/2 * (cos(this.direction - PI/2)))), this.bodyParts[0].position.y + ((this.diameter/2) * sin(this.direction - PI/2)));
			// An array of the point to check on the snake head
			var points = [tip, right, left];

			// for each of those points of that array check if if is within the square that contains the food object
			for (var i = 0 ; i < points.length; i++) {
				if (points[i].x > food.position.x - this.diameter/2 && points[i].x < food.position.x + this.diameter/2 && 
					points[i].y > food.position.y - this.diameter/2 && points[i].y < food.position.y + this.diameter/2) {
					// if it does return true
					this.score++;
					return true;
				}
			}
			return false;
		},

		// add a body part to the snake
		add: function (color) {
			// find the position of the last body part on our snake
			const last = this.bodyParts[this.bodyParts.length - 1].position;
			// find the position of the second to last body part of our snake
			const secondToLast = this.bodyParts[this.bodyParts.length - 2].position;
			// calculate the angle between those two bodyparts
			const angle = atan2((last.x - secondToLast.x), (last.y - secondToLast.y));

			// the position of the new body part will be in the opposite direction of that angle
			var newPosition = createVector(this.diameter * cos(angle + PI/2), this.diameter * sin(angle + PI/2));

			var bodyPart = {
				position: newPosition,
				color: color
			}
			this.bodyParts.push(bodyPart)
		},

		// checks to see if the snake collides with the walls or with a partso of itself
		dies: function () {

			var tip = createVector(this.bodyParts[0].position.x + ((this.diameter/2) * (cos(this.direction))), this.bodyParts[0].position.y + ((this.diameter/2) * sin(this.direction)));
			var right = createVector(this.bodyParts[0].position.x + ((this.diameter/2 * (cos(this.direction + PI/2)))), this.bodyParts[0].position.y + ((this.diameter/2) * sin(this.direction + PI/2)));
			var left = createVector(this.bodyParts[0].position.x + ((this.diameter/2 * (cos(this.direction - PI/2)))), this.bodyParts[0].position.y + ((this.diameter/2) * sin(this.direction - PI/2)));
			
			// an array of 3 points around the outside of the snake head
			var points = [tip, right,left];
			for (var i = 0; i < points.length; i++) {
				if (points[i].x < 0 || points[i].x > COURSE_WIDTH ||
					points[i].y < 0 || points[i].y > COURSE_HEIGHT) {
					this.timeSpentAlive = count;
					return true;
				}
			}

			for (var i = 0; i < points.length; i++) {
				for (var j = 2; j < this.bodyParts.length; j++) {
					if (points[i].x > this.bodyParts[j].position.x - this.diameter/2 && points[i].x < this.bodyParts[j].position.x + this.diameter/2 && 
						points[i].y > this.bodyParts[j].position.y - this.diameter/2 && points[i].y < this.bodyParts[j].position.y + this.diameter/2) {
						this.timeSpentAlive = count;
						return true;
					}
				}
			}
			
		},

		/*
		***********************************************************************************************
		FITNESS FUNCTION
		***********************************************************************************************
		*/

		calcFitness: function () {
			this.fitness = (this.score * 25) + (this.timeSpentAlive / 40) / (GENERATION * 0.5);
		},

		/*
		***********************************************************************************************
		DNA HANDLING
		***********************************************************************************************
		*/

		reproduce: function (parentB) {
			// returns a new snake object with the combined dna of this and parentB mutated
			var childDNA = this.snakeBrain.crossover(parentB.snakeBrain);
			var childBrain = new SnakeBrain(this.snakeBrain.input_nodes, this.snakeBrain.hidden_nodes, this.snakeBrain.output_nodes, childDNA);
			childBrain.mutate();
			var child = new Snake(childBrain);
			return child;
		},



	}
	this.__proto__ = methods;
}

