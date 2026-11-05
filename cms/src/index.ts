import type { Core } from '@strapi/strapi';
import { runSeed } from './seed.js';

export default {
  /**
   * Strapi 5 register hook
   * We register a document-service middleware to compute `totalTimeMinutes = prepTimeMinutes + cookTimeMinutes`
   * on recipe creation and update, ensuring recipes can always be filtered accurately by total duration.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      if (context.uid === 'api::recipe.recipe' && (context.action === 'create' || context.action === 'update')) {
        const data = (context.params as any)?.data;
        if (data) {
          const prep = typeof data.prepTimeMinutes === 'number' ? data.prepTimeMinutes : 0;
          const cook = typeof data.cookTimeMinutes === 'number' ? data.cookTimeMinutes : 0;
          data.totalTimeMinutes = prep + cook;
        }
      }
      return next();
    });
  },

  /**
   * Strapi 5 bootstrap hook
   * Runs the idempotent seed script when SEED_ON_BOOT=true.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.SEED_ON_BOOT === 'true') {
      try {
        await runSeed(strapi);
      } catch (err) {
        strapi.log.error('Failed to run CMS seed:', err);
      }
    }
  },
};
