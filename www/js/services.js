angular.module('starter.services', [])

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
        self.setList(default_list.list, default_list.name, default_list._id);
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
