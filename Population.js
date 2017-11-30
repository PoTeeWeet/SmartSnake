

function Population (snakes) {

	this.popsize = POPULATION_SIZE;
	this.maxfit = 0;
	this.averageFitness = 0;

	if (snakes) {
		this.snakes = snakes;
	} else {
		this.snakes = new Array(this.popsize);
		for (var i = 0; i < this.popsize; i++) {
			this.snakes[i] = new Snake();
		}
	}
	

	// mating pool array to be filled at the end of a generation
	this.matingPool = [];


	this.update = function () {
		this.snakes.forEach(function (snake) {
			if (snake.alive) {
				snake.update();	
			}
		})
	}

	this.show = function () {
		this.snakes.forEach(function (snake) {
			if (snake.alive) {
				snake.show();	
			}
			
		})
	}

	// returns true if eveery snake in the population has died
	this.isDead = function () {
		// returns true if all the snakes in the population are dead
		return this.snakes.every(function (snake) {
			return snake.alive ? false : true;
		})
	}

	this.evaluate = function () {

		for (var i = 0; i < this.snakes.length; i++) {
			// if any snakes outlived the LONGEST_LIVING snake, update LONGEST_LIVING.
			if (this.snakes[i].timeSpentAlive > LONGEST_LIVING) {
				LONGEST_LIVING = this.snakes[i].timeSpentAlive;
			}
			// calculate the fitness of the snake
			this.snakes[i].calcFitness();

			// Find the fittest snake of this generation
			if (this.snakes[i].fitness > this.maxfit) {
				this.maxfit = this.snakes[i].fitness;

			}

		}

		// If the fittest snake of this generation is fitter than the fittest ever, update MAXFIT.
		if (this.maxfit > MAXFIT) {
			MAXFIT = this.maxfit;
		}

		this.averageFitness = (this.snakes.map(function (snake) {
					return snake.fitness;
				}).
				reduce(function (accumulator, fitness) {
					return accumulator + fitness;
				}, 0)) / this.snakes.length
		// create the mating pool based on the fitness of each snake.
		for (var i = 0; i < this.snakes.length; i++) {
			var n = this.snakes[i].fitness;
			if (n === 0) n = 5;
			for (var j = 0; j < n; j++) {
				this.matingPool.push(this.snakes[i]);
			}
		}

	}

	this.selection = function () {
		var newSnakes = [];

		for (var i = 0; i < this.snakes.length; i++) {
			// Choose two random parents from mating pool
			var parentA = random(this.matingPool);
			var parentB = random(this.matingPool);

			// create a new child snake from the corssed over dna of the two parents
			var child = parentA.reproduce(parentB);

			// create a child snake with childaDNA
			newSnakes[i] = child;
		}

		var newPopulation = new Population(newSnakes); 
		for (var i = 0; i < this.matingPool.length; i++) {
			if (random() < .25) {
				newPopulation.matingPool.push(this.matingPool[i]);
			}
		}
		return newPopulation;
	}
	
}