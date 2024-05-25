/*! docsify-auto-headers 5.0.0 | (c) Mark Battistella */
// MARK: - policy
'use strict';

// MARK: - default values
const docsifyAutoHeaders = {
        separator:  '',
        levels:     '',
        scope:      '',
        debug:      false
    },

    // -- list of errors and warnings
    defaultErrors = {
        configNotSet:       'ERROR: config settings not set',
        headingLevelOrder:  'ERROR: heading start level cannot be greater than finish level',
        headingLevelRange:  'ERROR: heading levels need to be between 1-6',
        invalidScope:       'ERROR: the "scope" entry is not valid',
        invalidStartValue:  'ERROR: the "start" number is empty or null',
        nonNumericValue:    'ERROR: the values provided are not numeric',
        negativeNumbers:    'ERROR: the values are not positive integers'
    },

    // update the default header values
    setAutoHeadersOptions = ( docsifyAutoHeaders ) => {

        // check for required config settings
        // -- need separator
        // -- need levels
        // -- need scope
        if(
            !docsifyAutoHeaders.separator   ||
            !docsifyAutoHeaders.levels      ||
            !docsifyAutoHeaders.scope
        ) {
            return console.warn( defaultErrors.configNotSet );
        }

        // set some defaults
        let separator;

        // what separator are we using
        switch( docsifyAutoHeaders.separator ) {

            case 'decimal':
            case '.':
            case 'dot':
                separator = '.';
                break;

            case 'dash':
            case '-':
            case 'hyphen':
                separator = '-';
                break;

            case 'bracket':
            case ')':
            case 'parenthesis':
                separator = ')';
                break;

            default:
                separator = docsifyAutoHeaders.separator;
                break;
        }

        // get other settings
        let levels = (
            docsifyAutoHeaders.levels ?
                docsifyAutoHeaders.levels : 6
        );

        let scope = (
            docsifyAutoHeaders.scope ?
                docsifyAutoHeaders.scope : "main"
        );

        let debug = (
            docsifyAutoHeaders.debug === true ?
                true : false
        );

        // return the array
        return {
            separator: separator,
            levels: levels,
            scope: scope,
            debug: debug
        }
    };


