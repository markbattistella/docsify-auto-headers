'use strict';

function getHeading( headingOptions ) {

	// if it is empty
	if(
		!headingOptions.separator	||
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
	let levels	= headingOptions.levels	? headingOptions.levels	: 6;
	let scope	= headingOptions.scope	? headingOptions.scope	: null;

	var a = [ separator, levels, scope ];
	return a;
}

// defaults - and setup
const headingOptions = {
	separator:	'',
	levels:		'',
	scope:		''
};


// the function
function autoHeaders( hook, vm ) {

	// after the parse
	hook.doneEach(function() {

		// get the variables from the cofig
		const	headingOptionsArray = getHeading( headingOptions ),

				// create them easier to read
				aSeparator	= headingOptionsArray[0],
				aLevel		= headingOptionsArray[1],
				aScope		= headingOptionsArray[2];

		//
		// MARK: - set the scope of the autoHeaders
		//

		// set the scope
		const contentScope = document.getElementById( aScope );

		// if the scope is empty
		if( !contentScope ) {
			return;
		}

		//
		// MARK: - see if we're numbering from a custom number
		//

		// find the first `p` element in scope
		const findFirstParagraph = contentScope.getElementsByTagName("P")[0].innerHTML;

		// check if the element starts with the signifier
		// `@section:`
		const startsWith = findFirstParagraph.startsWith('@autoHeader:');

		// if it starts with the signifer
		if( startsWith ) {

			// if its a success in finding the
			// `@section:` then remove it from DOM
			contentScope.getElementsByTagName("P")[0].remove();

			// get the last text after the `:`
			const sectionNumber = findFirstParagraph.substring(findFirstParagraph.lastIndexOf(':') + 1);
			var validatedSectionNumber = '';

			// if `e` is NaN or Not A Number
			if( isNaN( sectionNumber ) ) {
				return;
			} else {

				// it is a number at this point
				// but is the number + / -
				if( Math.sign( sectionNumber ) >= 0 && sectionNumber !== '') {

					// round the output in case
					validatedSectionNumber = Math.round( sectionNumber );
				} else {
					return;
				}
			}
		} else {
			// otherwise start it at 1
			// because they did put the section in
			validatedSectionNumber = 1;
		}

		// the array for heading numbers
		var numbers = [ 0, (validatedSectionNumber-1), 0, 0, 0, 0, 0 ];

		// get the tagNames
		const elements = contentScope.getElementsByTagName('*');

		// loop through all the elements inside scope
		for( var i in elements ) {

			//
			var e = elements[i];

			// limit the heading tag number in search
			var headingRegex = new RegExp("^H([1-" + aLevel + "])$");

			// does the element match a heading regex
			if( !e ||
				!e.tagName ||
				!e.tagName.match( headingRegex )
			) {
				continue
			}

			var eLevel = RegExp.$1,
				txt = '';

			numbers[eLevel]++;

			for( var l = 1; l <= 6; l++ ) {

				if( l <= eLevel ) {
					txt += numbers[l] + aSeparator
				} else {
					numbers[l] = 0;
				}
			}

			// add the number outside the heading
			// keep the anchor links :)
			e.innerHTML =  txt + ' ' + e.innerHTML.replace(/^[0-9\.\s]+/,'' );
		}

	});
}


// find heading plugin options
window.$docsify.autoHeaders = Object.assign(
	headingOptions,
	window.$docsify.autoHeaders
);
window.$docsify.plugins = [].concat(autoHeaders, window.$docsify.plugins);
