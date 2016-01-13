angular.module('starter.controllers', ['recipeApp.config'])

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
    text = text.replace('{{verb}}', '');
    text = text.replace('{{amount}}', step.amounts[0] * recipe.serving_size);
    return text;
  };
});
