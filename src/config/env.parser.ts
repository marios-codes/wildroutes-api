import { z } from 'zod';

const runtimeConfigSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine(
      (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection URL',
    ),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

// eslint-disable-next-line no-undef -- NodeJS is a type namespace provided by @types/node.
export const parseRuntimeConfig = (environment: NodeJS.ProcessEnv) => {
  const result = runtimeConfigSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return {
    databaseUrl: result.data.DATABASE_URL,
    jwtSecret: result.data.JWT_SECRET,
    port: result.data.PORT,
  };
};
