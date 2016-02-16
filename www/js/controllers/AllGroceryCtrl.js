function AllGroceryCtrl($state, $http, $ionicHistory, api_endpoint, grocery, lists, $scope, Recipe) {
  $scope.groceryLists = lists;

  $scope.showMoreInfo = function() {
    console.log('successful swipe-right');
  };

  $scope.goBack = function() { $ionicHistory.goBack() };

  $scope.list_name = grocery.data().name;

  function refreshGroupedGroceryList() {
    grocery.list().then(function(full_list) {
      console.log('full_list', full_list);
      $scope.list = full_list;
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
  }

  $scope.$on('$ionicView.beforeEnter', function() {
    refreshGroupedGroceryList();
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

  $scope.removeFromGroceryList = function(ingredient, recipe_id) {
    $http.get(api_endpoint + '/recipe/' + recipe_id).then(function(response) {
      return new Recipe(response.data);
    }).then(function(recipe) {
      grocery.remove(ingredient, recipe);
      refreshGroupedGroceryList();
    });
  };

  $scope.showNew = function() {
    $scope.show_new = true;
  };

  $scope.showGroceryListSettings = function(name) {
    $state.go('tab.list-settings', { name: name });
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
}