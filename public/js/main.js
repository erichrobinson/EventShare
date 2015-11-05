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
			.when('/', {
				templateUrl : '/html/index.html',
				controller : 'mainController'
			})
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
			}
		})
	}])

angular.module('Tahona')
	.controller('userController', ['$scope', '$http', 'authService', '$location', '$routeParams', '$rootScope', '$mdDialog', function($scope, $http, authService, $location, $routeParams, $rootScope, $mdDialog){

		$scope.allUsers = []
		$rootScope.listOfAllUsers = $scope.allUsers
		$rootScope.allUserEvents
		$scope.displayEventPreview = false
		$scope.updatedUsers = []
		
		// GET UPDATED LIST OF ALL SITE USERS - LOGGED IN OR NOT 
		$http.get('/updateAllUsers')
			.then(function(returnData){
				for(var i =0; i < returnData.data.length; i++){
					$scope.updatedUsers.push(returnData.data[i])
				}
			})

		// GET REQUEST TO FIND AND SET CURRENT USER 
		$http.get('/getUserName?id=' + $routeParams.userID)
			.then(function(returnData){
				$scope.userName = $rootScope.currentUser.username
				for(var i = 0; i < returnData.data[0].events.length; i++){
				}
			})

		// GET REQUEST TO FIND ALL USER EVENTS
		$http.get('/findAllEvents?id=' + $routeParams.userID)
			.then(function(returnData){
				$rootScope.allUserEvents = returnData.data[0].events
			})		

		// FIND EVENT AND ROUTE TO NEW PAGE
		$scope.goToEvent = function(index, event){
			$http.get('/findSpecificEvent?id=' + $routeParams.userID + "&eventName=" + event.eventName)
				.then(function(returnData){
				console.log(returnData)
					$rootScope.allEventData = returnData.data			
					$rootScope.currentEvent = returnData.data.eventName
					$rootScope.currentTasks = returnData.data.tasks
					$location.url("/event/" + returnData.data)  
				})
		}

		// DISPLAY EVENT CREATION MODAL
		$scope.showEventCreationModal = function(){

			$mdDialog.show({
				controller : 'userController',
				templateUrl : '../html/create-event.html',
				parent : angular.element(document.body),
				clickOutsideToClose : true
			})
		}

		// FIND LIST OF ALL USERS
		$http.get("/findAllUsers?id=" + $routeParams.userID)
			.then(function(returnData){	
				for(var i =0; i < returnData.data.length; i++){
					$scope.allUsers.push(returnData.data[i])
				}		
		})

		$scope.findAllUsers = function(){
			$http.get("/findAllUsers?id=" + $routeParams.userID)
			.then(function(returnData){	
				for(var i =0; i < returnData.data.length; i++){
					$scope.allUsers.push(returnData.data[i])
				}		
				console.log(returnData.data.length)
				console.log($scope.allUsers)
			})
		}

		// CREATE OBJECT OF USER ID AND SUBMITTED EVENT - POST TO DB
		$scope.submitNewEvent = function(){

			$scope.selectedContacts.push($rootScope.currentUser)
			console.log($scope.selectedContacts)

			var tempEventObj = {
				userID : $routeParams.userID,
				eventName : $scope.event.title,
				eventType : $scope.tempEventType,
				eventDescription : $scope.event.description,
				host : $rootScope.currentUser.username,
				invites : $scope.selectedContacts
			}
			$http.post('/createEvent', tempEventObj)
		      	.then(function(returnData){		  
		    
		      	})
		    $http.get('/findAllEvents?id=' + $routeParams.userID)
				.then(function(returnData){
					console.log(returnData.data[0].events)
					$rootScope.allUserEvents = returnData.data[0].events;
					console.log($rootScope.allUserEvents)					
			})
			$mdDialog.hide()
			
		}

		$scope.setEventType = function(eventType){
			$scope.tempEventType = eventType 
		} 
	
		// REMOVE SELECTED EVENT
		$scope.removeEvent = function(indexOfEvent, eventToRemove){
			// console.log("index", indexOfEvent)
			// console.log("event", eventToRemove)
			var tempRemoveObj = {
				index : indexOfEvent,
				user : $rootScope.currentUser._id,
				event : eventToRemove,
				allUsers : $scope.updatedUsers
			}
			$http.post('/removeEvent', tempRemoveObj)
				.then(function(returnData){
					console.log(returnData)
				})
			$http.get('/findAllEvents?id=' + $routeParams.userID)
				.then(function(returnData){
					console.log(returnData.data[0].events)
					$rootScope.allUserEvents = returnData.data[0].events;
					console.log($rootScope.allUserEvents)					
			})
		}

		// ADD USERS TO NEW EVENT
		$scope.selectedContacts = []

		$scope.addUserToEvent = function(user){
			$scope.selectedContacts.push(user)
		}

	}])



