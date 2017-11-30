

function SnakeBrain (input_nodes, hidden_nodes, output_nodes, dna) {

	/* 
	**********************************************************************
	NETWORK PARAMETERS
	**********************************************************************
	*/ 

	// self reference to the number of numbers in each layer
	this.input_nodes = input_nodes;
	this.output_nodes = output_nodes;
	this.hidden_nodes = hidden_nodes;

	this.hidden_outputs;



	/* 
	**********************************************************************
	WEIGHTS	
	**********************************************************************
	*/ 

	// link weights matrices (DNA)
	if (dna) {
		this.dna = dna;
	} else {

		// The weights from the input layer to the hidden layer:
		// create a matrix that will have this.hidden_nodes many rows.
		var weights_i_h = new Array(this.hidden_nodes);
		for (var j = 0; j < weights_i_h.length; j++) {

			// And this.input_nodes many columns
			weights_i_h[j] = new Array(this.input_nodes);
			for (var q = 0; q < weights_i_h[j].length; q++) {

				// initialize the weight to be a random value among a gaussian distribution with mean 0.0 and standard deviation of (this.hidden_nodes^(-0.5));
				weights_i_h[j][q] = randomGaussian(0.0, Math.pow(this.hidden_nodes, -(0.5)));
			}
		}

		// / The weights from the hidden layer to the output layer:
		// create matrix that will have this.output_nodes many rows
		var weights_h_o = new Array(this.output_nodes);
		for (var j = 0; j < weights_h_o.length; j++) {

			// and this.hidden_nodes many columns
			weights_h_o[j] = new Array(this.hidden_nodes);
			for (var q = 0; q < weights_h_o[j].length; q++) {

				// Initialize a random weight
				weights_h_o[j][q] = randomGaussian(0.0, Math.pow(this.output_nodes, -(0.5)));
			}
		}

		// create the dna object which is just an array containing all the weights
		this.dna = [weights_i_h, weights_h_o];

	}


	

	// ---------------------------------------------------------------------------------------------

	/* 
	**********************************************************************
	ACTIVATION FUNCTION
	**********************************************************************
	*/ 

	// (sigmoid);
	this.activation_function = function (n) {
		if (typeof(n) === 'number') {
			return 1 / (1 + Math.pow(Math.E, (-n)));
		} else if (Array.isArray(n)) {
			return n.map(function (element) {
				return 1 / (1 + Math.pow(Math.E, -element));
			});
		}
		
	}

	/* 
	**********************************************************************
	INPUT UPDATE FUNCTION
	**********************************************************************
	*/ 

	this.look = function (eyes) {
		var inputs = eyes.see();
		// console.log(inputs);
		return this.query(inputs);

	},

	/* 
	**********************************************************************
	QUERY	
	**********************************************************************
	*/ 

	this.query = function (inputs) {
		// convert inputs into 2D array of the form [[i1], [i2], [i3], [i4],...,[im]]
		inputs = inputs.map(function (input) {
			return [input];
		});
		// calculate signals going into the hidden layer
		const hidden_inputs = dot(this.dna[0], inputs);

		// calculate the output from our hidden layer
		const hidden_outputs = hidden_inputs.map(this.activation_function);

		this.hidden_outputs = hidden_outputs;
		// calculate signals into final layer
		const final_inputs = dot(this.dna[1], hidden_outputs);

		// calculate the signals emerging from the final layer
		return final_inputs.map(this.activation_function);
	}

	/* 
	**********************************************************************
	MUTATE
	**********************************************************************
	*/ 

	this.mutate = function () {
		this.dna = this.dna.map(function (matrix, index) {
			return matrix.map(function (row) {
				return row.map(function (weight) {
					if (random() < MUTATION_RATE) {
						if (index === 0) {
							return randomGaussian(0.0, Math.pow(this.hidden_nodes, -(0.5)));
						} else {
							return randomGaussian(0.0, Math.pow(this.output_nodes, -(0.5)));
						}
					} else return weight;
				})
			})
		})
	}

	/* 
	**********************************************************************
	CROSSOVER
	**********************************************************************
	*/ 

	this.crossover = function (brainB) {
		// There are a lot of ways I could do this I think and I'll want to experiment with several but for this first trye I 
		// will basically just choose at random for each weight from either parent at a probability of 50/50. 
		// Really not sure if that will be any good.

		var childDNA = new Array(this.dna.length);
		for (var i = 0; i < childDNA.length; i++) {
			childDNA[i] = new Array(this.dna[i].length);
			for (var j = 0; j < this.dna[i].length; j++) {
				childDNA[i][j] = new Array(this.dna[i][j].length);
			}
		}

		// iterate through matrices in dna 
		// for (var i = 0; i < this.dna.length; i++) {
		// 	// iterate through rows within each matrix
		// 	for (var j = 0; j < this.dna[i].length; j++) {
		// 		// iterate through each weight with each row within each matrix
		// 		for (var q = 0; q < this.dna[i][j].length; q++) {

		// 			if (random() > 0.5) {
		// 				childDNA[i][j][q] = this.dna[i][j][q];
		// 			} else {
		// 				childDNA[i][j][q] = brainB.dna[i][j][q];
		// 			}
		// 		}
		// 	}
		// }



		// With this method the child is taking whole rows randomly rather than single weights
		// for (var i = 0; i < this.dna.length; i++) {
		// 	// iterate through rows within each matrix
		// 	for (var j = 0; j < this.dna[i].length; j++) {
		// 		// iterate through each weight with each row within each matrix
		// 		if (random() > 0.5) {
		// 			childDNA[i][j] = this.dna[i][j];
		// 		} else {
		// 			childDNA[i][j] = brainB.dna[i][j];
		// 		}
		// 	}
		// }

		// This method will iterate over each weight within each row of each matrix and take the average between the two parents 
		// then give the child's dna a random number with that average as the mean of a gaussian distribution with standard diviation 1/2 the difference between the 
		// two parent's weights.
		for (var i = 0; i < this.dna.length; i++) {
			// iterate through rows within each matrix
			for (var j = 0; j < this.dna[i].length; j++) {
				// iterate through each weight with each row within each matrix
				for (var q = 0; q < this.dna[i][j].length; q++) {
					// get the weight of parent A at this point
					var AWeight = this.dna[i][j][q];
					// and parentB's
					var BWeight = brainB.dna[i][j][q];
					// take their average
					var average = (AWeight + BWeight) / 2;

					childDNA[i][j][q] = randomGaussian(average, Math.abs((AWeight - BWeight) / 2));
				}
			}
		}
		return childDNA
	}

}

function dot (x, y) {
	// returns the dot product of matrices x and y
	if (x[0].length !== y.length) {
		// number of rows in the first matrix must equal the number of rows in the second matrix
		return false;
	} 
	
	// i - index of the rows of our resultant matrix
	var result = new Array (x.length);
	for (var i = 0; i < result.length; i++) {
		result[i] = new Array(y[0].length);

		// j - index of the columns of our resultant matrix
		for (var j = 0; j < result[i].length; j++) {

			// n - referes to the index of the current element within x[j] and the current element within y[i]
			var sum = 0;
			for (var n = 0; n < x[0].length; n++) {
				// sum up all the appropriate values
				sum += x[i][n] * y[n][j];
			}
			// add that sum to the appropriate index of our result
			result[i][j] = sum;
		}
	}
	return result
}
