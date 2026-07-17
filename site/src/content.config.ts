import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        schema: z
          .object({
            type: z.string(),
            datePublished: z.string(),
            dateModified: z.string(),
            authors: z.array(z.string()),
          })
          .optional(),
      }),
    }),
  }),
};
