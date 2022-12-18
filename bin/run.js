#!/usr/bin/env node

import oclif from '@oclif/core';

// Disable debug level logs in production
if (process.env.MCODE_DEBUG !== 'true') console.debug = () => {};

oclif
  .run(process.argv.slice(2), import.meta.url)
  .then(oclif.flush)
  .catch(oclif.Errors.handle);
