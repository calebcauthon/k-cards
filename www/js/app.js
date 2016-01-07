// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/home-tabs.html'
  })

  .state('recipe', {
    url: '/recipe/:id',
    abstract: true,
    templateUrl: 'templates/recipe-tabs.html',
    controller: function($scope, $stateParams) {
      $scope.id = $stateParams.id;
    },
    resolve: {
      recipe: function($http, $stateParams) {
        var url = 'templates/recipes/' + $stateParams.id + '.txt';
        return $http.get(url).then(function(response) {
          var steps = _.map(response.data.split("\n"), function(line) {
            try {
              var verb = line.match(/^[^a-z0-9]+[^a-z0-9\ ]/)[0];

              return {
                verb: verb,
                other: line.replace(verb, ''),
                text: line
              };
            } catch (err) {
              return {
                verb: '',
                other: '',
                text: ''
              };
            }
          });

          return {
            full_text: response.data,
            steps: steps,
            name: $stateParams.id
          };
        });
        
      }
    }
  })


  .state('recipe.view', {
    url: '/steps',
    views: {
      'tab-recipe': {
        templateUrl: 'templates/tab-recipe.html',
        controller: function($state, $scope, $http, recipe, $ionicNavBarDelegate) {
          
          $scope.$on('$ionicView.enter', function() {
            $ionicNavBarDelegate.forceShowBackButton(function() {
              $state.go('tab.dash');
              $ionicNavBarDelegate.unForceShowBackButton();
            });

            $scope.name = recipe.name;
            $scope.steps = recipe.steps;
          });
        }
      }
    }
  })

  .state('recipe.ingredients', {
    url: '/ingredients',
    views: {
      'tab-ingredients': {
        templateUrl: 'templates/tab-ingredients.html',
        controller: function(recipe) {
        }
      }
    }
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
