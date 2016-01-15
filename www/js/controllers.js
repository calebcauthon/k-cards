angular.module('starter.controllers', ['recipeApp.config'])

.controller('AllGroceryCtrl', function(grocery, $scope) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.list = grocery.list();
  });
})

.service('grocery', function() {
  this.list = [];

  function add(ingredient, recipe) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.map(ingredient, function(this_ingredient) {
        add.call(this, this_ingredient, recipe);
      }.bind(this));

    var alreadyAdded = _.find(this.list, function(groceryItem) {
        return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
      });

    if(!alreadyAdded)
      this.list.push({
        recipe_id: recipe.id,
        ingredient: ingredient
      });
  }

  function remove(ingredient, recipe) {
    this.list = _.reject(this.list, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
    });
  }

  function isInList(ingredient, recipe) {
    return _.find(this.list, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
    });
  }

  function consolidatedList() {
    var texts = _.chain(this.list).map(function(grocery) {
      return grocery.ingredient.text
    }).uniq().value();

    return _.map(texts, function(name) {
      return {
        text: name,
        amounts: _.chain(this.list).select(function(grocery) {
            return grocery.ingredient.text == name;
          }).map(function(grocery) {
            if(grocery.ingredient.measurement)
              return grocery.ingredient.amount + ' ' + grocery.ingredient.measurement;
            else
              return grocery.ingredient.amount;
          }).value()
      };
    }.bind(this));
  }

  function hasIngredientsFrom(recipe_id) {
    return _.find(this.list, function(grocery) {
      return grocery.recipe_id == recipe_id;
    });
  }

  return {
    add: add.bind(this),
    remove: remove.bind(this),
    isInList: isInList.bind(this),
    hasIngredientsFrom: hasIngredientsFrom.bind(this),
    list: consolidatedList.bind(this)
  };
})

.controller('GroceryCtrl', function($scope, recipe, grocery) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.groceries = [];
    $scope.recipe = recipe;

    $scope.ingredients = recipe.getIngredients();
  });

  $scope.toggleGroceryList = function(ingredient) {
    if($scope.isInGroceryList(ingredient))
      $scope.removeFromGroceryList(ingredient)
    else
      $scope.addToGroceryList(ingredient);
  };

  $scope.removeFromGroceryList = function(ingredient) {
    return grocery.remove(ingredient, recipe);
  };
  $scope.addToGroceryList = function(ingredient) {
    return grocery.add(ingredient, recipe);
  };
  $scope.isInGroceryList = function(ingredient) {
    return grocery.isInList(ingredient, recipe);
  };
})

.controller('DashCtrl', function(grocery, api_endpoint, $ionicNavBarDelegate, $http, $scope, $state) {
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
