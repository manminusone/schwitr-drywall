/* globals requirejs,exports */
(function(exports) {

    'use strict';
    requirejs(['vendor/canto34/canto34'], 
     function  (canto34) {

        //// lexer for schwitr language
        var schwitrLexer = new canto34.Lexer();
        schwitrLexer.addTokenType({ name: 'rulename', regexp: /^[_A-Za-z][_A-Za-z0-9]*/ });
        schwitrLexer.addTokenType({ name: 'string', regexp: /^"[^"]*"/ }); // FIXME
        schwitrLexer.addTokenType({ name: 'semicolon', regexp: /^;/ });
        schwitrLexer.addTokenType({ name: 'pipe', regexp: /^\|/ });
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.whitespaceWithNewlines());
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.integer());
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.colon());
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.openParen());
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.closeParen());
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.openBracket());
        schwitrLexer.addTokenType(canto34.StandardTokenTypes.closeBracket());

        // TODO - css lexer & parser? <http://www.w3.org/TR/CSS2/syndata.html>

        var parser = new canto34.Parser();
        var firstRule = '';
        var definedRules = {};
        var referencedRules = {};

        parser._document = function() {
            return this._rules();
        };

        parser._rules = function() {
            var ruleset = {};
            while (!this.eof() && this.la1('rulename')) {
                var thisrule = this._rule();
                if (thisrule.error) {
                	return thisrule;
                }
                firstRule = firstRule || thisrule.rulename;
                ruleset[thisrule.rulename] = thisrule;
                definedRules[thisrule.rulename] = 1;
            }
            return ruleset;
        };

        parser._rule = function() {
            var rule = {};
            
            try {
        	    rule.rulename = this.match('rulename').content;
        	    this.match('colon');
        	    rule.choices = this._choices();
        	    if (rule.choices.error) {
        	    	return rule.choices;
                }
        	    this.match('semicolon');
        	  } catch (e) {
        	  	console.log(e);
        	  	return { error: e.message };
        	  }
            return rule;
        };

        parser._choices = function() {
            var choiceList = Array();
            try {
        	    while (!this.eof() && (this.la1('rulename') || this.la1('string'))) {
        	        var thisChoice = this._atomlist();
        	        choiceList.push(thisChoice);
        	        if (this.la1('semicolon')) {
        	            break;
                    }
        	        this.match('pipe');
        	    }
        	  } catch (e) {
        	  	return { error: e.message };
        	  }
            return choiceList;
        };

        parser._atomlist = function() {
            var atoms = Array();
            while (! this.eof() && (this.la1('rulename') || this.la1('string'))) {
                var thisAtom = this._atom();
                if (thisAtom.error) {
                	return thisAtom;
                }
                atoms.push(thisAtom);
            }
            return atoms;
            
        };

        parser._atom = function() {
            if (this.la1('rulename')) {
                var a = this.match('rulename');
                referencedRules[a.content] = 1;
                return { 'type': 'CALL', 'value': a.content };
            } else if (this.la1('string')) {
                var str = this.match('string').content;
                if (str.substr(0,1) === '"') {
                    str = str.substr(1,str.length - 2);
                }
                return { 'type': 'STRING', 'value': str };
            } else {
                console.log('Unexpected token');
                return null;
            }
        }; 


        ///

        function checkRules() {
        	for (var i in referencedRules) {
                if (i !== '') {
        		  if (! definedRules[i]) {
        		  	   return { error: 'Rule for "' + i + '" not defined' };
                    }
                }
            }

        	return {};
        }

        exports.cssRules = function(css_str) {
        	var reduced_str = css_str, m;
        	reduced_str = reduced_str.replace(/[\n\r]/, ' ');
        	while ((m = reduced_str.match(/(.*)\{[^\{\}]*\}(.*)/)) !== null) {
        		reduced_str = m[1] + m[2];
            }
        	var rnames = reduced_str.match(/(p|div|span)\.(\w+)/g);
        	var retval = {};
        	if (rnames !== null) {
        		rnames.forEach(function(str) { var foo = str.split('.'); retval[foo[1]] = foo[0]; });
            }
        	return retval;
        };


        exports.parse = function(str) {
            firstRule = '';
            definedRules = {};
            referencedRules = {};

            var tokens = schwitrLexer.tokenize(str);
            // console.log(JSON.stringify(tokens));
            parser.initialize(tokens);
            var doc = parser._document();
            if (doc.error) {
            	return doc;
            }
            
            var err = checkRules();
            if (err.error) {
            	return err;
            }
            return  { firstRule: firstRule, rules: doc };
        };
    });

})(typeof exports === 'undefined' ? this.parser={} : exports);
