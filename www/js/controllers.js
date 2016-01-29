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
  var list = [];
  var name = null;
  var id = null;

  var self = {};

  function loadDefault() {
    getLatestsGroceryLists().then(function(lists) {
      var default_list = _.find(lists, function(list) {
        return list.name == 'My Grocery List';
      });

      if(!default_list) {
        $http.post(api_endpoint + '/save-grocery-list', {
          name: 'My Grocery List',
          list: list
        }).then(function(response) {
          getLatestsGroceryLists().then(function(lists) {
            var saved_list = _.find(lists, function(list) {
              return list.name == 'My Grocery List';
            });
            self.setList(saved_list.list, saved_list.name, saved_list._id);
          });
        });
      } else {
        self.setList(default_list.list, default_list.name, default_list.id);
      }
    });
  }

  function getLatestsGroceryLists() {
    return $http.post(api_endpoint + '/get-grocery-lists').then(function(response) {
      return response.data;
    });
  }

  function data() {
    return {
      name: name,
      list: list,
      id: id
    };
  };

  function setName(new_name) {
    name = new_name;
  };

  function setList(new_list, new_name, new_id) {
    name = new_name;
    list = new_list;
    id = new_id;
  };

  function get(ingredient, recipe) {
    return _.find(list, function(grocery) {
      return grocery.recipe_id == recipe.id && grocery.ingredient.text == ingredient.text;
    });
  }

  function add(ingredient, recipe) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.map(ingredient, function(this_ingredient) {
        add.call(this, this_ingredient, recipe);
      }.bind(this));

    var alreadyAdded = _.find(list, function(groceryItem) {
        return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
      });

    var grocery_item = {
      recipe_id: recipe.id,
      ingredient: ingredient,
      serving_ratio: recipe.serving_ratio,
      food_group: ingredient.food_group
    };

    if(!alreadyAdded)
      list.push(grocery_item);
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

    list = _.reject(list, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
    });
  }

  function isInList(ingredient, recipe) {
    if(typeof(ingredient) == typeof([]) && ingredient.length)
      return _.find(ingredient, function(this_ingredient) {
        return isInList.call(this, this_ingredient, recipe);
      }.bind(this));

    return _.find(list, function(groceryItem) {
      return groceryItem.ingredient.text == ingredient.text && groceryItem.recipe_id == recipe.id
    });
  }

  function consolidatedList() {
    //return resolved().then(function() {
      var groceries = _.chain(list).uniq(function(grocery) {
        return grocery.ingredient.text
      }).value();

      return _.map(groceries, function(grocery) {
        return {
          grocery_item: grocery,
          food_group: grocery.food_group,
          text: grocery.ingredient.text,
          amounts: _.chain(list).select(function(this_grocery) {
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
    return _.find(list, function(grocery) {
      return grocery.recipe_id == recipe_id;
    });
  }

  self.getLatestsGroceryLists = getLatestsGroceryLists.bind(this);
  self.loadDefault = loadDefault.bind(this);
  self.setList = setList.bind(this);
  self.setName = setName.bind(this);
  self.get = get.bind(this);
  self.add = add.bind(this);
  self.remove = remove.bind(this);
  self.isInList = isInList.bind(this);
  self.hasIngredientsFrom = hasIngredientsFrom.bind(this);
  self.list = consolidatedList.bind(this);
  self.data = data.bind(this);

  return self;
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
