angular.module('Tahona', ['ngRoute', 'ngMaterial'])

angular.module('Tahona')
	.service('authService', ['$http', '$location', function($http){
		
		this.authCheck = function(cb){
			$http.get('/api/me')
				.then( function(returnData){
					cb(returnData.data)
				})
		}										
	}])

angular.module('Tahona')
	.config(['$routeProvider', function($routeProvider){
		// No need to define #, it is assumed
		$routeProvider
			// .when('/', {
			// 	templateUrl : '/html/home.html',
			// 	controller : 'mainController'
			// })
			.when('/user/:userID', {
				templateUrl : '/html/user.html',
				controller : 'mainController'
			})
			.when('/event/:eventID', {
				templateUrl : '/html/event.html',
				controller : 'mainController'
			})
			// .when('/error', {
			// 	templateUrl : 'html/error.html',
			// 	controller : 'errorController'
			// })
			.otherwise({
				redirectTo : '/error'
			})
	}])

angular.module('Tahona')
	.controller('mainController', ['$scope', '$http', 'authService', '$location', function($scope, $http, authService, $location){



		$scope.title = "working"

		authService.authCheck(function(user){
			console.log('USER!', user)
			$scope.user = user
			if(user){
			$location.url('/user/' + user._id)
		}
		})

		

	}])
