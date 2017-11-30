
function SnakeEyes (snake) {

	/*
	***********************************************************************************************
	PHYSICAL PARAMETERS OF SNAKE EYES
	***********************************************************************************************
	*/
	this.snake = snake;
	this.radius = snake.diameter/2;
	this.length = 300;
	this.direction = snake.direction;
	this.position = snake.bodyParts[0].position;
	this.fieldOfVision = HALF_PI;
	this.fieldSplit = 10;
	this.sees;
	// coordinates of the the vertices of the field of vision.
	push();
	translate(this.position.x, this.position.y);
	this.x1 = this.length * (cos(this.direction + this.fieldOfVision/2));
	this.y1 = this.length * (sin(this.direction + this.fieldOfVision/2));

	this.x2 = this.length * (cos(this.direction - this.fieldOfVision/2));
	this.y2 = this.length * (sin(this.direction - this.fieldOfVision/2));
	pop();

	/*
	***********************************************************************************************
	UPDATE AND SHOW FUNCTIONS
	***********************************************************************************************
	*/

	this.update = function () {
		this.direction = this.snake.direction;
		this.position = snake.bodyParts[0].position;

		// push();
		// translate(this.position.x, this.position.y);
		this.x1 = this.length * (cos(this.direction + this.fieldOfVision/2));
		this.y1 = this.length * (sin(this.direction + this.fieldOfVision/2));

		this.x2 = this.length * (cos(this.direction - this.fieldOfVision/2));
		this.y2 = this.length * (sin(this.direction - this.fieldOfVision/2));
		// pop();

		// to test the see function while in manual mode.
		// this.sees = this.see();

	}

	this.show = function () {
		push();
		fill(50, 50, 50);
		translate(this.position.x, this.position.y);
		
		triangle(0, 0, this.x1, this.y1, this.x2, this.y2);
		pop();
	}

	/*
	***********************************************************************************************
	OTHER FUNCTIONS
	***********************************************************************************************
	*/

	// checks for food objects and obstacles along the path of its eyesight and returns a number whose magnitute is
	// the distance the seen object is from the beginning of the line and whose sign is - if its an obstacle and + if its a food item
	// returns 0 if nothing is 'seen'.
	// If the eye sees more than one thing it should return the value corresponding to the closer thing
	this.see = function () {
		// split the field of vision intp this.fieldSplit subsections:
		var what_the_snake_sees = new Array(this.fieldSplit);
		for (var i = 0; i < (this.fieldSplit * 2); i++) {
			what_the_snake_sees[i] = 0.01;
		}

		var eyes = this.position;

		if (eyes.x < this.length || eyes.x > COURSE_WIDTH - this.length || eyes.y < this.length || eyes.y > COURSE_HEIGHT - this.length) {
			var subfield = this.fieldOfVision / this.fieldSplit;
			for (i = 0; i < this.fieldSplit; i++) {
				var subangle = (this.direction - (this.fieldOfVision / 2)) + (i * subfield);
				var x = eyes.x + (this.length * cos(subangle));
				var y = eyes.y + (this.length * sin(subangle));
				var endpoint = createVector(x, y);

				if (endpoint.x < 0) {
					var R = endpoint.x / cos(subangle);
					what_the_snake_sees[i] = -(R / this.length);
				} else if (endpoint.x > COURSE_WIDTH) {
					var R = (COURSE_WIDTH - eyes.x) / cos(subangle);
					what_the_snake_sees[i] = -(R / this.length);
				} else if (endpoint.y < 0) {
					var R = endpoint.y / sin(subangle);
					what_the_snake_sees[i] = -(R / this.length);
				} else if (endpoint.y > COURSE_HEIGHT) {
					var R = (COURSE_HEIGHT - eyes.y) / sin(subangle);
					what_the_snake_sees[i] = -(R / this.length);
				}
			}
		}

		// For each food item we will first check if it is less than this.length away from the head. because if not, it cannot be within our simi-circle.
		for (var i = 0; i < food.length; i++) {

			var this_food = food[i].position;
			
			
			var d = dist(eyes.x, eyes.y, this_food.x, this_food.y);

			if (d < this.length) {
				// Now we'll check that the this_food item is within the total field of vision because if it isn't there's no need to check that it's within the subfields.
				// calculatate theta - the angle between the line between the snake head and the this_food item and the origin (which runs through the snake head).
				if (this_food.x - eyes.x !== 0) {
					var theta = atan((this_food.y - eyes.y) / (this_food.x - eyes.x));
				} else theta = 0;
				
				if (this_food.x > eyes.x && this_food.y < eyes.y) {
					theta += TWO_PI;
				} else if (this_food.x < eyes.x && this_food.y > eyes.y) {
					theta += PI;
				} else if (this_food.x < eyes.x && this_food.y < eyes.y) {
					theta += PI;
				} else if (this_food.x > eyes.x && this_food.y > eyes.y) {
					theta = theta;
				}
				
				if (theta > this.direction - this.fieldOfVision/2 && theta < this.direction + this.fieldOfVision/2) {

					// The snake sees the food but...
					// Now we need to figure out exactly which subfield the food item is in
					for (var j = 1; j <= this.fieldSplit; j++) {
						var subfield = this.fieldOfVision / this.fieldSplit;
						var lowerBound = (this.direction - this.fieldOfVision/2) + ((j - 1) * subfield);
						var upperBound = (this.direction - this.fieldOfVision/2) + (j * subfield);
						if (theta > lowerBound && theta < upperBound) {
							// the food item is in this subfield. make the input array corresponding to this subfield have the value d / this.length
							what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
						}
					}
				}

				if (this.direction < this.fieldOfVision/2 && theta > TWO_PI - (this.fieldOfVision/2 - this.direction)) {

					for (var j = 1; j <= this.fieldSplit; j++) {

						var subfield = this.fieldOfVision / this.fieldSplit;
						var lowerBound = (this.direction - this.fieldOfVision/2) + ((j - 1) * subfield);
						var upperBound = (this.direction - this.fieldOfVision/2) + (j * subfield);
						if (lowerBound < 0 && upperBound < 0) {
							lowerBound += TWO_PI;
							upperBound += TWO_PI;
							if (theta > lowerBound && theta < upperBound) {
								// the food item is in this subfield. make the input array corresponding to this subfield have the value d / this.length
								what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
							}
						} else if (lowerBound < 0 && upperBound > 0) {
							if (theta - TWO_PI > lowerBound || theta < upperBound) {
								what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
							}
						} else if (lowerBound > 0 && upperBound > 0) {
							if (theta > lowerBound && theta < upperBound) {
								// the food item is in this subfield. make the input array corresponding to this subfield have the value d / this.length
								what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
							}
						}
					}
				} else if (theta < this.fieldOfVision/2 && this.direction > TWO_PI - (this.fieldOfVision/2 - theta)) {

					for (var j= 1; j <= this.fieldSplit; j++) {
						
						var subfield = this.fieldOfVision / this.fieldSplit;
						var lowerBound = (this.direction - this.fieldOfVision/2) + ((j - 1) * subfield);
						var upperBound = (this.direction - this.fieldOfVision/2) + (j * subfield);
						if (lowerBound > TWO_PI && upperBound > TWO_PI) {
							lowerBound -= TWO_PI;
							upperBound -= TWO_PI;
							if (theta > lowerBound && theta < upperBound) {
								what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
							}
						} else if (lowerBound > TWO_PI && upperBound < TWO_PI) {
							if (theta > lowerBound || theta < upperBound) {
								what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
							}
						} else if (lowerBound < TWO_PI && upperBound < TWO_PI) {
							if (theta > lowerBound && theta < upperBound) {
								what_the_snake_sees[(j - 1) + this.fieldSplit] = d / this.length;
							}
						}
					}
				}

			}

		}

		return what_the_snake_sees;
	}

	

}