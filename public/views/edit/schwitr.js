/* globals  CodeMirror,require,define */
/* jshint unused:vars */
(function(mod) {
    'use strict';
  if (typeof exports === "object" && typeof module === "object") {// CommonJS
    mod(require("vendor/codemirror/lib/codemirror"), require("views/edit/schwitr"), require("vendor/codemirror/mode/meta"));
  } else if (typeof define === "function" && define.amd) {// AMD
    define(["vendor/codemirror/lib/codemirror", "views/edit/schwitr", "vendor/codemirror/mode/meta"], mod);
  } else { // Plain browser env
    mod(CodeMirror);
  }
})(function(CodeMirror) {
    'use strict';
    CodeMirror.defineMode('schwitr', function(config, parserConfig) {

        // INTERFACE
        
        return {
            startState: function() {
                return {
                    currentState:  [ 'none' ] // not currently processing any rule
                };
            },
            
            token: function(stream, state) {
                var seenStar;
                
                // look for comments
                stream.eatSpace();
                
                if (state.currentState[0] === 'comment') { // multi-line comment
                    stream.next();
                    
                    seenStar = false;
                    while (! stream.eol()) {
                        if (stream.peek() === '/' && seenStar) { // found the end of comment
                            stream.next();
                            state.currentState.shift(); // remove comment state
                            return 'comment';
                        }
                        seenStar = (stream.next() === '*');
                    }
                    
                    return 'comment'; // end of line, leave comment state on stack
                }
                
                if (stream.peek() === '/') { // could be a comment
                    stream.next();
                    if (stream.peek() === '/') { // comment to end of line
                        stream.skipToEnd();
                        return 'comment';
                    } else if (stream.peek() === '*') { // start of possible multi-line comment
                        state.currentState.unshift('comment');
                        stream.next();
                        
                        seenStar = false;
                        while (! stream.eol()) {
                            if (stream.peek() === '/' && seenStar) { // found the end of comment
                                stream.next();
                                state.currentState.shift(); // remove comment state
                                return 'comment';
                            }
                            seenStar = (stream.next() === '*');
                        }
                        
                        return 'comment'; // end of line, leave comment state on stack
                    } else { // non-comment use of slash
                        return 'operator';
                    }
                } else if (stream.peek() === '"') { // string const
                    state.currentState.unshift('string');
                    stream.next();
                    var seenBackslash = false;
                    while (! stream.eol()) {
                        if (stream.peek() === '"' && ! seenBackslash) {
                            stream.next();
                            state.currentState.shift();
                            return 'string';
                        }
                        seenBackslash = (stream.next() === '\\');
                    }
                    state.currentState.shift();
                    return 'string';  // unterminated string, assuming we'll eventually terminate it
                } else if (/[_A-Za-z]/.test(stream.peek())) { // beginning of rule identifier
                    var rulename = '';
                    while (! stream.eol() && /[_A-Za-z]/.test(stream.peek())) {
                        rulename += stream.next();
                    }
                    console.log('read rulename ' + rulename);
                    state.currentState.unshift('expecting-colon'); // read rule name, expecting ':'
                    return 'variable-2';
                } else if (state.currentState[0] === 'expecting-colon' && stream.peek() === ':') {
                    stream.next();
                    state.currentState.shift();
                    state.currentState.unshift('expecting-atoms');
                    return 'operator';
                } else if (state.currentState[0] === 'expecting-atoms' && stream.peek() === ';') {
                    stream.next();
                    state.currentState.shift(); // end of rule
                    return 'operator';
                } else {
                    console.log('operator');
                    stream.next();
                    return 'operator';
                }
                
                
                console.log('unknown state at character ' + stream.next() + ' at state ' + state.currentState[0]);
                return 'operator';
                                
            },
            
            indent: function(state, textAfter) {
                return CodeMirror.Pass;
            }
        };

    }, 'schwitr');
});