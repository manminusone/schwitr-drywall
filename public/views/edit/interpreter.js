/* globals exports */
/* jslint -W083 */
(function(exports) {

'use strict';

function Interpreter() { }

Interpreter.prototype.init = function(options) {
    this.state = Array();
    this.overflow = false;
    this.done = false;
    this.stacksize = 10000;
    if (options) {
		if (options.rules) { this.rules = options.rules; }
		if (options.stacksize) { this.stacksize = options.stacksize; }
		if (options.firstRule) { this.firstRule = options.firstRule; this.state = [ { 'type': 'CALL', 'value': options.firstRule } ]; }
    }
    if (! options.firstRule) {
		console.log('WARN: no first rule defined');
		return { error: 'No first rule defined ' };
	} else if (! this.terminates()) {
		console.log('WARN: grammar does not terminate');
		return { error: 'Grammar does not terminate' };
	}
	return { OK: 1 };
};

Interpreter.prototype.reset = function() {
    this.state = [ { 'type': 'CALL', 'value': this.firstRule } ];
    this.overflow = false;
    this.done = false;
};
//

Interpreter.prototype.terminates = function(options) {
    // Determine cycles in the grammar by building a graph of rule usage,
    // and confirming whether or not the first rule may terminate.
    var graph = {};
    var terminal = {};
    for (var key in this.rules) {
    	if (key !== '') {
			var c = this.rules[key].choices;
			// console.log('-- choices = ' + JSON.stringify(c));
			terminal[key] = false;
			graph[key] = {};
			for (var iter in c) {
				if (iter !== '') {
			    	var this_c = c[iter];
			    	// console.log('-- inspecting ' + JSON.stringify(this_c));
			    	var this_is_terminal = true;
			    	for (var n = 0; n < this_c.length; ++n) {
						if (this_c[n].type === 'CALL'){
				    		this_is_terminal = false;
				    		graph[key][this_c[n].value] = 1;
						}
					}
			    	// console.log('-- terminal = ' + this_is_terminal);
				    if (this_is_terminal) {
						terminal[key] = true;
						break;
			    	}
			    }
			}
		}
    }
    // depth-first search
    // It's sufficient to determine whether or not the starting symbol can be be converted to
    // a terminal rule option. The reached_terminal variable is updated when this happens.
    var nodes = Array(), discovered = {};
    nodes.push(options && options.firstRule ? options.firstRule : this.firstRule);
    var reached_terminal = false;
    while (nodes.length > 0 && !reached_terminal) {
		var current_node = nodes.pop();
		if (terminal[current_node]) {
		    reached_terminal = true;
		} else if (! discovered[current_node]) {
		    discovered[current_node] = true;
		    for (key in graph[current_node]) {
				if (key !== '') { nodes.push(key); }
			}
		}
    }
    return reached_terminal;
};

var choices = {};
Interpreter.prototype.choose = function(choice_id,arr) {
    if (arr.length === 1) {
      choices[choice_id] = 0;
    } else if (choices[choice_id] === undefined) {
      choices[choice_id] = Math.floor(Math.random() * arr.length);
    } else if (arr.length > 1) {
      var this_rand;
      do {
      	this_rand = Math.floor(Math.random() * arr.length);
      } while (this_rand === choices[choice_id]);
      choices[choice_id] = this_rand;
    }
    
    return arr[choices[choice_id]];
};

function _value(arr, format) {
    var retval = '';
    var iter;
    // console.log('----------------------------------');
    // console.log(arr);
    // console.log('----------------------------------');
    for (iter in arr) {
		if (arr[iter].type) {
	    	switch (arr[iter].type) {
			case 'CALL':
			    retval += '<'+arr[iter].value+'> ';
		    	break;
			case 'STRING':
			    retval += arr[iter].value;
			    break;
			case 'RULE-START':
				if (format === 'html' && arr[iter].container) {
					retval += '<'+ arr[iter].container + ' class="' + arr[iter].rulename + '">';
				} else if (format === 'xml') {
					retval += '<' + arr[iter].rulename + '>';
				}
				console.log('- open ' + retval);
				break;
			case 'RULE-END':
				if (format === 'html' && arr[iter].container) {
					retval += '</' + arr[iter].container + '>';
				} else if (format === 'xml') {
					retval += '</' + arr[iter].rulename + '>';
				}
				console.log('- close ' + retval);
				break;
			default:
		    	retval += '<? ' + JSON.stringify(arr[iter].value) + '>';
	    	}
	 	} else if (arr[iter].length) {
	    	retval += '[ ' + _value(arr[iter]) + '] ';
		}
    }
    return retval;
}

Interpreter.prototype.value = function() {
	var format = 'html';
	if (arguments.length >= 1 && (arguments[0] === 'text' || arguments[0] === 'xml')) {
		format = arguments[0];
	}
    return _value(this.state, format);
};


Interpreter.prototype.step = function() {
    var new_state = Array();	
    var iter = 0;
    this.done = true;
    while (iter < this.state.length) {
	if (this.state[iter].type) {
	    switch (this.state[iter].type) {
		case 'CALL':
		    var thisRule = this.rules[this.state[iter].value];
		    new_state.push({ 'type': 'RULE-START', 'rulename': thisRule.rulename, 'container': thisRule.container });
		    new_state.push(this.choose(this.state[iter].value, thisRule.choices));
		    new_state.push({ 'type': 'RULE-END', 'rulename': thisRule.rulename, 'container': thisRule.container });
		    this.done = false;
		    break;
		case 'RULE-START':
		case 'RULE-END':
		case 'STRING':
		    new_state.push(this.state[iter]);
		    break;

		default:
		    // console.log('WARN: UNKNOWN STATE ' + this.state[iter].type);
	    }
	} else if (this.state[iter].length) {  // array 
	    this.state[iter].forEach(
			function(item) {
			    new_state.push(item);
			}
	    );
	    this.done = false;
	}
	++iter;
    }

    if (new_state.length > this.stacksize) {
	this.done = true;
	this.overflow = true;
    }
    console.log('new stack = ' + JSON.stringify(new_state));
    this.state = new_state;
};

Interpreter.prototype.run = function() {
    while (! this.done && ! this.overflow) {
		this.step();
	}
};

exports.interpreter = function() { return new Interpreter(); };

})(typeof exports === 'undefined' ? this.interpreter = {} : exports);