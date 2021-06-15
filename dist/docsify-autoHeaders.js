/*
 * docsify-autoHeaders.js v4.1.0
 * (https://markbattistella.github.io/docsify-autoHeaders/)
 * Copyright (c) 2021 Mark Battistella (@markbattistella)
 * Licensed under MIT
 */

//
// MARK: - javascript policy
//
'use strict';



//
// MARK: - default values
//
const autoHeaderOptions = {
	separator:	'',
	custom:		'',
	levels:		'',
	scope:		'',
	debug:		false
}



//
// MARK: - get the index.html options
//
function getAutoHeadersOptions( autoHeaderOptions ) {

	// check for empty config
	if(
		!autoHeaderOptions.separator	||
		!autoHeaderOptions.levels		||
		!autoHeaderOptions.scope
	) {
		return console.error(
			'ERROR: config settings not set'
		)
	}

	// blank separator
	let separator = (
		autoHeaderOptions.separator == 'other' ?
			autoHeaderOptions.custom ?
				autoHeaderOptions.custom : '_'
			: ''
	);

	// output the correct from words
	switch( autoHeaderOptions.separator ) {

		case 'decimal'	:
			separator = '.';
			break;

		case 'dash'		:
			separator = '-';
			break;

		case 'bracket'	:
			separator = ')';
			break;

		case 'other'	:
			separator = separator;
			break;

		default:
			return;
	}

	// get other settings
	let levels = (
		autoHeaderOptions.levels ?
			autoHeaderOptions.levels : 6
	);

	let scope = (
		autoHeaderOptions.scope ?
			autoHeaderOptions.scope : "main"
	);

	let debug = (
		autoHeaderOptions.debug === true ?
			true : false
	);

	// return the array
	return [
		separator,
		levels,
		scope,
		debug
	];
}



