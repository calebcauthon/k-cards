angular.module('k-cards-models', [])

.factory('Recipe', function() {
  var ui = {};

  function getIngredients() {
    return _.chain(this.steps)
      .map(function(step) {
        var ingredient_words = step.ingredients;

        return {
          text: ingredient_words.join(' '),
          amount: Number(step.amounts[0]),
          measurement: step.measurements[0]
        };
      })
      .select(function(data) {
        return data.text.length;
      }).uniq().value();
  }

  return function(recipe_data) {
    this.data = recipe_data;

    ui.serving_size = recipe_data.serving_size;
    ui.steps = recipe_data.steps;
    ui.name = recipe_data.name;
    ui.id = recipe_data._id;

    ui.getIngredients = getIngredients.bind(ui);

    return ui;
  }.bind(this);
})