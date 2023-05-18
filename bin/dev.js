#!/usr/bin/env tsx

/* eslint-disable node/shebang */
import { config } from 'dotenv';
import oclif from '@oclif/core';

config();

process.env.NODE_ENV = 'development';

// In dev mode, always show stack traces
oclif.settings.debug = true;

// Start the CLI
oclif
  .run(process.argv.slice(2), import.meta.url)
  .then(oclif.flush)
  .catch(oclif.Errors.handle);
