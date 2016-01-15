angular.module('starter.controllers', ['recipeApp.config'])

.controller('GroceryCtrl', function($scope, recipe) {
  $scope.groceries = [];
  $scope.recipe = recipe;

  $scope.ingredients = recipe.getIngredients();

  var groceries = [];

  $scope.toggleGroceryList = function(ingredient) {
    if($scope.isInGroceryList(ingredient))
      $scope.removeFromGroceryList(ingredient)
    else
      $scope.addToGroceryList(ingredient);
  };

  $scope.removeFromGroceryList = function(ingredient) {
    groceries = _.reject(groceries, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe == recipe
    });
  };

  $scope.addToGroceryList = function(ingredient) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.map(ingredient, function(this_ingredient) {
        $scope.addToGroceryList(this_ingredient);
      });

    var alreadyAdded = _.find(groceries, function(groceryItem) {
        return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe == recipe
      });

    if(!alreadyAdded)
      groceries.push({
        recipe: recipe,
        ingredient: ingredient
      });
  };

  $scope.isInGroceryList = function(ingredient) {
    return _.find(groceries, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe == recipe
    });
  };
})

.controller('DashCtrl', function(api_endpoint, $ionicNavBarDelegate, $http, $scope, $state) {
  $scope.view = function(id) {
    $state.go('recipe.view', { id: id });
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

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('RecipeViewCtrl', function($state, $scope, recipe, $ionicNavBarDelegate) {
  $scope.goBack = function() { $state.go('tab.dash'); };
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
