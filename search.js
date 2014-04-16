angular.module('search', [])
    .filter('search', ['$filter', function ($filter) {
        function forwardSearch(needle, haystack, start) {
            var found = false;
            var index = start;
            while(index < haystack.length && !found) {
                if(index === haystack.length-1) {
                    found = haystack.substr(start+1, index-start);
                } else if(haystack.charAt(index).match(needle)) {
                    found = haystack.substr(start+1, index-start-1);
                }
                index++;
            }

            return found;
        }

        function backwardSearch(needle, haystack, start) {
            var found = false;
            var index = start;

            // Finding needle backwards from start
            while(index >= 0 && !found) {
                if(0 === index) {
                    found = haystack.substr(index, start-index);
                } else if(haystack.charAt(index).match(needle)) {
                    found = haystack.substr(index+1, start-index-1);
                }
                index--;
            }

            return found;
        }

        return function (array, expression) {
            // Filter using object keys
            var colonPos = expression.indexOf(':');
            if(colonPos > -1) {
                // If found at least a colon, we want to filter by object key.
                // What's before the : should be the key name and what's after should be the search string.
                // We separate each object key by a space.
                var keys = [];

                while(colonPos > -1) {
                    // Find the key name
                    var key = backwardSearch(/\s|:/, expression, colonPos);

                    // Find the search value
                    var keyValue = forwardSearch(/\s|:/, expression, colonPos);

                    // If we found a key, keep the key and the value
                    if(key) {
                        keys.push({key: key, value: keyValue});
                    }

                    colonPos = expression.indexOf(':', colonPos+1);
                }

                // Take the found keys and change the value sent to the filter
                if(keys && keys.length > 0) {
                    expression = {};
                    angular.forEach(keys, function(key) {
                        expression[key.key] = key.value;
                    });
                }
            }

            // Filter using multiple OR only on string so we can't combine both searches
            if(typeof expression === "string") {
                var plusPos = expression.indexOf('+');
                if(plusPos > -1) {
                    // If found at least a plus sign, we want to filter by some string and some other string.
                    // Both strings should be delimited by spaces on each side so we can match words.
                    var terms = [];

                    while(plusPos > -1) {
                        // Find the key name
                        var before = backwardSearch(/\s|\+/, expression, plusPos);

                        // Find the search value
                        var after = forwardSearch(/\s|\+/, expression, plusPos);

                        // If we found a plus, keep the before and after strings
                        if(before && after) {
                            terms.push(before);
                            terms.push(after);
                        }

                        plusPos = expression.indexOf('+', plusPos+1);
                    }

                    // Take the found terms and change the value sent to the filter
                    if(terms && terms.length > 0) {
                        angular.forEach(terms, function(key, index) {
                            // Do search on our array only if not the last search
                            if(index < terms.length)
                                array = $filter('filter')(array, key);

                            // Set the final search string
                            expression = key;
                        });
                    }
                }
            }

            // Use angular builtin filter
            return $filter('filter')(array, expression);
        };
    }]);
