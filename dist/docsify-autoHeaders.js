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
	separator: 'decimal',
	custom: '.',
	levels: 6,
	scope: '#main',
	debug: false
}

//
// MARK: - get the index.html options
//
function getAutoHeadersOptions(autoHeaderOptions) {
	// check for empty config
	if (
		!autoHeaderOptions.separator ||
		!autoHeaderOptions.levels ||
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
	switch (autoHeaderOptions.separator) {
		case 'decimal':
			separator = '.';
			break;
		case 'dash':
			separator = '-';
			break;
		case 'bracket':
			separator = ')';
			break;
		case 'other':
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
	if (typeof levels === "string") {
		levels = parseInt(levels)
	}
	if (typeof levels === "number") {
		levels = {
			start: 1,
			finish: levels
		}
	}
	else if (typeof levels === "object") {
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
function autoHeaders(hook, vm) {

	//
	// MARK: - safety
	//
	if (getAutoHeadersOptions(autoHeaderOptions) === undefined) {
		return;
	}


	//
	// MARK: - variables
	//
	let getHeadingNumber = null;

	// get the options variables
	const getAutoHeadersOptionsArray = getAutoHeadersOptions(autoHeaderOptions),
		optionsSeparator = getAutoHeadersOptionsArray[0],
		optionsLevel = getAutoHeadersOptionsArray[1],
		optionsScope = getAutoHeadersOptionsArray[2],
		optionsDebug = getAutoHeadersOptionsArray[3],

		// get the heading range from options
		setHeadingRange = (headingInputValue) => {
			// the headingInputValue is an object with 'start' and 'finish' number fields.
			// error catching
			// -- start has to be less than finish
			if (headingInputValue.start > headingInputValue.finish) {
				return console.error('ERROR: heading start level cannot be greater than finish level');
			}

			// -- start and finish need to be between 1-6 incl.
			if ((headingInputValue.start < 1) || (headingInputValue.finish > 6)) {
				return console.error('ERROR: heading levels need to be between 1-6');
			}

			// set the range (literal as 'Hm-n')
			let output = `${headingInputValue.start}-${headingInputValue.finish}`;
			return output;
		},

		// save as constant
		optionsLevelRange = setHeadingRange(optionsLevel);

	//
	// MARK: - check if the document starts with the signifier
	//

	// get the heading number settings in `@autoHeader:` or `<!-- autoHeader: -->`.
	hook.beforeEach(function (content) {
		// check if beginning with the plugin key        
		let separator = optionsSeparator;
		if (optionsSeparator === '.' || optionsSeparator === ')') {
			separator = '\\' + optionsSeparator;
		}
		const commentRegex = new RegExp(
			'<!--\\s*autoHeader\\s*:\\s*(([\\w\\d]*' + separator + '?)+)\\s*-->');
		for (const line of content.split("\n")) {
			if (!line.startsWith("<!--")) {
				break
			}
			let match = line.trim().match(commentRegex)
			if (match === null) { // skip not matched comment elements
				continue
			}
			console.debug(match[1])
			if (match[1] === "off") {
				getHeadingNumber = null
				return
			}
			// if not match, match[1] is "" (empty string)
			if (match[1] !== "") {
				getHeadingNumber = match[1]
			}
		}

		if (getHeadingNumber === null && content.startsWith("@autoHeader:")) {
			// get the first line of data
			const getFirstLine = content.split("\n")[0];
			// get everything after the `:`
			// if not match, getHeadingNumber is undefined (!getHeadingNumber is true)
			getHeadingNumber = getFirstLine.split(":")[1];
			if (!getHeadingNumber || getHeadingNumber === '') {
				getHeadingNumber = null
			}
			else {
				getHeadingNumber = getHeadingNumber.trim()
			}
			// remove the line containing "@autoHeader" mark.
			var cleanedContent = content.replace(getFirstLine, '');
		}

		// there is no data to continue
		if (getHeadingNumber !== null) {
			// make an array from the separator
			// map the Strings to Int
			getHeadingNumber = getHeadingNumber.split(optionsSeparator)
				.map(x => parseInt(x));

			if (getHeadingNumber.length > 6) {
				// tolerate with exceeding items in the heading number array
				getHeadingNumber = getHeadingNumber.slice(0, 6);
			} else if (getHeadingNumber.length < 6) {
				// padding to length of 6.
				// padding with 1 instead of 0, since we will minus 1 before formatting
				getHeadingNumber = getHeadingNumber.concat(
					new Array(6 - getHeadingNumber.length).fill(1)
				)
			}
			if (cleanedContent) { // return the cleaned content
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
	hook.doneEach(function () {
		//
		// 1. scope checking
		//
		// set the scope of the auto numbering
		const contentScope = document.querySelector(optionsScope);

		// if scope doesn't exist and we are debugging
		if (!contentScope && optionsDebug) {
			return console.error('ERROR: the "scope" entry is not valid');
		}

		//
		// 2. do we have the headers array
		//
		if (getHeadingNumber === null) {
			if (optionsDebug) {
				console.info('INFO: the "start" number is empty or null, skip numbering.');
			}
			return
		}

		// 3. validate the array is all numeric
		if (getHeadingNumber.every(isNaN)) {
			if (optionsDebug) {
				console.error('ERROR: the values provided are not numeric');
			}
			return
		}

		// get the headings into array
		const contentHeaders = contentScope.querySelectorAll(
			'h1, h2, h3, h4, h5, h6');

		// 4. check if the array items are positive numbers
		const positiveNumber = (element) => (element >= 0);
		if (!getHeadingNumber.every(positiveNumber)) {
			if (optionsDebug) {
				console.error('ERROR: the values are not positive integers')
			}
			return
		}

		// 5. build the heading numbers
		// generate the constants
		// -- minus 1 since we add immediately in the loop
		const startingNumbers = [
			0,                       // null
			getHeadingNumber[0] - 1, // h1
			getHeadingNumber[1] - 1, // h2
			getHeadingNumber[2] - 1, // h3
			getHeadingNumber[3] - 1, // h4
			getHeadingNumber[4] - 1, // h5
			getHeadingNumber[5] - 1, // h6
		];

		function resetBelowLevels(currentLevel) {
			// if currentLevel is string, convert it to number
			// lower level head number set to `0`, so next we meet a lower level 
			// head, it will be increment to `1`.
			for (let i = +currentLevel + 1; i <= 6; i++) {
				startingNumbers[i] = 0;
			}
		}

		// track the first run
		let firstRun = [
			true,    // null
			true,    // h1 run yet
			true,    // h2 run yet
			true,    // h3 run yet
			true,    // h4 run yet
			true,    // h5 run yet
			true     // h6 run yet
		];

		// loop through all the elements inside scope
		for (var contentItem in contentHeaders) {
			// this element from item number
			var element = (contentHeaders[contentItem]),
				numberText = '';

			// limit the heading tag number in search
			const headingRegex = new RegExp(
				`^H([${optionsLevelRange}])$`  // "^H([1-6])$"
			);

			// does the element match a heading regex
			// -- return to beginning of loop
			if (!element || !element.tagName) {
				continue;
			}
			let match = element.tagName.match(headingRegex)
			if (match === null || match[1] === '') { // not match
				continue
			}
			// return the heading level number
			let elementLevel = parseInt(match[1]);

			// increment the heading level number by `1`
			startingNumbers[elementLevel]++;

			// reset all level below except for the first run
			// only running on the given level range 
			if (!firstRun[elementLevel] && (elementLevel >= optionsLevel.start)) {
				resetBelowLevels(elementLevel);
			}
			// set the first run to false
			firstRun[elementLevel] = false;

			// loop through the headings
			// only levels inside the configured range will be displayed in the header
			for (let level = optionsLevel.start; level <= elementLevel; level++) {
				numberText += startingNumbers[level] + optionsSeparator
			}

			// add the number outside the heading
			// -- keep the anchor links :)
			element.innerHTML = numberText + ' ' + element.innerHTML.replace(/^[0-9\.\s]+/, '');
		}
	}
	);
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
