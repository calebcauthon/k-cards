// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'recipeApp.config', 'starter.controllers', 'starter.services'])

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
      recipe: function($http, $stateParams, api_endpoint) {
        return $http.get(api_endpoint + '/recipe/' + $stateParams.id).then(function(response) {

          return {
            serving_size: response.data.serving_size,
            steps: response.data.steps,
            name: response.data.name
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
        controller: 'RecipeViewCtrl'
      }
    }
  })

  .state('recipe.ingredients', {
    url: '/ingredients',
    views: {
      'tab-ingredients': {
        templateUrl: 'templates/tab-ingredients.html',
        controller: function($scope, recipe) {
          $scope.setServingSize = function(size) {
            $scope.serving_size = Number(size);
            recipe.serving_ratio = $scope.serving_size / recipe.serving_size;
          };

          $scope.recipe = recipe;
          $scope.setServingSize(recipe.serving_size);

          $scope.ingredients = _.chain(recipe.steps)
            .map(function(step) {
              var ingredient_words = step.ingredients;

              return {
                text: ingredient_words.join(' '),
                amount: Number(step.amounts[0]),
                measurement: step.measurements[0]
              };
            })
            .select(function(data) {
              return data.text.length;
            }).uniq().value();

          $scope.amountFor = function(ingredient, amount, measurement, serving_size) {
            if(!ingredient.amount_text)
              return '';

            return ingredient.amount_text.replace('{{value}}', ingredient.amount_numeric * serving_size);
          };
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
