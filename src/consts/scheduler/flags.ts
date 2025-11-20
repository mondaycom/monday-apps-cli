import { Flags } from '@oclif/core';

import { SchedulerMessages } from 'src/consts/scheduler/messages';
import { addRegionToFlags } from 'src/utils/region';

export const SchedulerBaseFlags = addRegionToFlags({
  appId: Flags.integer({
    char: 'a',
    description: SchedulerMessages.appId,
  }),
  name: Flags.string({
    char: 'n',
    description: SchedulerMessages.name,
  }),
});

export const SchedulerFlags = addRegionToFlags({
  ...SchedulerBaseFlags,
  description: Flags.string({
    char: 'd',
    description: SchedulerMessages.description,
  }),
  schedule: Flags.string({
    char: 's',
    description: SchedulerMessages.schedule,
  }),
  targetUrl: Flags.string({
    char: 'e',
    description: SchedulerMessages.targetUrl,
  }),
  maxRetries: Flags.integer({
    char: 'r',
    description: SchedulerMessages.maxRetries,
  }),
  minBackoffDuration: Flags.integer({
    char: 'b',
    description: SchedulerMessages.minBackoffDuration,
  }),
  timeout: Flags.integer({
    char: 't',
    description: SchedulerMessages.timeout,
  }),
});
