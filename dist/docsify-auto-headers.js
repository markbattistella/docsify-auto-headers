/*! docsify-auto-headers 5.0.0 | (c) Mark Battistella */
; (() => {

  'use strict';

  /**
   * Default settings for the Docsify Auto Headers plugin.
   * @type {Object}
   * @property {string} separator - The separator for header numbering (e.g., '.', '-', ')').
   * @property {boolean} sidebar - Boolean indicating if headers should be added to the sidebar.
   * @property {number|Object} levels - Number of header levels to include (1 to 6) or an object with start and finish properties.
   * @property {boolean} debug - Boolean to enable or disable debug messages.
   */
  const docsifyAutoHeadersDefaults = {

      // Separator for header numbering (e.g., '.', '-', ')')
      separator: '.',

      // Boolean indicating if headers should be added to the sidebar
      sidebar: false,

      // Number of header levels to include (1 to 6) or an object with start and finish properties
      levels: 6,

      // Boolean to enable or disable debug messages
      debug: false
  };

  /**
   * Main function for the Docsify Auto Headers plugin.
   * @param {Object} hook - Docsify hook object.
   * @param {Object} vm - Docsify virtual machine object.
   */
  const autoHeaders = (hook, vm) => {

      /**
       * Predefined error messages for invalid configurations.
       * @type {Object}
       * @property {string} invalidConfiguration - General error message for invalid configuration.
       * @property {string} invalidConfigurationSidebar - Error message for invalid sidebar configuration.
       * @property {string} invalidConfigurationLevels - Error message for invalid levels configuration.
       * @property {string} nonNumericHeadingLevel - Error message when levels start or finish values are not numbers.
       * @property {string} badNumericOrderHeadingLevel - Error message when start value is greater than finish value.
       * @property {string} outOfRangeHeadingLevel - Error message when start or finish values are out of range (1-6).
       * @property {string} moreThanSixElements - Error message when more than 6 elements are found in the signifier.
       * @property {string} invalidParsedElements - Error message when elements in the signifier are not purely numeric or alphabetic.
       * @property {string} signifierNotFound - Error message when the auto header signifier is missing in the markdown file.
       */
      const errorMessage = {
          invalidConfiguration:
              'Configuration settings are not set correctly. Please review the autoHeaders parameters and documentation.',
          invalidConfigurationSidebar:
              'The sidebar setting for autoHeaders only accepts a boolean of true or false. Please check you\'ve entered this data correctly.',
          invalidConfigurationLevels:
              'The levels settings for autoHeaders only accepts a number from 1-6 or an object with the start and finish options. Please check you\'ve entered this data correctly.',
          nonNumericHeadingLevel:
              'The levels setting has been configured with a start and finish option. However, the values for one of these is not a number. Please check you\'ve entered this data correctly.',
          badNumericOrderHeadingLevel:
              'The levels setting has been configured with a start and finish option. However, the start value is greater than the finish. Please check you\'ve entered this data correctly.',
          outOfRangeHeadingLevel:
              'The levels setting has been configured with a start and finish option. However, the values for one of these is not from 1-6. Please check you\'ve entered this data correctly.',
          moreThanSixElements:
              'The elements found in the signifier have equated to more than 6 headings. Please check the configuration of your markdown that you have no more than 6 numbers',
          invalidParsedElements:
              'The elements found in the signifier are not numbers only or alphabet only. Please check the configuration of your markdown that all the items are numeric or alphabetic.',
          signifierNotFound:
              'The current markdown file is missing the @autoHeader: or <!-- autoHeader: --> signifier',
      };

      /**
       * Boolean flag indicating whether the processing should continue.
       * @type {boolean}
       */
      let shouldContinue = true;

      /**
       * Logs an error message if a configuration is invalid.
       * @param {boolean} shouldShow - Boolean indicating if the error message should be shown.
       * @param {string} message - The error message to log.
       * @returns {null} Always returns null after logging the error.
       */
      const logErrorMessage = (shouldShow, message) => {
          if (shouldShow) {
              console.warn(`Docsify Auto Headers:\n>> ${message}`);
          }
          shouldContinue = false;
          return null;
      };

      /**
       * Sets the default options for the plugin by merging user-defined options with defaults.
       * @param {Object} options - User-defined options to override the default settings.
       * @param {string} options.separator - The separator for header numbering.
       * @param {number|Object} options.levels - Number of header levels to include or an object with start and finish properties.
       * @param {boolean} options.sidebar - Boolean indicating if headers should be added to the sidebar.
       * @param {boolean} options.debug - Boolean to enable or disable debug messages.
       * @returns {Object|null} The final options object or null if there is an invalid configuration.
       */
      const setDefaultOptions = (options) => {
          if (!options.separator || options.levels === undefined) {
              return logErrorMessage(options.debug, errorMessage.invalidConfiguration);
          }

          // Map user-friendly separator names to actual separator characters
          const separatorMap = {
              'decimal': '.',
              'dot': '.',
              'dash': '-',
              'hyphen': '-',
              'bracket': ')',
              'parenthesis': ')'
          };
          // Determine the separator to use
          const separator = separatorMap[options.separator] || options.separator;

          // Set the levels, defaulting to 6 if not provided
          const levels = options.levels || 6;

          // Ensure sidebar and debug options are booleans
          const sidebar = !!options.sidebar;

          const debug = !!options.debug;

          return { separator, levels, sidebar, debug };
      };

      /**
       * Validates and retrieves the sidebar setting.
       * @param {boolean} input - The sidebar setting input.
       * @param {Object} options - The current plugin options.
       * @param {boolean} options.debug - Boolean to enable or disable debug messages.
       * @returns {boolean|null} The validated sidebar setting or null if the input is invalid.
       */
      const validateThenGetSidebar = (input, options) => {
          if (typeof input !== 'boolean') {
              return logErrorMessage(options.debug, errorMessage.invalidConfigurationSidebar);
          }
          return input;
      };

      /**
       * Validates and retrieves the heading range setting.
       * @param {number|Object} input - The levels setting input, which can be a number or an object with start and finish properties.
       * @param {Object} options - The current plugin options.
       * @param {boolean} options.debug - Boolean to enable or disable debug messages.
       * @returns {Object|null} The validated heading range configuration or null if the input is invalid.
       */
      const validateThenGetHeadingRange = (input, options) => {
          if (typeof input !== 'number' && (typeof input !== 'object' || input === null)) {
              return logErrorMessage(options.debug, errorMessage.invalidConfigurationLevels);
          }

          // Helper function to check if a value is within a specified range
          const isInRange = (value, min, max) => value >= min && value <= max;
          let start, finish;

          if (typeof input === 'number') {
              start = 1;
              finish = input;
          } else if (typeof input === 'object') {
              ({ start, finish } = input);
              if (typeof start !== 'number' || typeof finish !== 'number') {
                  return logErrorMessage(options.debug, errorMessage.nonNumericHeadingLevel);
              }
              if (start > finish) {
                  return logErrorMessage(options.debug, errorMessage.badNumericOrderHeadingLevel);
              }
          }

          if (!isInRange(start, 1, 6) || !isInRange(finish, 1, 6)) {
              return logErrorMessage(options.debug, errorMessage.outOfRangeHeadingLevel);
          }

          const headings = {};
          for (let i = 1; i <= 6; i++) {
              headings[`h${i}`] = { inScope: isInRange(i, start, finish) };
          }
          return headings;
      };

      /**
       * Converts a number to a header string based on the type (numeric or alphabetic).
       * @param {number} num - The number to convert.
       * @param {string} type - The type of conversion ("numeric", "alphabetic-lower", "alphabetic-upper").
       * @returns {string} The converted header string.
       */
      const numberToHeader = (num, type) => {
          if (type === "numeric") {
              return num + ""; // Convert number to string
          } else {
              num--; // Adjust the number for zero-based index
              let result = '';
              while (num >= 0) {
                  let remainder = num % 26;
                  result = String.fromCharCode(65 + remainder) + result;
                  num = Math.floor(num / 26) - 1;
              }

              // Convert result to lowercase if type is "alphabetic-lower"
              return (type === "alphabetic-lower") ? result.toLowerCase() : result;
          }
      };

      /**
       * Converts a header string to a number based on the type.
       * @param {string} header - The header string to convert.
       * @param {string} type - The type of conversion ("numeric", "alphabetic-lower", "alphabetic-upper").
       * @returns {number} The converted number.
       */
      const headerToNumber = (header, type) => {
          if (type === "numeric") {
              return parseInt(header, 10); // Convert header string to number
          } else {
              header = header.toUpperCase(); // Convert header to uppercase for alphabetic conversion
              let result = 0;
              for (let i = 0; i < header.length; i++) {
                  result *= 26;
                  result += header.charCodeAt(i) - 65 + 1;
              }
              return result;
          }
      };

      /**
       * Parses the starting values for headers from the signifier.
       * @param {string} headerNumbers - The header numbers string.
       * @param {Object} options - The current plugin options.
       * @param {string} options.separator - The separator for header numbering.
       * @param {boolean} options.debug - Boolean to enable or disable debug messages.
       * @returns {Array<Object>|null} The parsed header values as an array of objects or null if the input is invalid.
       */
      const parseHeadingStartingValues = (headerNumbers, options) => {
          // Helper functions to check if a string is all numeric or alphabetic
          const isAllNumeric = (str) => /^\d+$/.test(str);
          const isAllAlphabeticLower = (str) => /^[a-z]+$/.test(str);
          const isAllAlphabeticUpper = (str) => /^[A-Z]+$/.test(str);

          // Split the header numbers string by the separator and trim each element
          let elements = headerNumbers.split(options.separator).map(el => el.trim());
          if (elements.length > 6) {
              return logErrorMessage(options.debug, errorMessage.moreThanSixElements);
          }

          // Check if all elements are numeric or alphabetic
          const isNumeric = elements.every(isAllNumeric);
          const isAlphabeticLower = elements.every(isAllAlphabeticLower);
          const isAlphabeticUpper = elements.every(isAllAlphabeticUpper);
          if (!isNumeric && !isAlphabeticLower && !isAlphabeticUpper) {
              return logErrorMessage(options.debug, errorMessage.invalidParsedElements);
          }

          // Ensure there are at least 6 elements by filling with default values
          while (elements.length < 6) {
              elements.push(isNumeric ? '1' : (isAlphabeticLower ? 'a' : 'A'));
          }

          // Determine the type of header values
          let type = isNumeric ? 'numeric' : (isAlphabeticLower ? 'alphabetic-lower' : 'alphabetic-upper');

          // Convert the elements to header values
          return elements.map(x => ({ counter: headerToNumber(x, type), type }));
      };

      /**
       * Validates the presence of the auto header signifier in the markdown.
       * @param {string} markdown - The markdown content.
       * @param {Object} options - The current plugin options.
       * @param {boolean} options.debug - Boolean to enable or disable debug messages.
       * @returns {Object|null} An object containing the heading signifier and the remaining markdown content, or null if the signifier is not found.
       */
      const validateAutoHeaderSignifier = (markdown, options) => {
          // Regular expression pattern to match the auto header signifier
          const autoHeaderPattern = /^\s*(?:@autoHeader:|<!--\s+autoHeader:)([\d.a-zA-Z\-:,~]*)(?:\s+-->)?/;
          const match = markdown.match(autoHeaderPattern);

          if (!match) {
              return logErrorMessage(options.debug, errorMessage.signifierNotFound);
          }

          // Remove the matched signifier from the markdown
          markdown = markdown.substring(match[0].length);

          return {
              headingSignifier: match[1], // The captured signifier
              markdown, // The remaining markdown content
          };
      };

      /**
       * Creates count context objects for header levels.
       * @param {Object} levels - The header levels configuration.
       * @returns {Object} An object containing the current counts and scoped tag names.
       */
      const createCountContextObjects = (levels) => {
          const configEntries = Object.entries(levels);

          // Create a map of current counts for each header level
          const currentCounts = new Map(
              configEntries.map(([key, { counter, type }]) => {
                  counter = parseInt(counter, 10); // Convert counter to an integer
                  counter = Number.isFinite(counter) ? counter - 1 : 0; // Decrement counter or set to 0 if not a number
                  return [key, { current: counter, type, skipDownstreamReset: true }];
              })
          );

          // Create a set of tag names that are in scope
          const scopedTagNames = new Set(
              configEntries.filter(([_, { inScope }]) => inScope).map(([key]) => key)
          );

          return { currentCounts, scopedTagNames };
      };

      /**
       * Applies the current count to the heading node.
       * @param {HTMLElement} headingNode - The heading node to update.
       * @param {Object} options - The current plugin options.
       * @param {string} options.separator - The separator for header numbering.
       */
      const applyCurrentCountThroughBoundContext = function (headingNode, options) {
          const { currentCounts, scopedTagNames } = this;
          const headingName = headingNode.tagName.toLowerCase();
          const headingNameList = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
          const counts = currentCounts.get(headingName);

          counts.current += 1; // Increment the current count for the heading level
          if (!counts.skipDownstreamReset) {
              // Reset counts for heading levels below the current level
              headingNameList.slice(headingNameList.indexOf(headingName) + 1).forEach(name => {
                  if (currentCounts.has(name)) {
                      const nextMinorCount = currentCounts.get(name);
                      nextMinorCount.current = 0;
                  }
              });
          }
          counts.skipDownstreamReset = false; // Reset the flag

          if (scopedTagNames.has(headingName)) {
              // Generate the counter value for the heading
              const counterValue = headingNameList
                  .slice(0, headingNameList.indexOf(headingName) + 1)
                  .map(name => {
                      const { current, type } = currentCounts.get(name);
                      return numberToHeader(current, type);
                  })
                  .join(options.separator) + options.separator;

              headingNode.innerHTML = `${counterValue} ${headingNode.innerHTML}`; // Update the heading's innerHTML
          }
      };

      /**
       * Parses the markdown content and updates headers based on the settings.
       * @param {string} markdown - The markdown content to parse.
       * @param {Object} options - The current plugin options.
       * @param {string} options.separator - The separator for header numbering.
       * @param {Object} levels - The header levels configuration.
       * @returns {string} The updated markdown content with applied header counts.
       */
      const parseMarkdown = (markdown, options, levels) => {
          const { currentCounts, scopedTagNames } = createCountContextObjects(levels);
          const headingPattern = /^(#{1,6})\s+(.*)$/gm; // Regex pattern to match markdown headers
          const headingNameList = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

          let result = markdown.replace(headingPattern, (match, hashes, text) => {
              const headingLevel = hashes.length;
              const headingName = `h${headingLevel}`;
              const counts = currentCounts.get(headingName);

              counts.current += 1; // Increment the current count for the heading level
              if (!counts.skipDownstreamReset) {
                  // Reset counts for heading levels below the current level
                  headingNameList.slice(headingLevel).forEach(name => {
                      if (currentCounts.has(name)) {
                          const nextMinorCount = currentCounts.get(name);
                          nextMinorCount.current = 0;
                      }
                  });
              }
              counts.skipDownstreamReset = false; // Reset the flag

              if (scopedTagNames.has(headingName)) {
                  // Generate the counter value for the heading
                  const counterValue = headingNameList
                      .slice(0, headingLevel)
                      .map(name => {
                          const { current, type } = currentCounts.get(name);
                          return numberToHeader(current, type);
                      })
                      .join(options.separator) + options.separator;
                  return `${hashes} ${counterValue} ${text}`; // Update the header in the markdown
              } else {
                  return match; // Return the original match if the heading is not in scope
              }
          });
          return result; // Return the updated markdown content
      };

      /**
       * Applies scoped heading counts to the input content.
       * @param {Object} levels - The header levels configuration.
       * @param {Object} options - The current plugin options.
       * @param {string} options.separator - The separator for header numbering.
       * @param {string} input - The input content (HTML or markdown).
       * @param {string} type - The type of input content ('html' or 'markdown').
       * @returns {string} The updated content with applied header counts.
       */
      const applyScopedHeadingCounts = (levels, options, input, type) => {
          const { currentCounts, scopedTagNames } = createCountContextObjects(levels);

          if (type === 'html') {
              // Parse the input HTML content
              const parser = new DOMParser();
              input = parser.parseFromString(input, 'text/html').body;

              // Get all heading elements
              const headingList = [...input.querySelectorAll('h1, h2, h3, h4, h5, h6')];

              // Apply the current count to each heading element
              headingList.forEach(
                  heading => applyCurrentCountThroughBoundContext.call(
                      { currentCounts, scopedTagNames },
                      heading,
                      options
                  )
              );

              return input.innerHTML; // Return the updated HTML content
          } else if (type === 'markdown') {
              // Parse and update the markdown content
              return parseMarkdown(input, options, levels);
          }
      };

      // Set the default options by merging user-defined options with default settings
      const defaultOptions = setDefaultOptions(docsifyAutoHeadersDefaults);
      if (!defaultOptions) return;

      // Initialize options with validated settings
      /**
       * The plugin options after validation and initialization.
       * @type {Object}
       * @property {string} separator - The separator for header numbering.
       * @property {Object} levels - The validated header levels configuration.
       * @property {boolean} sidebar - Boolean indicating if headers should be added to the sidebar.
       * @property {boolean} debug - Boolean to enable or disable debug messages.
       */
      let options = {
          separator: defaultOptions.separator,
          levels: validateThenGetHeadingRange(defaultOptions.levels, defaultOptions),
          sidebar: validateThenGetSidebar(defaultOptions.sidebar, defaultOptions),
          debug: defaultOptions.debug,
      };

      /**
       * Docsify hook to process markdown before it is rendered.
       * @param {Function} hook - Docsify hook function.
       * @param {Object} options - The current plugin options.
       */
      hook.beforeEach(markdown => {
          shouldContinue = true;
          if (!shouldContinue) return markdown;

          // Validate the presence of the auto header signifier in the markdown
          const result = validateAutoHeaderSignifier(markdown, options);
          if (!result) {
              return markdown;
          }
          let headingSignifier;
          ({ headingSignifier, markdown } = result); // Destructure the result

          // Validate and retrieve the heading range setting
          const headingRanges = validateThenGetHeadingRange(defaultOptions.levels, options);
          if (!headingRanges) {
              return markdown;
          }

          // Parse the starting values for headers from the signifier
          const startingHeadingValues = parseHeadingStartingValues(
              headingSignifier,
              options
          );
          if (!startingHeadingValues) {
              return markdown;
          }

          // Create the heading configuration
          const headingConfiguration = {};
          for (const [index, key] of Object.keys(headingRanges).entries()) {
              headingConfiguration[key] = {
                  ...headingRanges[key],
                  ...startingHeadingValues[index],
              };
          }

          // Update the options with the new heading configuration
          options.levels = headingConfiguration;

          return markdown; // Return the updated markdown
      });


      // Check if the sidebar option is enabled
      if (options.sidebar) {

          /**
           * Docsify hook to process markdown before it is rendered if the sidebar option is enabled.
           * @param {Function} hook - Docsify hook function.
           * @param {Object} options - The current plugin options.
           */
          hook.beforeEach((markdown, next) => {
              let output;

              try {
                  // Apply scoped heading counts to the markdown content
                  output = applyScopedHeadingCounts(
                      options.levels,
                      options,
                      markdown,
                      'markdown'
                  );
                  if (!shouldContinue) output = markdown;

              } catch (error) {
                  output = markdown;
                  console.warn(error.message);
              } finally {
                  next(output); // Pass the updated markdown to the next hook
              }
          });
      } else {

          /**
           * Docsify hook to process HTML after it is rendered if the sidebar option is disabled.
           * @param {Function} hook - Docsify hook function.
           * @param {Object} options - The current plugin options.
           */
          hook.afterEach((html, next) => {
              let output;

              try {
                  // Apply scoped heading counts to the HTML content
                  output = applyScopedHeadingCounts(
                      options.levels,
                      options,
                      html,
                      'html'
                  );
                  if (!shouldContinue) output = html;

              } catch (error) {
                  output = html;
                  console.warn(error.message);
              } finally {
                  next(output); // Pass the updated HTML to the next hook
              }
          });
      }
  };

  /**
   * Initializes the plugin if running in a browser environment.
   * This adds the autoHeaders plugin to the Docsify instance.
   */
  if (window) {
      window.$docsify = window.$docsify || {};

      // Merge user-defined settings with default settings
      window.$docsify.autoHeaders = Object.assign(
          docsifyAutoHeadersDefaults,
          window.$docsify.autoHeaders
      );

      // Add the autoHeaders function to the list of Docsify plugins
      window.$docsify.plugins = (
          window.$docsify.plugins || []
      ).concat(autoHeaders);
  }
})();
