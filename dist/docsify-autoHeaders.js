/*! docsify-autoHeaders.js v4.0.0 | (c) Mark Battistella */
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
	let scope	= headingOptions.scope	? headingOptions.scope	: "main";
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

	// get the variables from the config
	const	headingOptionsArray = getHeading( headingOptions ),

			// create variables
			arraySeparator	= headingOptionsArray[0],
			arrayLevel		= headingOptionsArray[1],
			arrayScope		= headingOptionsArray[2],
			arrayDebug		= headingOptionsArray[3];

	// reset counter
	function resetBelowLevels( currentLevel ) {
		// currentLevel is string so need to convert it to number
		for( let i = +currentLevel + 1; i <= 6; i++ ) {
			startingNumbers[i] = 0;
		}
	}

	//
	// MARK: - check if the document starts with the signifier
	//

	// get the `@autoHeader:` data
	hook.beforeEach( function( content ) {

		// get the first 12 characters
		const getFirstCharacters = content.slice( 0, 12 );

		// check if beginning with the plugin key
		if( getFirstCharacters === "@autoHeader:" ) {

			// get the first line of data
			const getFirstLine = content.split( "\n" )[0];

			// get everything after the `:`
			getHeadingNumber = getFirstLine.split( ":" )[1];

			// there is no data to continue
			if(
				!getHeadingNumber			||
				getHeadingNumber == null	||
				getHeadingNumber == ''
			) {

				// set the headerNumber to null
				getHeadingNumber = null;

			// transform the data
			} else {

				// make an array from the separator
				getHeadingNumber = getHeadingNumber.split( arraySeparator );

				// dont work with too many items in the array
				if( getHeadingNumber.length > 6 ) {

					// set the headerNumber to null
					getHeadingNumber = null;

				} else {

					// pad in the extra array items
					getHeadingNumber = getHeadingNumber.concat(
						new Array(6)		// add a new array upto 6 items
						.fill(0) )			// fill it with zeros
						.slice(0, 6)		// cut off after 6 items
						.map( x => +x );	// map the Strings to Int
				}
			}

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

		// set the scope of the automisation
		const contentScope	= document.querySelector( arrayScope );

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
		if( getHeadingNumber == null ) {

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


			// check if all the items in the array are numeric
			if( !getHeadingNumber.every( isNaN ) ) {

				// set the variable up
				var validHeadingNumber	= '';

				// get the headings into array
				const 	contentHeaders	= contentScope.querySelectorAll(
											'h1, h2, h3, h4, h5, h6'
										),

						// check if the array items are positive numbers
						positiveNumber = (element) => ( element >= 0 ),

						// rount the numbers down
						roundDown = (element) => Math.floor( element );


				// are the numbers all positive
				if( getHeadingNumber.every( positiveNumber ) ) {

					// set the starting values
					// -- minus 1 since we add immediately in the loop
					const startingNumbers	= [ 0,                       // null
												getHeadingNumber[0] - 1, // h1
												getHeadingNumber[1] - 1, // h2
												getHeadingNumber[2] - 1, // h3
												getHeadingNumber[3] - 1, // h4
												getHeadingNumber[4] - 1, // h5
												getHeadingNumber[5] - 1, // h6
										];

					// track the first run
					let firstRun = [	true,	// null
										true, 	// h1 run yet
										true,	// h2 run yet
										true,	// h3 run yet
										true,	// h4 run yet
										true,	// h5 run yet
										true	// h6 run yet
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

						// reset all level below except for the first run
					    if( !firstRun[ elementLevel ] ) {
							resetBelowLevels( elementLevel );
					    	firstRun[ elementLevel ] = false;
						}

						// loop through the headings
						for(	var levelNumber = 1;
								levelNumber <= 6;
								levelNumber++
						) {

							// if the number is lt the element number
							if( levelNumber <= elementLevel ) {
								numberText += startingNumbers[levelNumber] + arraySeparator
							}

						}

						// add the number outside the heading
						// -- keep the anchor links :)
						element.innerHTML =  numberText + ' ' + element.innerHTML.replace(/^[0-9\.\s]+/,'' );

					}

				} else {

					// if we're debugging
					if( arrayDebug ) {
						console.log( '--- autoHeaders error: start ---'  + '\n\n' +
								 	'The numbers are not positive' + '\n' +
								 	'Value: "' + getHeadingNumber + '" \n\n' +
								 	'--- autoHeaders error: end  ---'
									);
					}

					// exit out
					return;

				}

			// one of the items in the array is not numeric
			} else {

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
