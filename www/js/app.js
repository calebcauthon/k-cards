// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'recipeApp.config', 'starter.controllers', 'starter.services', 'k-cards-models'])

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
    cache: false,
    controller: function($scope, $stateParams) {
      $scope.id = $stateParams.id;
    },
    resolve: {
      recipe: function() {
        var cache = {};

        return function($http, $stateParams, api_endpoint, Recipe) {
          return $http.get(api_endpoint + '/recipe/' + $stateParams.id).then(function(response) {
            if(cache[$stateParams.id])
              return cache[$stateParams.id];

            var recipe = new Recipe(response.data);
            cache[$stateParams.id] = recipe;
            return recipe;
          });
        };
      }()
    }
  })

  .state('recipe.view', {
    url: '/steps',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-recipe.html',
        controller: 'RecipeViewCtrl'
      }
    }
  })

  .state('recipe.grocery', {
    url: '/grocery',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-grocery.html',
        controller: 'GroceryCtrl'
      }
    }
  })

  .state('recipe.ask-ingredients', {
    url: '/ask-how-much',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-ask.html',
        controller: 'AskHowMuchCtrl'
      }
    }
  })

  .state('recipe.ask-ingredients-serving-size', {
    url: '/ask-how-much-serving size',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-ask-serving-size.html',
        controller: 'AskHowMuchCtrl'
      }
    }
  })

  .state('recipe.ask-to-remove-ingredients', {
    url: '/ask-to-remove',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-ask-to-remove.html',
        controller: 'AskToRemoveCtrl'
      }
    }
  })

  .state('recipe.ingredients-ask-ingredients', {
    url: '/ingredients-ask-how-much',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-ask.html',
        controller: 'AskHowMuchCtrl'
      }
    }
  })

  .state('tab.grocery', {
    url: '/all-groceries',
    cache: false,
    resolve: {
      lists: function(grocery) {
        return grocery.getLatestsGroceryLists();
      }
    },
    views: {
      'tab-grocery': {
        templateUrl: 'templates/tab-grocery-all.html',
        controller: 'AllGroceryCtrl'
      }
    }
  })

  .state('tab.list-settings', {
    url: '/grocery-list-settings/:name',
    cache: false,
    resolve: {
      groceryList: function($stateParams, grocery) {
        return grocery.getLatestsGroceryLists().then(function(lists) {
          return _.find(lists, function(list) {
            return list.name == $stateParams.name;
          });
        });
      }
    },
    views: {
      'tab-grocery': {
        templateUrl:  'templates/tab-list-settings.html',
        controller: 'ListSettingsCtrl'
      }
    }
  })

  .state('recipe.grocery-all', {
    url: '/all-groceries',
    cache: false,
    resolve: {
      lists: function($http, api_endpoint, grocery) {
        return grocery.getLatestsGroceryLists();
      }
    },
    views: {
      'tab-grocery': {
        templateUrl: 'templates/tab-grocery-all.html',
        controller: 'AllGroceryCtrl'
      }
    }
  })

  .state('recipe.ingredients', {
    url: '/ingredients',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-ingredients.html',
        controller: function($ionicHistory, $scope, $state, recipe) {
          $scope.goBack = function() { $ionicHistory.goBack() };

          $scope.id = recipe.id;

          $scope.stepIndexOf = function(ingredient) {
            var step = _.find(recipe.steps, function(step) {
              return step.ingredients.join(' ') == ingredient;
            });

            return _.indexOf(recipe.steps, step);
          };

          $scope.recipe = recipe;

          $scope.askHowMuch = function(ingredients) {
            $state.go('recipe.ingredients-ask-ingredients');
          };

          $scope.$on('$ionicView.beforeEnter', function() {
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
          });

          $scope.amountFor = function(ingredient, amount, measurement, serving_size) {
            if(!ingredient.amount_text)
              return '';

            return ingredient.amount_text.replace('{{value}}', ingredient.amount_numeric * serving_size);
          };
        }
      }
    }
  })

  .state('recipe.ingredient-detail', {
    url:'/ingredients/:step/:name',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-ingredient-detail.html',
        controller: function($state, $http, $ionicHistory, recipe, $scope, $stateParams, api_endpoint) {
          $scope.goBack = function() { $ionicHistory.goBack(); };

          var step = recipe.steps[$stateParams.step];
          var ingredient = step.ingredients.join(' ');

          $scope.serving_size = recipe.serving_size;
          $scope.step = step;
          $scope.ingredient = ingredient;
          $scope.amount = step.amounts[0];
          $scope.measurement = step.measurements.join(' ');

          $scope.new_amount = Number($scope.amount);
          $scope.new_measurement =  $scope.measurement

          $scope.updateIngredientAmount = function(new_amount, new_measurement) {
            var old_amount_and_measurement = [$scope.amount].concat(step.measurements).join(' ');
            var new_amount_and_measurement = new_amount + ' ' + new_measurement;

            step.text = step.text.replace(old_amount_and_measurement, new_amount_and_measurement);
            step.amounts[0] = new_amount;
            step.measurements = [new_measurement];

            $scope.amount = step.amounts[0];

            $scope.saveRecipe(recipe);
          };

          $scope.updateIngredient = function(new_ingredient) {
            step.text = step.text.replace(ingredient, new_ingredient);
            step.ingredients = new_ingredient.split(' ');
            ingredient = step.ingredients.join(' ');
            $scope.ingredient = step.ingredients.join(' ');

            $scope.saveRecipe(recipe);
          };

          $scope.saveRecipe = function(recipe) {
            $http.post(api_endpoint + '/update-recipe/', {
              id: $scope.id,
              recipe: recipe
            }).then(function(response) {
              $scope.creating = false;
            }, function(err) {
              $scope.creating = false;
            });
          }
        }
      }
    }
  })

  .state('tab.dash', {
    url: '/dash',
    cached: false,
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
