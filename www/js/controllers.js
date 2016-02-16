angular.module('starter.controllers', ['recipeApp.config', 'k-cards-services', 'starter.services'])

.controller('AskHowMuchCtrl', function($scope, $state, $http, $ionicHistory, api_endpoint, recipe, grocery) {
  $scope.recipe = recipe;

  $scope.cancel = function() {
    $ionicHistory.goBack();
  };

  function save() {
    if(!grocery.data().name) {
      $http.post(api_endpoint + '/save-grocery-list', {
        name: 'My Grocery List',
        list: grocery.data().list
      }).then(function(response) {
        grocery.getLatestsGroceryLists().then(function(lists) {
          $scope.groceryLists = lists
          var saved_list = _.find(lists, function(list) {
            return list.name == 'My Grocery List';
          });
          grocery.setList(saved_list.list, saved_list.name, saved_list.id);
        });
      });
    } else {
      $http.post(api_endpoint + '/update-grocery-list', grocery.data());
    }
  };

  $scope.saveServingSize = function() {
    recipe.serving_ratio = $scope.multiplier;

    var ingredients = recipe.getIngredients();
    _.each(ingredients, function(ingredient) {
      $scope.addToGroceryList(ingredient);
    });

    console.log(grocery.data());

    $ionicHistory.goBack();
  };

  $scope.addToGroceryList = function(ingredient) {
    var result = grocery.add(ingredient, recipe);
    save();
    return result;
  };

  $scope.setMultiplier = function(value) {
    $scope.multiplier = value;
    $scope.servings = recipe.serving_size * $scope.multiplier;
  };

  $scope.setServings = function(value) {
    $scope.servings = value;
    $scope.multiplier = $scope.servings / recipe.serving_size;
  };

  $scope.incrementServings = function() {
    $scope.setServings($scope.servings + 1);
  };

  $scope.decrementServings = function() {
    $scope.setServings($scope.servings - 1);
  };

  $scope.incrementMultiplier = function() {
    $scope.setMultiplier($scope.multiplier + 1);
  };

  $scope.decrementMultiplier = function() {
    $scope.setMultiplier($scope.multiplier - 1);
  };

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.setMultiplier(recipe.serving_ratio || 1);
  });
})

.controller('AskToRemoveCtrl', function($scope, $http, $ionicHistory, api_endpoint, recipe, grocery) {
  $scope.recipe = recipe;

  $scope.cancel = function() {
    $ionicHistory.goBack();
  };

  $scope.removeFromGroceryList = function() {
    var result = grocery.remove(recipe.getIngredients(), recipe);
    save();

    $ionicHistory.goBack();
  };

  function save() {
    if(!grocery.data().name) {
      $http.post(api_endpoint + '/save-grocery-list', {
        name: 'My Grocery List',
        list: grocery.data().list
      }).then(function(response) {
        grocery.getLatestsGroceryLists().then(function(lists) {
          $scope.groceryLists = lists
          var saved_list = _.find(lists, function(list) {
            return list.name == 'My Grocery List';
          });
          grocery.setList(saved_list.list, saved_list.name, saved_list.id);
        });
      });
    } else {
      $http.post(api_endpoint + '/update-grocery-list', grocery.data());
    }
  };
})

.controller('AllGroceryCtrl', AllGroceryCtrl)

.controller('ListSettingsCtrl', function($ionicHistory, $scope, $http, api_endpoint, groceryList, grocery) {
  $scope.list = groceryList;

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  $scope.clear = function() {
    $http.post(api_endpoint + '/update-grocery-list', {
      id: groceryList._id,
      name: groceryList.name,
      list: []
    }).then(function(response) {
      grocery.setList([], groceryList.name, groceryList._id);
      $ionicHistory.goBack();
    });
  };

  $scope.save = function() {
    if(grocery.data().id == groceryList._id)
      grocery.setName(groceryList.name);

    $http.post(api_endpoint + '/update-grocery-list', {
      id: groceryList._id,
      name: groceryList.name,
      list: groceryList.list
    }).then(function(response) {
    });

    $ionicHistory.goBack();
  };

  $scope.destroy = function() {
    $http.post(api_endpoint + '/destroy-grocery-list', { id: groceryList._id }).then(function() {
      $ionicHistory.goBack();
    });
  };
})

.controller('GroceryCtrl', function($http, api_endpoint, $scope, $state, recipe, grocery) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.recipe = recipe;
    $scope.ingredients = recipe.getIngredients();
  });

  function save() {
    if(!grocery.data().name) {
      $http.post(api_endpoint + '/save-grocery-list', {
        name: 'My Grocery List',
        list: grocery.data().list
      }).then(function(response) {
        grocery.getLatestsGroceryLists().then(function(lists) {
          $scope.groceryLists = lists
          var saved_list = _.find(lists, function(list) {
            return list.name == 'My Grocery List';
          });
          grocery.setList(saved_list.list, saved_list.name, saved_list.id);
        });
      });
    } else {
      $http.post(api_endpoint + '/update-grocery-list', grocery.data());
    }
  };

  $scope.askHowMuch = function(ingredients) {
    $state.go('recipe.ask-ingredients');
  };

  $scope.askToRemove = function(ingredients) {
    $state.go('recipe.ask-to-remove-ingredients');
  };

  $scope.groceryItem = function(ingredient) {
    return grocery.get(ingredient, recipe);
  };

  $scope.toggleGroceryList = function(ingredient) {
    if($scope.isInGroceryList(ingredient))
      $scope.removeFromGroceryList(ingredient)
    else
      $scope.addToGroceryList(ingredient);
  };

  $scope.removeFromGroceryList = function(ingredient) {
    var result = grocery.remove(ingredient, recipe);
    save();
    return result;
  };
  $scope.addToGroceryList = function(ingredient) {
    var result = grocery.add(ingredient, recipe);
    save();
    return result;
  };
  $scope.isInGroceryList = function(ingredient) {
    return grocery.isInList(ingredient, recipe);
  };

  $scope.viewRecipe = function() {
    $state.go('recipe.view', { recipe: recipe });
  };
})

.controller('DashCtrl', function(grocery, api_endpoint, $ionicNavBarDelegate, $http, $scope, $state) {
  grocery.loadDefault();

  $scope.view = function(id) {
    $state.go('recipe.grocery', { id: id });
  };

  $scope.isInGroceryList = function(recipe_id) {
    return grocery.hasIngredientsFrom(recipe_id);
  };

  $http.post(api_endpoint + '/recipes').then(function(response) {
    _.each(response.data, function(record) {
      $scope.recipes.push({
        id: record._id,
        recipe_name: record.name
      });
    });
  });

  $scope.recipes = [];
})

.controller('RecipeViewCtrl', function($state, $ionicHistory, $scope, recipe, $ionicNavBarDelegate) {
  $scope.goBack = function() { $ionicHistory.goBack() };
  $scope.viewIngredients = function() {
    $state.go('recipe.ingredients');
  };

  $scope.recipe = recipe;

  $scope.interpolatedStep = function(step) {
    var text = step.text;

    // remove VERB
    text = text.replace(step.verb, '');

    // replace AMOUNT
    if(step.amounts.length) {
      var amount_in_original_text = step.amounts.join(' ');
      var new_amount = Number(amount_in_original_text) * (recipe.serving_ratio || recipe.serving_size);
      text = text.replace(amount_in_original_text, new_amount);
    }

    return text;
  };
});
