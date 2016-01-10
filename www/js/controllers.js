angular.module('starter.controllers', [])

.controller('DashCtrl', function($ionicNavBarDelegate, $http, $scope, $state) {
  $scope.view = function(id) {
    $state.go('recipe.view', { id: id });
  };

  $http.post('/api/recipes').then(function(response) {
    console.log(response.data);
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

.controller('RecipeViewCtrl', function($state, $scope, $http, recipe, $ionicNavBarDelegate) {         
  $scope.goBack = function() { $state.go('tab.dash'); };
  $scope.recipe = recipe;
});
