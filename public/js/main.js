angular.module('Tahona', ['ngRoute'])

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
			.when('/', {
				templateUrl : '/html/user.html',
				controller : 'mainController'
			})
			// .when('/profile/:heroName', {
			// 	templateUrl : '/html/hero.html',
			// 	controller : 'heroController'
			// })
			// .when('/error', {
			// 	templateUrl : 'html/error.html',
			// 	controller : 'errorController'
			// })
			.otherwise({
				redirectTo : '/error'
			})
	}])

angular.module('Tahona')
	.controller('mainController', ['$scope', '$http', 'authService', function($scope, $http, authService){

		authService.authCheck(function(user){
			console.log('USER!', user)
			$scope.user = user
		})

	}])
