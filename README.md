angular-search-filter
=====================

A smart search filter for AngularJS.

1. `bower install angular-search-filter`
2. Include the `search.js` script into your app.
3. Add `search` as a module dependency to your app.
4. Use the `search` filter in the view

        <ul>
            <li ng-repeat="some in something | search">{{ some }}</li>
        </ul>

5. Use the `search` filter in the controller

        $scope.doSomething = function() {
            $scope.filteredStructure = $filter('search')($scope.originalStructure, $scope.query);
        };
