angular.module('starter.controllers', ['recipeApp.config', 'k-cards-services'])

.controller('AskHowMuchCtrl', function($scope, $state, $ionicHistory, recipe) {
  $scope.recipe = recipe;

  $scope.cancel = function() {
    $ionicHistory.goBack();
  };

  $scope.saveServingSize = function() {
    recipe.serving_ratio = $scope.multiplier;
    $ionicHistory.goBack();
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

.controller('AllGroceryCtrl', function($state, $http, api_endpoint, grocery, lists, $scope) {
  $scope.groceryLists = lists;

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.list = grocery.list();
    $scope.list_name = grocery.data().name;

    $scope.list_food_groups = _.chain($scope.list)
      .pluck('food_group')
      .uniq()
      .select(function(text) {
        return text && text.length;
      })
      .value();

    $scope.show_new = false;
  });

  $scope.use = function(groceryListData) {
    grocery.setList(groceryListData.list, groceryListData.name, groceryListData._id);
    $scope.list_name = grocery.data().name;

    $scope.list = grocery.list();
    $scope.list_food_groups = _.chain($scope.list)
      .pluck('food_group')
      .uniq()
      .select(function(text) {
        return text && text.length;
      })
      .value();
  };

  $scope.showNew = function() {
    $scope.show_new = true;
  };

  $scope.showGroceryListSettings = function(list) {
    $state.go('recipe.list-settings', { name: list.name });
  };

  $scope.createNewGroceryList = function(name) {
    $scope.show_new = false;
    $http.post(api_endpoint + '/save-grocery-list', {
      name: name,
      list: []
    }).then(function(response) {
      grocery.getLatestsGroceryLists().then(function(lists) {
        $scope.groceryLists = lists
      });
    });
  };

  $scope.save = function() {
    $http.post(api_endpoint + '/update-grocery-list', grocery.data());
  };
})

.controller('ListSettingsCtrl', function($ionicHistory, $scope, $http, api_endpoint, groceryList) {
  $scope.list = groceryList;

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  $scope.save = function() {
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

.service('grocery', function(usdaNutrition, $q, $http, api_endpoint) {
  this.list = [];

  function getLatestsGroceryLists() {
    return $http.post(api_endpoint + '/get-grocery-lists').then(function(response) {
      return response.data;
    });
  }

  function data() {
    return {
      name: this.name,
      list: this.list,
      id: this.id
    };
  };

  function setList(list, name, id) {
    this.name = name;
    this.list = list;
    this.id = id;
  };

  function get(ingredient, recipe) {
    return _.find(this.list, function(grocery) {
      return grocery.recipe_id == recipe.id && grocery.ingredient.text == ingredient.text;
    });
  }

  function add(ingredient, recipe) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.map(ingredient, function(this_ingredient) {
        add.call(this, this_ingredient, recipe);
      }.bind(this));

    var alreadyAdded = _.find(this.list, function(groceryItem) {
        return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
      });

    var grocery_item = {
      recipe_id: recipe.id,
      ingredient: ingredient,
      serving_ratio: recipe.serving_ratio,
      food_group: ingredient.food_group
    };

    if(!alreadyAdded)
      this.list.push(grocery_item);
  }

  var promises = [];

  function resolved() {
    return $q.all(promises);
  }

  function remove(ingredient, recipe) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.map(ingredient, function(this_ingredient) {
        remove.call(this, this_ingredient, recipe);
      }.bind(this));

    this.list = _.reject(this.list, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
    });
  }

  function isInList(ingredient, recipe) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.find(ingredient, function(this_ingredient) {
        return isInList.call(this, this_ingredient, recipe);
      }.bind(this));

    return _.find(this.list, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
    });
  }

  function consolidatedList() {
    //return resolved().then(function() {
      var groceries = _.chain(this.list).uniq(function(grocery) {
        return grocery.ingredient.text
      }).value();

      return _.map(groceries, function(grocery) {
        return {
          grocery_item: grocery,
          food_group: grocery.food_group,
          text: grocery.ingredient.text,
          amounts: _.chain(this.list).select(function(this_grocery) {
              return this_grocery.ingredient.text == grocery.ingredient.text;
            }).map(function(this_grocery) {
              if(this_grocery.ingredient.measurement)
                return this_grocery.ingredient.amount * this_grocery.serving_ratio + ' ' + this_grocery.ingredient.measurement;
              else
                return this_grocery.ingredient.amount * this_grocery.serving_ratio;
            }).value()
        };
      }.bind(this));
    //});
  }

  function hasIngredientsFrom(recipe_id) {
    return _.find(this.list, function(grocery) {
      return grocery.recipe_id == recipe_id;
    });
  }

  return {
    getLatestsGroceryLists: getLatestsGroceryLists.bind(this),
    setList: setList.bind(this),
    get: get.bind(this),
    add: add.bind(this),
    remove: remove.bind(this),
    isInList: isInList.bind(this),
    hasIngredientsFrom: hasIngredientsFrom.bind(this),
    list: consolidatedList.bind(this),
    data: data.bind(this)
  };
})

.controller('GroceryCtrl', function($http, api_endpoint, $scope, $state, recipe, grocery) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.groceries = [];
    $scope.recipe = recipe;

    $scope.ingredients = recipe.getIngredients();
  });

  function save() {
    $http.post(api_endpoint + '/update-grocery-list', grocery.data());
  };

  $scope.askHowMuch = function(ingredients) {
    $state.go('recipe.ask-ingredients');
  };

  $scope.groceryItem = function(ingredient) {
    return grocery.get(ingredient, recipe);
  };

  $scope.toggleGroceryList = function(ingredient) {
    if($scope.isInGroceryList(ingredient))
      $scope.removeFromGroceryList(ingredient)
    else
      $scope.addToGroceryList(ingredient);

    save();
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
