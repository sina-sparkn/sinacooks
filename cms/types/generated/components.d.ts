import type { Schema, Struct } from '@strapi/strapi';

export interface RecipeIngredientLine extends Struct.ComponentSchema {
  collectionName: 'components_recipe_ingredient_lines';
  info: {
    description: 'An ingredient line with quantity and unit';
    displayName: 'IngredientLine';
  };
  attributes: {
    group: Schema.Attribute.String;
    ingredient: Schema.Attribute.Relation<
      'manyToOne',
      'api::ingredient.ingredient'
    >;
    note: Schema.Attribute.String;
    quantity: Schema.Attribute.Decimal;
    unit: Schema.Attribute.Enumeration<
      [
        'g',
        'kg',
        'ml',
        'l',
        'tsp',
        'tbsp',
        'cup',
        'oz',
        'lb',
        'piece',
        'pinch',
        'clove',
        'slice',
      ]
    >;
  };
}

export interface RecipeNutrition extends Struct.ComponentSchema {
  collectionName: 'components_recipe_nutritions';
  info: {
    description: 'Nutritional info per serving';
    displayName: 'Nutrition';
  };
  attributes: {
    calories: Schema.Attribute.Decimal;
    carbsGrams: Schema.Attribute.Decimal;
    fatGrams: Schema.Attribute.Decimal;
    fiberGrams: Schema.Attribute.Decimal;
    proteinGrams: Schema.Attribute.Decimal;
  };
}

export interface RecipeStep extends Struct.ComponentSchema {
  collectionName: 'components_recipe_steps';
  info: {
    description: 'A single recipe step';
    displayName: 'Step';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    instruction: Schema.Attribute.Text & Schema.Attribute.Required;
    timerMinutes: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'recipe.ingredient-line': RecipeIngredientLine;
      'recipe.nutrition': RecipeNutrition;
      'recipe.step': RecipeStep;
    }
  }
}
