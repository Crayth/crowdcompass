// Decided to use Angular, makes things easier than having to think in basic Javascript.
var cc = angular.module("crowdCompassApp", []);

cc.controller("crowdCompassController", function($scope, $http) {
    // Have to load in JQuery to use its AJAX! Figured I'd just stick it on the scope for easy access.
    $(document).ready(function ($) {
        $scope.$ = $;
    });
    // Need some objects to handle our data! This could be neater, but it works for now.
    $scope.zips = {first: null, second: null};
    $scope.results = {first: {}, second: {}};
    $scope.difference = null;

    $scope.aggregateZipCodes = function () {
        /* Shame on Wunderground for not having the ability to combine multiple cities into one "conditions" call!
         Makes the task more tedious for the developer ;) Normally, I would do these ajax calls by iterating on
         the zips object using a promise to call the next one, but I guess for the purposes of 'getting it to work'
         I'll go a less desirable route... */

        $scope.results.first = {}; $scope.results.second = {}; $scope.difference = null;

        var firstIsValid = /^[0-9]{5}(?:-[0-9]{4})?$/.test($scope.zips.first);
        var secondIsValid = /^[0-9]{5}(?:-[0-9]{4})?$/.test($scope.zips.second);
        var exitEarly = false;
        if($scope.zips.first == null || $scope.zips.first == ""){
            $scope.results.first.error = {description: "Please enter a zipcode."};
            exitEarly = true;
        }
        else if(!firstIsValid){
            $scope.results.first.error = {description: "The zipcode you entered is not valid."};
            exitEarly = true;
        }

        if($scope.zips.second == null || $scope.zips.second == "") {
            $scope.results.second.error = {description: "Please enter a zipcode."};
            exitEarly = true;
        }
        else if(!secondIsValid){
            $scope.results.second.error = {description: "The zipcode you entered is not valid."};
            exitEarly = true;
        }

        if(exitEarly){
            return;
        }


        // first city data
        $scope.results.first = {};
        var firstUrlObs = "http://api.wunderground.com/api/625172310aff38a6/conditions/q/" + $scope.zips.first + ".json";
        $http.get(firstUrlObs)
            .then(function (response) {
                $scope.results.first.current_observation = response.data.current_observation;
                $scope.calculateDifferenceInTemperatures();
            });
        var firstUrlLoc = "http://api.wunderground.com/api/625172310aff38a6/geolookup/q/" + $scope.zips.first + ".json";
        $http.get(firstUrlLoc)
            .then(function (response) {
                if(response.data.response.error){
                    $scope.results.first.error = response.data.response.error;
                }
                else {
                    $scope.results.first.location = response.data.location;
                }
            });

        // second city data
        $scope.results.second = {};
        var secondUrlObs = "http://api.wunderground.com/api/625172310aff38a6/conditions/q/" + $scope.zips.second + ".json";
        $http.get(secondUrlObs)
            .then(function (response) {
                $scope.results.second.current_observation = response.data.current_observation;
                $scope.calculateDifferenceInTemperatures();
            });
        var secondURLLoc = "http://api.wunderground.com/api/625172310aff38a6/geolookup/q/" + $scope.zips.second + ".json";
        $http.get(secondURLLoc)
            .then(function (response) {
                if(response.data.response.error){
                    $scope.results.second.error = response.data.response.error;
                }
                else {
                    $scope.results.second.location = response.data.location;
                }
            });
    };

    $scope.calculateDifferenceInTemperatures = function (){
        if(!$scope.results.first.current_observation || !$scope.results.second.current_observation){
            return null;
        }
        else {
            $scope.difference = Math.abs($scope.results.first.current_observation.temp_f - $scope.results.second.current_observation.temp_f).toFixed(2);
            return;
        }
    }
});