angular.module('Tahona')
	.controller('createEventController', ['$scope', '$http', 'authService', '$location', '$routeParams', '$rootScope', '$mdDialog', function($scope, $http, authService, $location, $routeParams, $rootScope, $mdDialog){
		
		$scope.testEvent = "testing event works"

	}])
		
angular.module('Tahona')
	.controller('eventController', ['$scope', '$http', 'authService', '$location', '$routeParams', '$rootScope', '$mdDialog', function($scope, $http, authService, $location, $routeParams, $rootScope, $mdDialog){

		$scope.allUsers = $rootScope.listOfAllUsers
		$scope.eventHost = $rootScope.currentUser
		$scope.showEvent = true
		$scope.urgent = false
		$scope.updatedUsers = []
		$scope.selectedContacts = []
		$scope.currentEventInfo = $rootScope.allEventData

		$http.get('/updateAllUsers')
			.then(function(returnData){
				for(var i =0; i < returnData.data.length; i++){
					$scope.updatedUsers.push(returnData.data[i])
				}
			})

		$scope.addUserToTask = function(user){
			$scope.selectedContacts.push(user)
		}	

		$scope.toggleUrgent = function(){
			$scope.urgent = !$scope.urgent
			console.log($scope.urgent)
		}

		// DISPLAY TASK CREATION MODAL
		$scope.showTaskCreationModal = function(){
			
			$mdDialog.show({
				controller : 'eventController',
				templateUrl : '../html/create-task.html',
				parent : angular.element(document.body),
				clickOutsideToClose : true
			})
		}

		// CREATE A NEW TASK
		$scope.submitNewTask = function(){
			$scope.task.urgent = false
			var tempTaskObj = {
				eventHost : $scope.eventHost,
				taskName : $scope.task.title,
				taskUsers : $scope.selectedContacts,
				taskUrgent : $scope.urgent,
				currentEvent : $rootScope.currentEvent
			}
			$http.post('/createTask', tempTaskObj)
		      	.then(function(returnData){})
		    $http.get('/findAllTasks?id=' + $scope.eventHost._id )
				.then(function(returnData){
					console.log(returnData.data[0].events)
					$rootScope.allUserEvents = returnData.data[0].events
					// Reset value of current tasks to reflect the newly added task
					for(var i =0; i < returnData.data[0].events.length; i++){
						if(returnData.data[0].events[i].eventName === $rootScope.currentEvent){
							$rootScope.currentTasks = returnData.data[0].events[i].tasks
						}
					}
			})
			$mdDialog.hide()
		}

		// REMOVE A TASK
		$scope.removeTask = function(){
			var tempRemoveObj = {
				task : this.task,
				user : $rootScope.currentUser,
				currentEvent : $rootScope.currentEvent
			}
			console.log($rootScope.currentUser)
			$scope.showEvent = !$scope.showEvent
			$http.post('/removeTask', tempRemoveObj)
				.then(function(){
					console.log("success")
				})
			$http.get('/findAllTasks?id=' + $scope.eventHost._id )
				.then(function(returnData){
					console.log(returnData.data[0].events)
					$rootScope.allUserEvents = returnData.data[0].events
					// Reset value of current tasks to reflect the newly added task
					for(var i =0; i < returnData.data[0].events.length; i++){
						if(returnData.data[0].events[i].eventName === $rootScope.currentEvent){
							$rootScope.currentTasks = returnData.data[0].events[i].tasks
						}
					}
			})
		}

	}])








