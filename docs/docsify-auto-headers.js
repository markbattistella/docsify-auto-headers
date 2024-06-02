(function () {

    'use strict';

    const docsifyAutoHeadersDefaults = {
        separator: '.',

        levels: 6,
        // levels: { start: 2, finish: 3 },

        sidebar: true,
        // sidebar: false,

        debug: true
    };

    const defaultErrors = {
        configurationNotSetCorrectly:
            'Config settings not set',
        invalidHeadingLevels:
            'The levels parameter needs to be either a number (1-6) or an object',
        invalidHeadingLevelNumber:
            'Heading levels need to be between 1-6',
        invalidHeadingLevelOrder:
            'Heading start level cannot be greater than finish level',
        invalidHeadingLevelRange:
            'Heading levels need to be a value of 1 through to 6',
        nonNumericValue:
            'The levels start or finish need to be numeric',
        mismatchedSeparator:
            'The config separator does not match the signifier separator',
        missingAutoHeaderSignifier:
            'The markdown file is missing the @autoHeader: or <!-- autoHeader: --> signifier',
        misconfiguredSignifier:
            'The markdown file has the signifier, but it is misconfigured',
        invalidSidebar:
            'The sidebar parameter needs to be a boolean - true or false'
    };

    const setDefaultOptions = (options) => {
        if (!options.separator || options.levels === undefined) {
            console.info(defaultErrors.configurationNotSetCorrectly);
            throw new Error(defaultErrors.configurationNotSetCorrectly);
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
        const sidebar = !!options.sidebar;
        const debug = !!options.debug;

        return { separator, levels, sidebar, debug };
    };

    const getUsingSidebar = (input) => {
        if (typeof input !== 'boolean') {
            throw new Error(defaultErrors.invalidSidebar);
        } else {
            return input;
        }
    };

    const getHeadingRange = (input) => {
        if (typeof input !== 'number' && (typeof input !== 'object' || input === null)) {
            throw new Error(defaultErrors.invalidHeadingLevels);
        }

        const isInRange = (value, min, max) => value >= min && value <= max;

        let start, finish;

        if (typeof input === 'number') {
            start = 1;
            finish = input;
        } else if (typeof input === 'object') {
            ({ start, finish } = input);

            if (typeof start !== 'number' || typeof finish !== 'number') {
                throw new Error(defaultErrors.nonNumericValue);
            }

            if (start > finish) {
                throw new Error(defaultErrors.invalidHeadingLevelOrder);
            }
        }

        if (!isInRange(start, 1, 6) || !isInRange(finish, 1, 6)) {
            throw new Error(defaultErrors.headingLevelRange);
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
            throw new Error(defaultErrors.invalidHeadingLevels);
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
            const headingList = [...input.querySelectorAll('h1, h2, h3, h4, h5, h6')];
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

    const autoHeaders = (hook, vm) => {

        // Setup default options and scope
        const defaultOptions = setDefaultOptions(docsifyAutoHeadersDefaults);
        let options = {
            separator: defaultOptions.separator,
            levels: getHeadingRange(defaultOptions.levels),
            sidebar: getUsingSidebar(defaultOptions.scope),
            debug: defaultOptions.debug
        };

        // MARK: Need to access markdown to extract the signifier data
        hook.beforeEach((markdown, next) => {
            try {
                const headingSignifier = checkAutoHeader(markdown);
                if (!headingSignifier) {
                    throw new Error(defaultErrors.missingAutoHeaderSignifier);
                }

                const headingRanges = getHeadingRange(defaultOptions.levels);
                const startingHeadingValues = getStartingValues(
                    headingSignifier,
                    options.separator
                );
                if (!startingHeadingValues) {
                    throw new Error(defaultErrors.misconfiguredSignifier);
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

            } catch (error) {
                console.warn('Warning: Docsify Auto Headers\n', error.message);
            } finally {
                next(markdown);
            }
        });

        // Conditional setup for hooks
        if (options.sidebar) {


            hook.beforeEach((markdown, next) => {
                let output;
                try {
                    output = applyScopedHeadingCounts(
                        options.levels,
                        options,
                        markdown,
                        'markdown'
                    );
                } catch (error) {
                    console.warn('Warning: Docsify Auto Headers\n', error.message)
                } finally {
                    next(output);
                }
            });
        } else {
            hook.afterEach(function (html, next) {
                let output;
                try {
                    output = applyScopedHeadingCounts(
                        options.levels,
                        options,
                        html,
                        'html'
                    );
                } catch (error) {
                    console.warn('Warning: Docsify Auto Headers\n', error.message)
                } finally {
                    next(output);
                }
            });
        }
    };

    // Merge user configuration with default configuration
    window.$docsify = window.$docsify || {};
    window.$docsify.autoHeaders = Object.assign(
        docsifyAutoHeadersDefaults,
        window.$docsify.autoHeaders
    );

    // Add plugin to docsify's plugin array
    window.$docsify.plugins = (
        window.$docsify.plugins || []
    ).concat(autoHeaders);
})();
