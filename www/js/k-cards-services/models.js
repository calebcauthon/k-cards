angular.module('k-cards-models', [])

.factory('Recipe', function() {
  function getIngredients() {
    return _.chain(this.steps)
      .map(function(step) {
        var ingredient_words = step.ingredients;

        var amount = Number(step.amounts[0]);
        if(isNaN(amount))
          amount = 1;
        return {
          text: ingredient_words.join(' '),
          amount: amount,
          measurement: step.measurements[0],
          food_group: step.ingredient_category
        };
      })
      .select(function(data) {
        return data.text.length;
      }).uniq().value();
  }

  return function(recipe_data) {
    var ui = {};

    this.data = recipe_data;

    ui.serving_ratio = 1;
    ui.serving_size = recipe_data.serving_size;
    ui.steps = recipe_data.steps;
    ui.name = recipe_data.name;
    ui.id = recipe_data._id;

    ui.getIngredients = getIngredients.bind(ui);

    return ui;
  }.bind(this);
})