//
// MARK: - main function
//
function autoHeaders( hook, vm ) {

	//
	// MARK: - safety
	//
	if( getAutoHeadersOptions( autoHeaderOptions ) === undefined ) {
		return;
	}


	//
	// MARK: - variables
	//

	let getHeadingNumber = null;

	// get the options variables
	const getAutoHeadersOptionsArray = getAutoHeadersOptions(
		autoHeaderOptions
	),

	// create new variables
	optionsSeparator = getAutoHeadersOptionsArray[ 0 ],
	optionsLevel     = getAutoHeadersOptionsArray[ 1 ],
	optionsScope     = getAutoHeadersOptionsArray[ 2 ],
	optionsDebug     = getAutoHeadersOptionsArray[ 3 ],

	// get the heading range from options
	setHeadingRange = ( headingInputValue ) => {

		// variables
		let output = '';

		// 1. check if is a string
		if(
			typeof optionsLevel === 'string'
		) {

			// set it as H1 to
			output = `H1-${ headingInputValue }`;

		// 2. check if is object and not null
		} else if(
			typeof optionsLevel === 'object' &&
			optionsLevel !== null
		) {

			// error catching

			// -- start has to be less than finish
			if( headingInputValue.start > headingInputValue.finish ) {
				return console.log( 'ERROR: heading start level cannot be greater than finish level' );
			}

			// -- start and finish need to be between 1-6 incl.
			if(
				( headingInputValue.start  < 1 ) ||
				( headingInputValue.start  > 6 ) ||
				( headingInputValue.finish < 1 ) ||
				( headingInputValue.finish > 6 )
			) {
				return console.log( 'ERROR: heading levels need to be between 1-6' );
			}

			// set the range
			output = `H${ headingInputValue.start }-${ headingInputValue.finish }`;
		}

		return output;
	},

	// save as constant
	optionsLevelRange = setHeadingRange( optionsLevel );


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
				getHeadingNumber = getHeadingNumber.split( optionsSeparator );

				// dont work with too many items in the array
				if( getHeadingNumber.length > 6 ) {

					// set the headerNumber to null
					getHeadingNumber = null;

				} else {

					// pad in the extra array items
					getHeadingNumber = getHeadingNumber.concat(
						new Array( 6 )		// add a new array upto 6 items
						.fill( 0 )			// fill it with zeros
					)
					.slice( 0, 6 )			// cut off after 6 items
					.map( x => +x );		// map the Strings to Int
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

		//
		// 1. scope checking
		//

		// set the scope of the auto numbering
		const contentScope	= document.querySelector( optionsScope );

		// if scope doesnt exist
		// and we are dubugging
		if( !contentScope && optionsDebug ) {

			// log the error
			return console.error(
				'ERROR: the "scope" entry is not valid'
			);

		}



		//
		// 2. do we have the headers array
		//

		if( getHeadingNumber === null ) {

			// log the error
			return optionsDebug ? console.error(
				'ERROR: the "start" number is empty or null'
			) : '';

		} else {

			// 2. validate the array is all numeric
			if( getHeadingNumber.every( isNaN ) ) {

				// log the error
				return optionsDebug ? console.error(
					'ERROR: the values provided are not numeric'
				) : '';

			} else {

				//
				// validated constants
				//

				let validHeadingNumber	= '';

				// get the headings into array
				const contentHeaders = contentScope.querySelectorAll(
					'h1, h2, h3, h4, h5, h6'
				),

				// check if the array items are positive numbers
				positiveNumber = ( element ) => ( element >= 0 );

				// 3. are the numbers all positive
				if( getHeadingNumber.every( positiveNumber ) ) {

					// 4. build the functionality


					// generate the constants
					// -- minus 1 since we add immediately in the loop
					const startingNumbers = [
						0,                       // null
						getHeadingNumber[ 0 ] - 1, // h1
						getHeadingNumber[ 1 ] - 1, // h2
						getHeadingNumber[ 2 ] - 1, // h3
						getHeadingNumber[ 3 ] - 1, // h4
						getHeadingNumber[ 4 ] - 1, // h5
						getHeadingNumber[ 5 ] - 1, // h6
					];

					// track the first run
					let firstRun = [
						true,	// null
						true, 	// h1 run yet
						true,	// h2 run yet
						true,	// h3 run yet
						true,	// h4 run yet
						true,	// h5 run yet
						true	// h6 run yet
					];

					// loop through all the elements inside scope
					for( var contentItem in contentHeaders ) {


						// this element from item number
						var element = (
							contentHeaders[ contentItem ]
						),
						numberText	= '';

						// limit the heading tag number in search
						const headingRegex = new RegExp(
							`^H([${ optionsLevelRange }])$`
						);

						// does the element match a heading regex
						// -- return to beginning of loop
						if(
							!element								||
							!element.tagName						||
							!element.tagName.match( headingRegex )
						) {
							continue;
						}

						// return the heading level number
						var elementLevel = RegExp.$1;

						// add `1` to the array numbers
						startingNumbers[ elementLevel ]++;


						// reset all level below except for the first run
					    if( !firstRun[ elementLevel ] ) {

							// callback
							resetBelowLevels( elementLevel );

						}

						// set the first run to false
						firstRun[ elementLevel ] = false;

						// loop through the headings
						for(
							var levelNumber = 1;
								levelNumber <= 6;
								levelNumber++
						) {

							// if the loop number
							// is less than the element number
							// then generate the numbering text
							if( levelNumber <= elementLevel ) {
								numberText += startingNumbers[ levelNumber ] + optionsSeparator

							} else {

								// go back to top
								continue;

							}

						}

						// add the number outside the heading
						// -- keep the anchor links :)
						element.innerHTML =  numberText + ' ' + element.innerHTML.replace(/^[0-9\.\s]+/, '' );

					}

					// callback function
					function resetBelowLevels( currentLevel ) {

						// currentLevel is string
						// convert it to number
						for( let i = +currentLevel + 1; i <= 6; i++ ) {
							startingNumbers[ i ] = 0;
						}
					}

				} else {

					// log the error
					return optionsDebug ? console.error(
						'ERROR: the values are not positive integers'
					) : '';

				}
			}
		}
	});
}


// find heading plugin options
window.$docsify.autoHeaders = Object.assign(
	autoHeaderOptions,
	window.$docsify.autoHeaders
);
window.$docsify.plugins = [].concat(
	autoHeaders,
	window.$docsify.plugins
);
