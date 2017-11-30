
function Food () {
	// food will be the same size as our snake body parts
	this.diameter = BODY_PARTS;

	// specify the range that the food can spawn in
	var xmin = this.diameter/2;
	var xmax = COURSE_WIDTH - this.diameter/2 
	var ymin = this.diameter/2;
	var ymax = COURSE_HEIGHT - this.diameter/2;

	// randomly choose spawning position within range
	this.position = createVector(random(xmin, xmax), random(ymin, ymax));

	// randomly choose a color for the food
	this.color = [random(25, 255), random(25, 255), random(25, 255)];

	// draw the food on the canvas
	this.show = function () {

		push();
		translate(this.position.x, this.position.y);
		fill(...this.color);
		ellipse(0, 0, this.diameter, this.diameter);
		pop()
	}

	// retrieve the color array to be passed into the snake object to produce the new body part with the same color
	this.getColor = function () {
		return this.color;
	}
}