// MARK: - main function
function autoHeaders( hook, vm ) {

    // -- check that the options are defined
    if( setAutoHeadersOptions( docsifyAutoHeaders ) === undefined ) {
        return;
    }

    // variables
    let getHeadingNumber;

    // get the options variables
    const autoHeadersOptions = setAutoHeadersOptions( docsifyAutoHeaders ),

        // create new variables
        optionsSeparator    = autoHeadersOptions.separator,
        optionsLevel        = autoHeadersOptions.levels,
        optionsScope        = autoHeadersOptions.scope,
        optionsDebug        = autoHeadersOptions.debug,

        // safe heading range
        isHeadingInRange = ( value, min, max ) => {
            return value >= min && value <= max;
        },

        // get the heading range from options
        setHeadingRange = ( headingInputValue ) => {
            let output;

            // -- is it a string
            if ( typeof optionsLevel === 'string' ) {

                // -- is it in range
                if( isHeadingInRange( headingInputValue, 1, 6 ) ) {
                    output = `H1-${headingInputValue}`;
                } else {
                    return console.log(defaultErrors.headingLevelRange);
                }

            // -- check if is object
            } else if (
                typeof optionsLevel === 'object' &&
                optionsLevel !== null
            ) {

                // -- start has to be less than finish
                if( headingInputValue.start > headingInputValue.finish ) {
                    return console.log( defaultErrors.headingLevelOrder );
                }

                // -- start and finish need to be between 1-6 incl.
                if(
                    isHeadingInRange( headingInputValue.start, 1, 6 ) &&
                    isHeadingInRange( headingInputValue.finish, 1, 6 )
                ) {
                    output = `H${ headingInputValue.start }-${ headingInputValue.finish }`;
                } else {
                    return console.log( defaultErrors.headingLevelRange );
                }
            }

            return output;
        },

        // save as constant
        optionsLevelRange = setHeadingRange(optionsLevel);



    // MARK: - before rendered to HTML
    hook.beforeEach( (content) => {

        // get the first 12 characters
        const getFirstCharacters = content.slice( 0, 12 );

        // check if beginning with the plugin key
        if( getFirstCharacters === '@autoHeader:' ) {

            // get the first line of data
            const getFirstLine = content.split( '\n' )[ 0 ];

            // get everything after the `:`
            getHeadingNumber = getFirstLine.split( ':' )[1];

            // there is no data to continue
            if (
                !getHeadingNumber ||
                getHeadingNumber == null ||
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
                        new Array( 6 )      // add a new array upto 6 items
                            .fill( 0 )      // fill it with zeros
                    )
                        .slice( 0, 6 )      // cut off after 6 items
                        .map( x => +x );    // map the Strings to Int
                }
            }

            // return the cleaned content
            return content.replace( getFirstLine, '' );

        } else {

            // set the headerNumber to null
            getHeadingNumber = null;
        }
    });



    // MARK: - add the heading numbers
    hook.doneEach( () => {

        // set the scope of the auto numbering
        const contentScope = document.querySelector( optionsScope );

        // if scope doesnt exist
        // and we are dubugging
        if( !contentScope && optionsDebug ) {
            return console.warn( defaultErrors.invalidScope );
        }

        // -- do we have the headers array
        if( getHeadingNumber === null ) {
            return optionsDebug ? console.warn(defaultErrors.invalidStartValue ) : '';

        } else {

            // -- validate the array is all numeric
            if( getHeadingNumber.every( isNaN ) ) {
                return optionsDebug ? console.warn( defaultErrors.nonNumericValue ) : '';

            } else {

                // validated constants
                let validHeadingNumber;

                // get the headings into array
                const contentHeaders = contentScope.querySelectorAll(
                    'h1, h2, h3, h4, h5, h6'
                ),

                    // check if the array items are positive numbers
                    positiveNumber = ( element ) => ( element >= 0 );

                // 3. are the numbers all positive
                if (getHeadingNumber.every(positiveNumber)) {

                    // 4. build the functionality


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

                    // callback function
                    const resetBelowLevels = ( currentLevel ) => {

                        // currentLevel is string
                        // convert it to number
                        for( let i = +currentLevel + 1; i <= 6; i++ ) {
                            startingNumbers[i] = 0;
                        }
                    }

                    // loop through all the elements inside scope
                    for (var contentItem in contentHeaders) {


                        // this element from item number
                        var element = (
                            contentHeaders[contentItem]
                        ),
                            numberText = '';

                        // limit the heading tag number in search
                        const headingRegex = new RegExp(
                            `^H([${optionsLevelRange}])$`
                        );

                        // does the element match a heading regex
                        // -- return to beginning of loop
                        if (
                            !element ||
                            !element.tagName ||
                            !element.tagName.match(headingRegex)
                        ) {
                            continue;
                        }

                        // return the heading level number
                        var elementLevel = RegExp.$1;

                        // add `1` to the array numbers
                        startingNumbers[elementLevel]++;


                        // reset all level below except for the first run
                        if (!firstRun[elementLevel]) {

                            // callback
                            resetBelowLevels( elementLevel );

                        }

                        // set the first run to false
                        firstRun[elementLevel] = false;

                        // loop through the headings
                        for (
                            var levelNumber = 1;
                            levelNumber <= 6;
                            levelNumber++
                        ) {

                            // if the loop number
                            // is less than the element number
                            // then generate the numbering text
                            if (levelNumber <= elementLevel) {
                                numberText += startingNumbers[levelNumber] + optionsSeparator

                            } else {

                                // go back to top
                                continue;

                            }

                        }

                        // add the number outside the heading
                        // -- keep the anchor links :)
                        element.innerHTML = numberText + ' ' + element.innerHTML.replace(/^[0-9\.\s]+/, '');

                    }

                } else {

                    // log the error
                    return optionsDebug ?
                        console.warn( defaultErrors.negativeNumbers ) : '';
                }
            }
        }
    });
}


// find heading plugin options
window.$docsify.autoHeaders = Object.assign(
    docsifyAutoHeaders,
    window.$docsify.autoHeaders
);
window.$docsify.plugins = [].concat(
    autoHeaders,
    window.$docsify.plugins
);