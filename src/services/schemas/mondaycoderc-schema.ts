import { z } from 'zod';

export const mondaycodercSchema = z
  .object({
    RUNTIME: z.enum(['Python', 'Java', 'Go', 'PHP', 'Ruby', 'Nodejs', 'NETCore']).optional(),
    RUNTIME_VERSION: z.string().optional(),
  })
  .refine(
    data => {
      if (data.RUNTIME) {
        if (data.RUNTIME === 'Python') {
          return /^3\.(10|11|12)\.\d+$/.test(data.RUNTIME_VERSION || '');
        }

        if (data.RUNTIME === 'Java') {
          return ['11', '17', '18'].includes(data.RUNTIME_VERSION || '');
        }

        if (data.RUNTIME === 'Go') {
          return /^1\.\d+\.\d+$/.test(data.RUNTIME_VERSION || '');
        }

        if (data.RUNTIME === 'PHP') {
          return /^8\.(1|2)\.\d+$/.test(data.RUNTIME_VERSION || '');
        }

        if (data.RUNTIME === 'Ruby') {
          return /^3\.(1|2)\.\d+$/.test(data.RUNTIME_VERSION || '');
        }

        if (data.RUNTIME === 'Nodejs') {
          return /^(12|14|16|18|20)\.\d+\.\d+$/.test(data.RUNTIME_VERSION || '');
        }

        if (data.RUNTIME === 'NETCore') {
          return /^(6|7)\.\d+$/.test(data.RUNTIME_VERSION || '');
        }
      }

      return true;
    },
    {
      message: 'Invalid RUNTIME_VERSION for the specified RUNTIME',
    },
  );
