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
	separator:	'decimal',
	custom:		'.',
	levels:		6,
	scope:		'#main',
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
	if (typeof levels === "string"){
		levels = parseInt(levels)
	}
	if (typeof levels === "number" ){
		levels = {
			start: 1,
			finish: levels
		}
	}
	else if (typeof levels === "object" ) {
		if (typeof levels.start === "string") {
			levels.start = parseInt(levels.start)
		}
		if (typeof levels.finish === "string") {
			levels.finish = parseInt(levels.finish)
		}
	}

	let scope = (
		autoHeaderOptions.scope ?
			autoHeaderOptions.scope : "#main"
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
		// the headingInputValue is an object with 'start' and 'finish' number fields.
		// error catching
		// -- start has to be less than finish
		if( headingInputValue.start > headingInputValue.finish ) {
			return console.error('ERROR: heading start level cannot be greater than finish level' );
		}

		// -- start and finish need to be between 1-6 incl.
		if( ( headingInputValue.start  < 1 ) || ( headingInputValue.finish > 6 ) ) {
			return console.error('ERROR: heading levels need to be between 1-6' );
		}

		// set the range (literal as 'Hm-n')
		let output = `${ headingInputValue.start }-${ headingInputValue.finish }`;
		return output;
	},

	// save as constant
	optionsLevelRange = setHeadingRange( optionsLevel );


	//
	// MARK: - check if the document starts with the signifier
	//

	// get the `@autoHeader:` data
	hook.beforeEach( function( content ) {
		// check if beginning with the plugin key		
		let separator = optionsSeparator;
		if (optionsSeparator === '.' || optionsSeparator === ')') {
			separator = '\\'+optionsSeparator;
		}
		const commentRegex = new RegExp(
			'<!--\\s*autoHeader\\s*:\\s*(([\\w\\d]*'+separator+'?)+)\\s*-->');
		for (const line of content.split( "\n" )){
			console.debug(line)
			if (! line.startsWith("<!--")){
				break
			}
			let match = line.trim().match(commentRegex)
			if (match === null) { // skip not matched comment elements
				continue
			}
			console.debug(match[1])
			if (match[1] === "off"){
				getHeadingNumber = null
				return
			}
			// if not match, match[1] is "" (empty string)
			if (match[1] !== "") {
				getHeadingNumber = match[1]
			}
		}

		if( getHeadingNumber === null && content.startsWith("@autoHeader:") ) {
			// get the first line of data
			const getFirstLine = content.split( "\n" )[0];
			// get everything after the `:`
			// if not match, getHeadingNumber is undefined (!getHeadingNumber is true)
			getHeadingNumber = getFirstLine.split( ":" )[1];
			if(!getHeadingNumber || getHeadingNumber === ''){
				getHeadingNumber = null
			}
			else {
				getHeadingNumber = getHeadingNumber.trim()
			}
			var cleanedContent = content.replace( getFirstLine, '' );
		}

		// there is no data to continue
		if(getHeadingNumber !== null) {
			// make an array from the separator
			// map the Strings to Int
			getHeadingNumber = getHeadingNumber.split( optionsSeparator )
                                               .map(x => parseInt(x));

			// don't work with too many items in the array
			if( getHeadingNumber.length > 6 ) {
				// set the headerNumber to null
				getHeadingNumber = getHeadingNumber.slice(0,6);
			} else if (getHeadingNumber.length < 6) {
				// padding to length of 6.
				// padding with 1 instead of 0, since we will minus 1 before formatting
				getHeadingNumber = getHeadingNumber.concat(
					new Array(6 - getHeadingNumber.length).fill(1)
				)
			}
			// remove the line
			if (cleanedContent){
				// return the cleaned content
				return cleanedContent;
			}
		}
		else {
			// set the headerNumber to default 1.1.1.1.1.1
			getHeadingNumber = new Array(6).fill(1);
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

		// if scope doesn't exist and we are debugging
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
							`^H([${ optionsLevelRange }])$`  // "^H([1-6])$"
						);

						// does the element match a heading regex
						// -- return to beginning of loop
						if( !element || !element.tagName ) {
							continue;
						}
						match = element.tagName.match( headingRegex )
						if (match === null || match[1] === ''){ // not match
							continue
						}
						// return the heading level number
						var elementLevel = parseInt(match[1]);

						// add `1` to the array numbers
						startingNumbers[ elementLevel ]++;


						// reset all level below except for the first run
						// only running on the given level range 
					    if( !firstRun[ elementLevel ] && (elementLevel>=optionsLevel.start) ) {

							// callback
							resetBelowLevels( elementLevel );

						}

						// set the first run to false
						firstRun[ elementLevel ] = false;

						// loop through the headings
						for(
							var levelNumber = optionsLevel.start;
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
