/* globals parser,interpreter,CodeMirror */
/* jshint -W098 */
(function() {
  'use strict';

var codeEditor, cssEditor; 

var default_css = "body { background: #fff; color: #000; font-family: Ubuntu Mono,Courier New,Courier,monospace } p.notify { color: #ccc; font-size: 36px; } ";
var default_body = "<p class='notify'> output will show up here </p>";
var current_layout = '';

var metadata_form = '<div id="metadata-form" title="Metadata"> <form> <fieldset> <label for="title">Title</label> <input type="text" name="title" id="title" class="text ui-widget-content ui-corner-all">' +
	'<label for="desc">Description</label> <input type="text" name="desc" id="desc" class="text ui-widget-content ui-corner-all">' +
	'<label for="keywords">Keywords</label> <ul id="keywords"></ul>' +
	'</fieldset> </form> </div>';
var infoWindowOpen = false;

// the CodeMirror divs need to be resized to the width/height of the containing div
function resizeCM(paneName, paneElement, paneState, paneOptions, layoutName) {
	codeEditor.setSize($('.codeClass').innerWidth(), $('.codeClass').innerHeight() - $('#codeHdr').height());
	cssEditor.setSize($('.cssClass').innerWidth(), $('.cssClass').innerHeight() - $('#cssHdr').height());
}


function layout1() {
	if (current_layout !== '') { initialCode = codeEditor.getValue(); initialCss = cssEditor.getValue(); current_layout.destroy(); current_layout = ''; initialTitle = $('#title').val(); initialDesc = $('#desc').val(); initialKeywords = $('#keywords').tagit('assignedTags').join(','); }
	$('#editor-div').empty();
	$('#editor-div').append(
		'<div class="ui-layout-center cssClass" id="cssDiv"> <div id="cssHdr" class="ui-layout-north divheader"> CSS </div><div id="cssEditor" class="ui-layout-center"></div> </div>'+
		' <div class="ui-layout-east outputClass" id="outputDiv0"> <div id="outputHdr" class="ui-layout-north divheader"> Output <input type="submit" id="updateButton" value=" Update " /> </div> <div id="outputDiv" class="ui-layout-center"></div> </div>' +
		' <div class="ui-layout-west codeClass" id="codeDiv"><div id="codeHdr" class="ui-layout-north divheader">Schwitr code <input type="submit" id="saveButton" value=" Save " /> <input type="submit" id="infoButton" value=" Info" /> </div><div id="codeEditor" class="ui-layout-center"></div></div>' +
		metadata_form
	);
    $('#keywords').tagit();
  current_layout = $('#editor-div').layout({
      
      defaults: {
          resizable: true,
          closable: true,
          slidable:true
      },
      
      north: {
          resizable: false,
          closable: false,
          spacing_open: 0,
          spacing_closed: 0,
          size: 72
      },
      center: { /* CSS */
      	margin: 0,
      	padding: 0,
      	childOptions: {
	      	margin: 0,
	      	padding: 0,
	      		north: {
          resizable: false,
          closable: false,
          spacing_open: 0,
	      			margin: 0, padding: 0,
              spacing_closed: 0,
	      			size: 40
	      		},
	      		center: {
	      			margin: 0, padding: 0
	      		}
	      },
				size: 0.33
      },
      east: { /* OUTPUT */
      	margin: 0,
      	padding: 0,
      	childOptions: {
      	margin: 0,
      	padding: 0,
      		north: {
          resizable: false,
          closable: false,
      			spacing_open: 0,
            spacing_closed: 0,
      			size: 40
      		},
      		center: {
      			margin: 0, padding: 0
      		}
      	},
				size: 0.33
      },
      west: { /* CODE */
      	margin: 0,
      	padding: 0,
      	childOptions: {
      	margin: 0,
      	padding: 0,
 	      		north: {
          resizable: false,
          closable: false,
      			spacing_open: 0,
            spacing_closed: 0,
      			size: 40
      		},
      		center: {
      			margin: 0, padding: 0
      		}
      	},
				size: 0.33
      },

      onresize: resizeCM
      
  });
}

function layout2() {
	if (current_layout !== '') { initialCode = codeEditor.getValue(); initialCss = cssEditor.getValue(); current_layout.destroy(); current_layout = ''; initialTitle = $('#title').val(); initialDesc = $('#desc').val(); initialKeywords = $('#keywords').tagit('assignedTags').join(','); }
	$('#editor-div').empty();
	$('#editor-div').height( $(window).height() - 72 );
	$('#editor-div').append('<div class="ui-layout-center cssClass" id="cssDiv"> <div id="cssHdr" class="ui-layout-north divheader"> CSS </div><div id="cssEditor" class="ui-layout-center"></div> </div> '+
		// '<div class="ui-layout-north headerClass" id="headerDiv">  </div> '+
		'<div class="ui-layout-west codeClass" id="codeDiv"><div id="codeHdr" class="ui-layout-north divheader">Schwitr code <input type="submit" id="saveButton" value=" Save " /> <input type="submit" id="infoButton" value=" Info" /> </div><div id="codeEditor" class="ui-layout-center"></div></div> '+
		'<div class="ui-layout-south outputClass" id="outputDiv0"> <div id="outputHdr" class="ui-layout-north divheader"> Output <input type="submit" id="updateButton" value=" Update " /> </div> <div id="outputDiv" class="ui-layout-center"></div> </div>' +
		metadata_form
	);
    $('#keywords').tagit();
		
  current_layout = $('#editor-div').layout({

      defaults: {
          resizable: true,
          closable: true,
          slidable:true
      },
      
      north: {
          resizable: false,
          closable: false,
          size: 72
      },
      center: { /* CSS */
      	margin: 0,
      	padding: 0,
      	childOptions: {
	      	margin: 0,
	      	padding: 0,
	      		north: {
              resizable: false,
              closable: false,
	      			margin: 0, padding: 0,
	      			spacing_open: 0, spacing_closed: 0,
	      			size: 44
	      		},
	      		center: {
              resizable: false,
	      			spacing_open: 0, spacing_closed: 0,
	      			margin: 0, padding: 0
	      		}
	      },
				size: 0.5
      },
      south: { /* OUTPUT */
      	margin: 0,
      	padding: 0,
      	childOptions: {
      	margin: 0,
      	padding: 0,
      		north: {
          resizable: false,
          closable: false,
	      			spacing_open: 0, spacing_closed: 0,
      			size: 44
      		},
      		center: {
              resizable: false,
	      			spacing_open: 0, spacing_closed: 0,
      			margin: 0, padding: 0
      		}
      	}  ,size: 0.5
      },
      west: { /* CODE */
      	margin: 0,
      	padding: 0,
      	childOptions: {
      	margin: 0,
      	padding: 0,
 	      		north: {
          resizable: false,
          closable: false,
	      			spacing_open: 0, spacing_closed: 0,
      			size: 44
      		},
      		center: {
              resizable: false,
	      			spacing_open: 0, spacing_closed: 0,
      			margin: 0, padding: 0
      		}
      	},
				size: 0.5
      },

      onresize: resizeCM
	});
}

function layout3() {
	if (current_layout !== '') { initialCode = codeEditor.getValue(); initialCss = cssEditor.getValue(); current_layout.destroy(); current_layout = ''; initialTitle = $('#title').val(); initialDesc = $('#desc').val(); initialKeywords = $('#keywords').tagit('assignedTags').join(','); }
	$('#editor-div').empty();
	$('#editor-div').height( $(window).height() - 72 );
	$('#editor-div').append('<div class="ui-layout-center" style="padding: 0">' +
        '<div class="ui-layout-center codeClass" id="codeDiv"> <div id="codeHdr" class="ui-layout-north divheader">Schwitr code <input type="submit" id="saveButton" value=" Save " /> <input type="submit" id="infoButton" value=" Info" /> </div><div id="codeEditor" class="ui-layout-center"></div> </div> ' +
        '<div class="ui-layout-south cssClass" id="cssDiv"> <div id="cssHdr" class="ui-layout-north divheader"> CSS </div><div id="cssEditor" class="ui-layout-center"></div> </div> ' +
        '</div> ' + 
        '<div class="ui-layout-west outputClass" id="outputDiv0"><div id="outputHdr" class="ui-layout-north divheader"> Output <input type="submit" id="updateButton" value=" Update " /> </div> <div id="outputDiv" class="ui-layout-center"></div></div> ' + 
        // '<div class="ui-layout-north">North</div>'
		metadata_form
    );
    $('#keywords').tagit();
    
    current_layout = $('#editor-div').layout({
            defaults: {
                resizable: true,
                closable: true,
                slidable:true
            },
            
            north: {
                resizable: false,
                closable: false,
                size: 72
            },
            center: {
                
                
                childOptions: {
                    center: {
                        size: 0.5
                    },
                    south: {
                        size: 0.5
                    }
                }
            },
            west: {
                size: 0.5
            },
            south: {
                size: 0.5
            },

      onresize: resizeCM
            
    });
}



function updateOutput(css, str) {

	// remove @import directives from CSS, because those need to come first in stylesheet
	css = ' ' + css + ' ';
	var imports = '', m = '';
	while ((m = /([\s\S]+)(@import\s[^;]+;)([\s\S]+)/.exec(css)) !== null) {
		imports += m[2];
		css = m[1] + m[3];
	}

    var htmldoc = '<html><head>'+
	'<link href="http://fonts.googleapis.com/css?family=Ubuntu+Mono" rel="stylesheet" type="text/css">'+
	'<style>' + imports + default_css + css + '</style>' + 
	'</head>'+
	'<body>'+
	(str && str !== '' ? str : default_body) +
	'</body></html>';
    $('#outputIframe').attr('src','data:text/html,' + encodeURIComponent(htmldoc));
}

function decodeHtml(str) {
	return str
	  .replace(/&quot;/g, '"')
	  .replace(/&amp;/g, '&')
	  .replace(/&lt;/g, '<')
	  .replace(/&gt;/g, '>')
	;
}

function setupViewPage() {
	
	if (initialCode !== '') {
		var rules = parser.parse(initialCode);
		if (rules.error) {
			alert(rules.error);
		} else {
			var containers = parser.cssRules(initialCss);
			for (var rname in containers) {
				if (rules.rules[rname]) {
					rules.rules[rname].container = containers[rname];
				}
			}
		
			var i = interpreter.interpreter();
			var stat = i.init(rules);
		
			if (stat.error) {
				alert(stat.error);
			} else {
				
				i.run();
				if (! i.overflow) {
	        $('body').html(
						'<style>' + default_css + initialCss + '</style>' + 
						i.value()
						);
				} else {
					alert('stack overflow');
				}
			}
		}
	} else if (initialOutput !== '') {
		$('body').html(
			'<style>' + default_css + initialCss + '</style>' + 
			initialOutput
		);
	}
}

function confirmLeave() {
	return "You have unsaved changes.";
}

function setupCodeMirror() {
	codeEditor = CodeMirror($('#codeEditor')[0], { mode: 'schwitr', lineWrapping: true, lineNumbers: true, autofocus: true, value: initialCode });
	cssEditor = CodeMirror($('#cssEditor')[0], { mode: 'css', lineWrapping: true, lineNumbers: true, value: initialCss });

	// metadata form
	$('#title').val(initialTitle);
	$('#desc').val(initialDesc);
	var tmpArray = initialKeywords.split(',');
	for (var i in tmpArray) {
		if (i !== '') {
			$('#keywords').tagit('createTag',tmpArray[i]);
		}
	}

	codeEditor.on('change', function() { $(window).bind('beforeunload',confirmLeave); });
	cssEditor.on('change', function() { $(window).bind('beforeunload',confirmLeave); });

    // If the CM doesn't take up the whole div, clicking on the non-editor portion of the div will focus to the appropriate editor
	$('#codeDiv').click(function() { 
		if (! codeEditor.hasFocus()) {
			codeEditor.focus();
		}
	});

	$('#cssDiv').click(function() {
		if (! cssEditor.hasFocus()) {
			cssEditor.focus();
		}
	});

	$('#outputDiv').html( '<iframe id="outputIframe" type="content" frameborder="0" width="100%"></iframe>');
	updateOutput('', '');

	$('#updateButton').button().click(function(e) { 
		var rules = parser.parse(codeEditor.getValue());
		if (rules.error) {
			alert(rules.error);
		} else {
 			console.log(rules);
			var containers = parser.cssRules(cssEditor.getValue());
			for (var rname in containers) {
				if (rules.rules[rname]) {
					rules.rules[rname].container = containers[rname];
				}
			}
	
			var i = interpreter.interpreter();
			var stat = i.init(rules);
	
			if (stat.error) {
				alert(stat.error);
			} else {
				
				i.run();
				if (! i.overflow) {
	  			updateOutput(cssEditor.getValue() || default_css, i.value() || default_body);
				} else {
					console.log('stack overflow');
					alert('stack overflow');
				}
			}
		}
  	});
	$('#saveButton').button().click(function(e) { 
		var doc_id, m = window.document.URL.match(/edit\/(\w+)/);
		if (m)  { doc_id = m[1]; }
		var parent_id, m2 = window.document.URL.match(/clone\/(\w+)/);
		if (m2) { parent_id = m2[1]; }

		$.post('/doc/save', { 
			grammar: codeEditor.getValue(), 
			css: cssEditor.getValue(), 
			title: $('#title').val(),
			desc: $('#desc').val(),
			keywords: $('#keywords').tagit('assignedTags'),
			hash: doc_id,
			parentHash: parent_id
		}, function(data) { 
			$(window).unbind('beforeunload',confirmLeave);
			if (data.hash !== doc_id) {
				// update the client's URL with the new key
				if (window.history.pushState) {
					window.history.pushState('','Title',window.location.origin + '/doc/edit/' + data.hash);
					$('#doc-format-div').html('<a href="#">HTML</a> | <a href="#">plaintext</a> | <a href="#">xml</a> | <a href="#">javascript</a>');
				} else {
					window.location = window.location.origin + '/doc/edit/' + data.hash;
				}
			}
		});
	});
}

function setupMetadataForm() {
	$('#metadata-form').dialog( { autoOpen: false } ); 
	$('#infoButton').button().click(function(e) {
		if (infoWindowOpen)  {
			$('#metadata-form').dialog('close');
		} else {
			$('#metadata-form').dialog({ position: { my: 'left top', at: 'left bottom', of: $('#infoButton') } });
			$('#metadata-form').dialog('open');
		}
		infoWindowOpen = ! infoWindowOpen;
	});
	
}

function setupEditPage() {

	layout2();
	setupCodeMirror();
	setupMetadataForm();

	$('#layout1_img').click(function() {
		layout1();
		$('#layout1_img').removeClass('hdr-unselected-img').addClass('hdr-selected-img');
		$('#layout2_img').removeClass('hdr-selected-img').addClass('hdr-unselected-img');
		$('#layout3_img').removeClass('hdr-selected-img').addClass('hdr-unselected-img');
		setupCodeMirror();
		setupMetadataForm();
        $('#editor-div').ready(function() { $(window).resize(); });
	});

	$('#layout2_img').click(function() {
		layout2();
		$('#layout1_img').removeClass('hdr-selected-img').addClass('hdr-unselected-img');
		$('#layout2_img').removeClass('hdr-unselected-img').addClass('hdr-selected-img');
		$('#layout3_img').removeClass('hdr-selected-img').addClass('hdr-unselected-img');
		setupCodeMirror();
		setupMetadataForm();
        $('#editor-div').ready(function() { $(window).resize(); });
	});

	$('#layout3_img').click(function() {
		layout3();
		$('#layout1_img').removeClass('hdr-selected-img').addClass('hdr-unselected-img');
		$('#layout2_img').removeClass('hdr-selected-img').addClass('hdr-unselected-img');
		$('#layout3_img').removeClass('hdr-unselected-img').addClass('hdr-selected-img');
		setupCodeMirror();
		setupMetadataForm();
        $('#editor-div').ready(function() { $(window).resize(); });
	});

	$('#new-doc-img').click(function() {
		// TODO - add a check for an existing hash. Prompt to save, also.

		var do_it = false;
		if (window.document.URL.match(/edit\/(\w+)/)) {  // editing an existing document
			if (confirm('Continue without saving current document?')) {
				do_it = true;
			}

		} else {  // no saved doc, so check with the user to see if they want to save
			if (codeEditor.getValue() !== '' || cssEditor.getValue() !== '') {
				if (confirm('Continue without saving current document?')) {
					do_it = true;
				}
			}
		}

		if (do_it) {
				if (window.history.pushState) {
					codeEditor.setValue('');
					cssEditor.setValue('');
					updateOutput('','');
					window.history.pushState('','Title',window.location.origin + '/doc/edit');
				} else {
					window.location = window.location.origin + '/doc/edit';
				}

		}
	});
}

function populate(hash) {
	$.getJSON('/doc/'+hash+'/json', function(data) {
		codeEditor.setValue(data.grammar);
		cssEditor.setValue(data.css);
		// metadata form
		$('#title').val(data.title);
		$('#desc').val(data.desc);
		for (var i in data.keywords) {
			if (i !== '') {
				$('#keywords').tagit('createTag',data.keywords[i]);
			}
		}

	});
}

var initialCode='', initialOutput = '', initialCss='';
var initialTitle='', initialDesc = '', initialKeywords='';
$(document).ready(function() {
  setupEditPage();
  var resizeMe = function() { $('#editor-div').height( $(window).height() - 184 ).width( $(window).width() - 32); };
  $(window).resize(resizeMe);
  $('#editor-div').ready(function() { $(window).resize(); });

  $(window).bind('keydown', function(event) {
  	if (event.ctrlKey || event.metaKey) {
  		switch (String.fromCharCode(event.which).toLowerCase()) {
  			case 's':
  				event.preventDefault();
  				console.log('CTRL S');
  				$('#saveButton').click();
  				break;
  			case 'r':
  				event.preventDefault();
  				console.log('CTRL R');
  				$('#updateButton').click();
  				break;
  		}
  	}
  });
});

}());
