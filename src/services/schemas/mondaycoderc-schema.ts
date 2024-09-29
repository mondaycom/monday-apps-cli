import { z } from 'zod';

export const mondaycodercSchema = z
  .object({
    RUNTIME: z
      .enum(['Python', 'Java', 'Go', 'PHP', 'Ruby', 'Node.js', 'NETCore'], {
        errorMap: () => ({
          message:
            'Invalid Runtime in .mondaycoderc. Supported runtimes are Python, Java, Go, PHP, Ruby, Node.js, NETCore',
        }),
      })
      .optional(),
    RUNTIME_VERSION: z.string().optional(),
  })
  .strict()
  .refine(data => {
    if (data.RUNTIME_VERSION) {
      if (data.RUNTIME === 'Python') {
        if (!/^3\.(10|11|12)\.\d+$/.test(data.RUNTIME_VERSION || '')) {
          throw new Error(
            'Invalid RUNTIME_VERSION for Python in .mondaycoderc. Allowed versions are 3.10.x, 3.11.x, 3.12.x',
          );
        }

        return true;
      }

      if (data.RUNTIME === 'Java') {
        if (!['11', '17', '18'].includes(data.RUNTIME_VERSION || '')) {
          throw new Error('Invalid RUNTIME_VERSION for Java in .mondaycoderc. Allowed versions are 11, 17, 18');
        }

        return true;
      }

      if (data.RUNTIME === 'Go') {
        if (!/^1\.\d+\.\d+$/.test(data.RUNTIME_VERSION || '')) {
          throw new Error('Invalid RUNTIME_VERSION for Go in .mondaycoderc. Allowed versions are 1.x.x');
        }

        return true;
      }

      if (data.RUNTIME === 'PHP') {
        if (!/^8\.(1|2)\.\d+$/.test(data.RUNTIME_VERSION || '')) {
          throw new Error('Invalid RUNTIME_VERSION for PHP in .mondaycoderc. Allowed versions are 8.1.x, 8.2.x');
        }

        return true;
      }

      if (data.RUNTIME === 'Ruby') {
        if (!/^3\.(1|2)\.\d+$/.test(data.RUNTIME_VERSION || '')) {
          throw new Error('Invalid RUNTIME_VERSION for Ruby in .mondaycoderc. Allowed versions are 3.1.x, 3.2.x');
        }

        return true;
      }

      if (data.RUNTIME === 'Node.js') {
        if (!/^(12|14|16|18|20)\.\d+\.\d+$/.test(data.RUNTIME_VERSION || '')) {
          throw new Error(
            'Invalid RUNTIME_VERSION for Node.js  in .mondaycoderc. Allowed versions are 12.x.x, 14.x.x, 16.x.x, 18.x.x, 20.x.x',
          );
        }

        return true;
      }

      if (data.RUNTIME === 'NETCore') {
        if (!/^(6|7)\.\d+$/.test(data.RUNTIME_VERSION || '')) {
          throw new Error('Invalid RUNTIME_VERSION for NETCore in .mondaycoderc. Allowed versions are 6.x, 7.x');
        }

        return true;
      }
    }

    return true;
  });
