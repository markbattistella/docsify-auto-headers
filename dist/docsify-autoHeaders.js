/*! docsify-autoHeaders.js v3.0.0 | (c) Mark Battistella */
'use strict';

function getHeading( headingOptions ) {

	// if it is empty
	if(
		!headingOptions.separator	&&
		!headingOptions.levels		&&
		!headingOptions.scope
	) {
		return 'No config set'
	}

	// blank separator
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
	let debug	= headingOptions.debug == true	? 1	: 0;

	// return the array
	return [ separator, levels, scope, debug ];
}

// defaults - and setup
const headingOptions = {
	separator:	'',
	levels:		'',
	scope:		''
};


// the function
function autoHeaders( hook, vm ) {

	// make the variables global
	var getHeadingNumber = null;


	//
	// MARK: - check if the document starts with the signifier
	//

	// get the `@autoHeader:` data
	hook.beforeEach( function( content ) {

		// get the first 12 characters
		const getFirstCharacters = content.slice( 0, 12 );

		// check if beginning with the <key>
		if( getFirstCharacters === '@autoHeader:' ) {

			// get the first line of data
			const getFirstLine = content.split('\n')[0];

			// get everything after the `:`
			getHeadingNumber = getFirstLine.split(':')[1];

			// remove the line
			var cleanedContent = content.replace( getFirstLine, '' );

			// return the cleaned content
			return cleanedContent;

		} else {

			// set the headerNumber to null
			getHeadingNumber = null;
		}
	});


	//
	// MARK: - add the heading numbers
	//

	hook.doneEach( function() {

		// get the variables from the config
		const	headingOptionsArray = getHeading( headingOptions ),

				// create variables
				arraySeparator	= headingOptionsArray[0],
				arrayLevel		= headingOptionsArray[1],
				arrayScope		= headingOptionsArray[2],
				arrayDebug		= headingOptionsArray[3];

		// set the scope of the automisation
		const contentScope		= document.querySelector( arrayScope );

		// if the scope is empty
		if( !contentScope && arrayDebug ) {
			console.log(	'--- autoHeaders error: start ---'  + '\n' +
							'The "scope" entry is not valid :(' + '\n' +
							'--- autoHeaders error: end  ---'
						);

			// exit out
			return;
		}


		// MARK: - are we running autoHeaders
		if(
			!getHeadingNumber			||
			getHeadingNumber == null	||
			getHeadingNumber == ''
		) {

			// if we're debugging
			if( arrayDebug ) {
				console.log( '--- autoHeaders error: start ---'    + '\n\n' +
						 	'The "start" number is empty or null' + '\n' +
						 	'Logged value: "' + getHeadingNumber + '" \n\n' +
						 	'--- autoHeaders error: end  ---'
							);
			}

		// no errors
		} else {

			// but is it a number
			if( isNaN( getHeadingNumber ) ) {

				// if we're debugging
				if( arrayDebug ) {
					console.log( '--- autoHeaders error: start ---'  + '\n\n' +
							 	'The "start" number is not numeric' + '\n' +
							 	'Value: "' + getHeadingNumber + '" \n\n' +
							 	'--- autoHeaders error: end  ---'
								);
				}

				// exit out
				return;

			} else {

				// get the headings into array
				const contentHeaders	= contentScope.querySelectorAll(
											'h1, h2, h3, h4, h5, h6'
										);

				// set the variable up
				var validHeadingNumber	= '';

				// is the number positive
				if( Math.sign( getHeadingNumber ) >= 0 ) {

					// round the output down
					validHeadingNumber = Math.floor( getHeadingNumber );

				} else {

					// exit out
					return;
				}

				// TODO: set array in config
				// set the starting values
				const startingNumbers	= [ 0,						// null
											validHeadingNumber - 1,	// h1
											0,						// h2
											0,						// h3
											0,						// h4
											0,						// h5
											0						// h6
									];

				// loop through all the elements inside scope
				for( var item in contentHeaders ) {

					// this element from item number
					var element		= contentHeaders[item],
						numberText	= '';

					// limit the heading tag number in search
					const headingRegex = new RegExp(	'^H([1-'	+
														arrayLevel	+
														'])$'
													);

			 		// does the element match a heading regex
		 			if( !element			||
		 				!element.tagName	||
		 				!element.tagName.match( headingRegex )
		 			) {

						// return to beginning of loop
		 				continue;
		 			}

					// return the heading level number
					var elementLevel = RegExp.$1;

					// add `1` to the array numbers
					startingNumbers[elementLevel]++;

					//
					for(	var levelNumber = 1;
							levelNumber <= 6;
							levelNumber++
					) {

						if( levelNumber <= elementLevel ) {
							numberText += startingNumbers[levelNumber] + arraySeparator
						} else {
							startingNumbers[levelNumber] = 0;
						}
					}

					// add the number outside the heading
					// keep the anchor links :)
					element.innerHTML =  numberText + ' ' + element.innerHTML.replace(/^[0-9\.\s]+/,'' );

				}
			}
		}
	});
}


// find heading plugin options
window.$docsify.autoHeaders = Object.assign(
	headingOptions,
	window.$docsify.autoHeaders
);
window.$docsify.plugins = [].concat(autoHeaders, window.$docsify.plugins);
