#!/usr/bin/env node

import oclif from '@oclif/core';
import { handlePackageVersionUpdate } from './package-version-utils.js';

async function main() {
  try {
    await handlePackageVersionUpdate();
    oclif
      .run(process.argv.slice(2), import.meta.url)
      .then(oclif.flush)
      .catch(oclif.Errors.handle);
  } catch (err) {
    console.error(err);
  }
}

await main();
