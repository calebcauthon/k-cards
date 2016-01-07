angular.module('starter.controllers', [])

.controller('DashCtrl', function($http, $scope, $state) {
  $scope.view = function(id) {
    $state.go('recipe.view', { id: id });
  };

  var recipe_gist_ids = [
    'Shakshuka with Spinach',
    'Bean and Cheese Tacos',
    'Crispy Eggplant Wraps with Yogurt Sauce',
    'Kale, Barley and Chickpea Salad',
    'Cauliflower Rice Lettuce Cups'
  ];

  $scope.recipes = [];
  recipe_gist_ids.forEach(function(id) {
    $http.get('templates/recipes/' + id + '.txt').then(function(response) {
      var content;
        
      _.each(response.data, function(file_content) {
        content = file_content;
      });

      $scope.recipes.push({
        id: id,
        recipe_name: id,
        recipe_text: content
      });

    });
  });

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

.controller('RecipeViewCtrl', function($state, $scope, $http, recipe, $ionicNavBarDelegate) {         
  $scope.$on('$ionicView.enter', function() {
    $ionicNavBarDelegate.forceShowBackButton(function() {
      $state.go('tab.dash');
      $ionicNavBarDelegate.unForceShowBackButton();
    });

    $scope.name = recipe.name;
    $scope.steps = recipe.steps;
  });
});
