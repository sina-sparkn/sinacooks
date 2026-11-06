import type { Core } from '@strapi/strapi';
import fs from 'node:fs';
import path from 'node:path';
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
   * Also ensures a read-only API token 'backend' is created and synced to backend/.env.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.SEED_ON_BOOT === 'true') {
      try {
        await runSeed(strapi);
      } catch (err) {
        strapi.log.error('Failed to run CMS seed:', err);
      }
    }

    // Ensure read-only API token 'backend' exists for the NestJS API
    try {
      const apiTokenService = strapi.service('admin::api-token') as any;
      const encryptionService = strapi.service('admin::encryption') as any;

      if (apiTokenService) {
        let accessKey: string | null = null;
        const existingToken = await strapi.db.query('admin::api-token').findOne({
          where: { name: 'backend' },
        });

        if (!existingToken) {
          const created = await apiTokenService.create({
            name: 'backend',
            description: 'Read-only API token for NestJS backend',
            type: 'read-only',
            lifespan: null,
          });
          accessKey = created.accessKey;
          strapi.log.info("[Strapi] Created read-only API token 'backend'");
        } else if (existingToken.encryptedKey && encryptionService) {
          accessKey = encryptionService.decrypt(existingToken.encryptedKey);
        }

        if (accessKey) {
          const backendEnvPath = path.resolve(process.cwd(), '../backend/.env');
          if (fs.existsSync(backendEnvPath)) {
            let envContent = fs.readFileSync(backendEnvPath, 'utf8');
            if (
              envContent.includes('STRAPI_API_TOKEN=mock_strapi_token_for_dev') ||
              envContent.includes('STRAPI_API_TOKEN=\n') ||
              !envContent.includes(accessKey)
            ) {
              envContent = envContent.replace(
                /^STRAPI_API_TOKEN=.*$/m,
                `STRAPI_API_TOKEN=${accessKey}`
              );
              fs.writeFileSync(backendEnvPath, envContent, 'utf8');
              strapi.log.info('[Strapi] Synced STRAPI_API_TOKEN into backend/.env');
            }
          }
        }
      }
    } catch (tokenErr) {
      strapi.log.warn('Could not auto-configure backend API token:', tokenErr);
    }
  },
};
