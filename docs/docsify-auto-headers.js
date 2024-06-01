'use strict';

const docsifyAutoHeaders = {
    separator: '.',

    levels: 6,
    // levels: { start: 2, finish: 3 },

    // scope: '#main',
    scope: { element: '#main', sidebar: true },
    // scope: { element: '#main', sidebar: false },

    debug: true
};


const autoHeaders = (hook, vm) => {
    const defaultErrors = {
        configurationNotSetCorrectly:
            'ERROR: config settings not set',
        invalidHeadingLevels:
            'ERROR: the levels parameter needs to be either a number (1-6) or an object',
        invalidHeadingLevelNumber:
            'ERROR: heading levels need to be between 1-6',
        invalidHeadingLevelOrder:
            'ERROR: heading start level cannot be greater than finish level',
        invalidHeadingLevelRange:
            'ERROR: heading levels need to be a value of 1 through to 6',
        nonNumericValue:
            'ERROR: the levels start or finish need to be numeric',
        mismatchedSeparator:
            'ERROR: the config separator does not match the signifier separator',
        missingAutoHeaderSignifier:
            'ERROR: the markdown file is missing the @autoHeader: or <!-- autoHeader: --> signifier',
        misconfiguredSignifier:
            'ERROR: the markdown file has the signifier, but it is misconfigured',
        misconfiguredScope:
            'ERROR: the scope has been misconfigured. It must be a string (an element, ID, or class name), or an object',
        scopeNotFound:
            'ERROR: the specified scope was not found in the document'
    };

    const setDefaultOptions = (options) => {
        if (!options.separator || options.levels === undefined) {
            console.warn(defaultErrors.configurationNotSetCorrectly);
            return;
        }

        const separatorMap = {
            'decimal': '.',
            'dot': '.',
            'dash': '-',
            'hyphen': '-',
            'bracket': ')',
            'parenthesis': ')'
        };
        const separator = separatorMap[options.separator] || options.separator;
        const levels = options.levels || 6;
        const scope = options.scope || '#main';
        const debug = !!options.debug;

        return { separator, levels, scope, debug };
    };

    const getUsingSidebar = (input) => {
        if (typeof input !== 'string' && (typeof input !== 'object' || input === null)) {
            console.error(defaultErrors.misconfiguredScope);
            return;
        }

        if (typeof input === 'string') {
            return { element: input, sidebar: false };
        } else if (typeof input === 'object') {
            if (typeof input.sidebar !== 'boolean') {
                console.warn(defaultErrors.misconfiguredScope);
                return;
            }
            return { element: input.element, sidebar: input.sidebar };
        }
    };

    const getHeadingRange = (input) => {
        if (typeof input !== 'number' && (typeof input !== 'object' || input === null)) {
            console.error(defaultErrors.invalidHeadingLevels);
            return;
        }

        const isInRange = (value, min, max) => value >= min && value <= max;

        let start, finish;

        if (typeof input === 'number') {
            start = 1;
            finish = input;
        } else if (typeof input === 'object') {
            ({ start, finish } = input);

            if (typeof start !== 'number' || typeof finish !== 'number') {
                console.error(defaultErrors.nonNumericValue);
                return;
            }

            if (start > finish) {
                console.warn(defaultErrors.invalidHeadingLevelOrder);
                return;
            }
        }

        if (!isInRange(start, 1, 6) || !isInRange(finish, 1, 6)) {
            console.warn(defaultErrors.headingLevelRange);
            return;
        }

        const headings = {};
        for (let i = 1; i <= 6; i++) {
            headings[`h${i}`] = { inScope: isInRange(i, start, finish) };
        }

        return headings;
    };

    const getStartingValues = (headerNumbers, separator) => {
        const isAllNumeric = (str) => /^\d+$/.test(str);
        const isAllAlphabetic = (str) => /^[a-zA-Z]+$/.test(str);

        const elements = headerNumbers.split(separator).map(el => el.trim());
        const isNumeric = elements.every(isAllNumeric);
        const isAlphabetic = elements.every(isAllAlphabetic);

        if (!(isNumeric || isAlphabetic)) {
            console.error(defaultErrors.invalidHeadingLevels, headerNumbers);
            return null;
        }

        while (elements.length < 6) {
            elements.push(isNumeric ? '1' : 'A');
        }

        const startingValues = {};
        for (let i = 0; i < 6; i++) {
            startingValues[`h${i + 1}`] = { counter: elements[i] };
        }

        return startingValues;
    };

    const checkAutoHeader = (markdown) => {
        const autoHeaderPattern = /^(?:@autoHeader:|<!-- autoHeader:)([\d.a-zA-Z\-:,~]+)(?: -->)?/;
        const match = markdown.trim().match(autoHeaderPattern);
        return match ? match[1] : null;
    };

    const createCountContextObjects = (levels) => {
        const configEntries = Object.entries(levels);
        const currentCounts = new Map(
            configEntries.map(([key, { counter }]) => {
                counter = parseInt(counter, 10);
                counter = Number.isFinite(counter) ? counter - 1 : 0;
                return [key, { reset: counter, current: counter }];
            })
        );
        const scopedTagNames = new Set(
            configEntries.filter(([_, { inScope }]) => inScope).map(([key]) => key)
        );
        return {
            currentCounts,
            scopedTagNames,
        };
    };
    
    const applyCurrentCountThroughBoundContext = function (headingNode, options) {
        const { currentCounts, scopedTagNames } = this;
        const headingName = headingNode.tagName.toLowerCase();
        const headingNameList = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        
        // Reset the counts for headings that are below the current heading level
        headingNameList.slice(headingNameList.indexOf(headingName) + 1).forEach(name => {
            if (currentCounts.has(name)) {
                const nextMinorCounts = currentCounts.get(name);
                nextMinorCounts.current = nextMinorCounts.reset;
                nextMinorCounts.reset = 0;
            }
        });
    
        // Update the count for the current heading
        const counts = currentCounts.get(headingName);
        counts.current += 1;
    
        if (scopedTagNames.has(headingName)) {
            const counterValue = headingNameList
                .slice(0, headingNameList.indexOf(headingName) + 1)
                .reduce((counterList, name) =>
                    counterList.concat(currentCounts.get(name).current), []
                )
                .join(options.separator) + options.separator;
    
            headingNode.innerHTML = `${counterValue} ${headingNode.innerHTML}`;
        }
    };
        
    const parseMarkdown = (markdown, options, levels) => {
        const { currentCounts, scopedTagNames } = createCountContextObjects(levels);
        const headingPattern = /^(#{1,6})\s+(.*)$/gm;
        const headingNameList = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
        let result = markdown.replace(headingPattern, (match, hashes, text) => {
            const headingLevel = hashes.length;
            const headingName = `h${headingLevel}`;
            
            // Reset the counts for headings that are below the current heading level
            headingNameList.slice(headingLevel).forEach(name => {
                if (currentCounts.has(name)) {
                    const nextMinorCounts = currentCounts.get(name);
                    nextMinorCounts.current = nextMinorCounts.reset;
                    nextMinorCounts.reset = 0;
                }
            });
    
            // Update the count for the current heading
            const counts = currentCounts.get(headingName);
            counts.current += 1;
    
            if (scopedTagNames.has(headingName)) {
                const counter = Array.from({ length: headingLevel }, (_, i) => {
                    return currentCounts.get(`h${i + 1}`).current;
                }).join(options.separator) + options.separator;
                return `${hashes} ${counter} ${text}`;
            } else {
                return match;
            }
        });
    
        return result;
    };
    
    const applyScopedHeadingCounts = (levels, options, input, type) => {
        const { currentCounts, scopedTagNames } = createCountContextObjects(levels);

        if (type === 'html') {
            const scope = document.querySelector(options.scope.element);
            const headingList = [...scope.querySelectorAll('h1, h2, h3, h4, h5, h6')];
            headingList.forEach(
                heading => applyCurrentCountThroughBoundContext.call(
                    { currentCounts, scopedTagNames },
                    heading,
                    options
                )
            );
        } else if (type === 'markdown') {
            const result = parseMarkdown(input, options, levels);
            return result;
        }
    };


    // Setup default options and scope
    const defaultOptions = setDefaultOptions(docsifyAutoHeaders);
    let options = {
        separator: defaultOptions.separator,
        levels: getHeadingRange(defaultOptions.levels),
        scope: getUsingSidebar(defaultOptions.scope),
        debug: defaultOptions.debug
    };

    // MARK: Need to access markdown to extract the signifier data
    hook.beforeEach(markdown => {
        const headingSignifier = checkAutoHeader(markdown);
        if (!headingSignifier) {
            console.warn(defaultErrors.missingAutoHeaderSignifier);
            return markdown;
        }

        const headingRanges = getHeadingRange(defaultOptions.levels);
        const startingHeadingValues = getStartingValues(
            headingSignifier,
            options.separator
        );
        if (!startingHeadingValues) {
            console.warn(defaultErrors.misconfiguredSignifier);
            return markdown;
        }
        const headingConfiguration = {};
        for (const key in headingRanges) {
            headingConfiguration[key] = {
                ...headingRanges[key],
                ...startingHeadingValues[key]
            };
        }

        // Update the options for use elsewhere
        options.levels = headingConfiguration;

        const cleanedMarkdown = markdown.split('\n').slice(1).join('\n');
        return cleanedMarkdown;
    });


    // Conditional setup for hooks
    if (options.scope.sidebar) {
        hook.beforeEach(markdown => {
            return applyScopedHeadingCounts(
                options.levels,
                options,
                markdown,
                'markdown'
            );
        });
    } else {
        hook.doneEach(() => {
            const scopeElement = document.querySelector(options.scope.element);
            if (!scopeElement) {
                console.warn(defaultErrors.scopeNotFound);
                return;
            }

            return applyScopedHeadingCounts(
                options.levels,
                options,
                null,
                'html'
            );
        });
    }
};


// find heading plugin options
window.$docsify.autoHeaders = Object.assign(
    docsifyAutoHeaders,
    window.$docsify.autoHeaders
);
window.$docsify.plugins = [].concat(
    autoHeaders,
    window.$docsify.plugins
);
