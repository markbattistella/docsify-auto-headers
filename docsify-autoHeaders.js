'use strict';

function getHeading( headingOptions ) {

	// if it is empty
	if(
		!headingOptions.separator	||
		// !headingOptions.start		||
		!headingOptions.levels		||
		!headingOptions.scope
	) {
		return 'No config set'
	}

	var separator = '';

	// output the correct from words
	switch (headingOptions.separator) {
		case 'decimal':
			separator = '.'
			break;
		case 'dash':
			separator = '-'
			break;
		case 'bracket':
			separator = ')'
			break;
		default:
			return;
	}

	// get othe settings
	let start	= headingOptions.start	? headingOptions.start	: '';
	let levels	= headingOptions.levels	? headingOptions.levels	: 6;
	let scope	= headingOptions.scope	? headingOptions.scope	: null;
	let path	= headingOptions.path	? headingOptions.path	: '';

	var a = [ separator, start, levels, scope, path ];
	return a;
}

// defaults - and setup
const headingOptions = {
	separator:	'',
	start:		'',
	levels:		'',
	scope:		'',
	path:		'#/',
};


// the function
function autoHeading( hook, vm ) {

	// magic here please
	const headingOptionsArray = getHeading( headingOptions );

	// get the path (but after the #)
//	var hash = window.location.hash;
//	var a= hash.replace( headingOptionsArray[4], '' );

	var t = window.location.href,
		headingStart = t.substring(t.lastIndexOf('/') + 1),
		headingStart = headingStart.substr(0, headingStart.indexOf('-'));



	// after the parse
	hook.ready(function() {

		headingStart = ( (headingOptionsArray[1] === '') ?
								headingStart : headingOptionsArray[1] );

		// set the scope
		var contentScope = document.getElementById( headingOptionsArray[3] );

		// if the scope is empty
		if( !contentScope ) {
			return;
		}

		// the array for heading numbers
		var numbers = [ 0, (headingStart-1), 0, 0, 0, 0, 0 ];

		// get the tagNames
		var elements = contentScope.getElementsByTagName('*');

		// loop through all the elements inside scope
		for( var i in elements ) {

			//
			var e = elements[i];

			var headingRegex = new RegExp("^H([1-" + headingOptionsArray[2] + "])$");

			// does the element match a heading
			if( !e ||
				!e.tagName ||
				!e.tagName.match( headingRegex )
			) {
				continue
			}

			var eLevel = RegExp.$1;
			var txt = '';

			numbers[eLevel]++;

			for( var l = 1; l <= 6; l++ ) {

				if( l <= eLevel ) {
					txt += numbers[l] + headingOptionsArray[0]
				} else {
					numbers[l] = 0;
				}
			}
			e.textContent = txt + ' ' + e.textContent.replace(/^[0-9\.\s]+/,'' );
		}

	});
}


// find heading plugin options
window.$docsify.autoHeading = Object.assign(
	headingOptions,
	window.$docsify.autoHeading
);
window.$docsify.plugins = [].concat(autoHeading, window.$docsify.plugins);
