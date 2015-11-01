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
			.when('/event/:eventName', {
				templateUrl : '/html/event.html',
				controller : 'eventController'
			})
			// .when('/error', {
			// 	templateUrl : 'html/error.html',
			// 	controller : 'errorController'
			// })
			// .otherwise({
			// 	redirectTo : '/error'
			// })
	}])

angular.module('Tahona')
	.controller('mainController', ['$scope', '$http', 'authService', '$location', '$routeParams', '$rootScope', function($scope, $http, authService, $location, $routeParams, $rootScope){



		authService.authCheck(function(user){
			$rootScope.currentUser = user
			if(user){
				$location.url('/user/' + user._id)
				// $http.get('/getUserName?id='+$routeParams.userID)
				// $http.get('/getUserName/')
				// 	.then(function(returnData){
				// 		console.log(returnData)
				// 	})

			}
		})
	}])

angular.module('Tahona')
	.controller('userController', ['$scope', '$http', 'authService', '$location', '$routeParams', '$rootScope', '$mdDialog', function($scope, $http, authService, $location, $routeParams, $rootScope, $mdDialog){

		$scope.userEvents

		// GET REQUEST TO FIND AND SET CURRENT USER 
		$http.get('/getUserName?id=' + $routeParams.userID)
			.then(function(returnData){
				$scope.userName = $rootScope.currentUser.username
			})

		// GET REQUEST TO FIND ALL USER EVENTS
		$http.get('/findAllEvents?id=' + $routeParams.userID)
			.then(function(returnData){
				console.log($routeParams)
				console.log(returnData.data)
				$scope.userEvents = returnData.data[0].events
			})

		// CREATE OBJECT OF USER ID AND SUBMITTED EVENT - POST TO DB
		$scope.createEvent = function(){
			console.log($scope.event.title)
			var testObj = {
				userID : $routeParams.userID,
				eventName : $scope.event.title
			}
			$http.post('/createEvent', testObj)
		      	.then(function(returnData){		  
		      		console.log("returnDataFromServer", returnData)
		      	})
		    $http.get('/findAllEvents?id=' + $routeParams.userID)
				.then(function(returnData){
					console.log($routeParams)
					console.log(returnData.data[0].events)
					$scope.userEvents = returnData.data[0].events
			})
		}

		// FIND EVENT AND ROUTE TO NEW PAGE
		$scope.goToEvent = function(index, event){
			$http.get('/findSpecificEvent?id=' + $routeParams.userID + "&eventName=" + event.eventName)
				.then(function(returnData){
						$rootScope.currentEvent = returnData.data
						$location.url("/event/" + returnData.data)
				})
		}

		
		

		// $scope.showConfirm = function(ev) {
		//     // Appending dialog to document.body to cover sidenav in docs app
		//     var confirm = $mdDialog.confirm()
		//           .title('Create an Event')
		//           .content('<form><input ng-model="newEvent.name" placeholder="event name"> <md-datepicker ng-model="myDate" md-placeholder="Enter date"></md-datepicker><form>')		        
		//           .ariaLabel('Lucky day')
		//           .targetEvent(ev)
		//           .ok('Submit')
		//           .cancel('Cancel');
		//     $mdDialog.show(confirm).then(function() {
		//       $scope.status = 'You decided to get rid of your debt.';
		//       console.log("test")
		//       $scope.createEvent()
		//     }, function() {
		//       $scope.status = 'You decided to keep your debt.';
		//     });
  // };	

	}])

angular.module('Tahona')
	.controller('eventController', ['$scope', '$http', 'authService', '$location', '$routeParams', '$rootScope', '$mdDialog', function($scope, $http, authService, $location, $routeParams, $rootScope, $mdDialog){
		$scope.testEvent = "testing event works"
	}])
