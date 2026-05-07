import crypto from 'node:crypto';
import https from 'node:https';

import axios from 'axios';

import { platformBuildingBlocksSchemasUrl } from 'consts/urls';
import logger from 'utils/logger';
import { appsUrlBuilder } from 'utils/urls-builder';

type PbbSchemaEntry = {
  name?: string;
  status?: string;
};

const TWO_HOURS_IN_MS = 1000 * 60 * 60 * 2;
const FETCH_TIMEOUT_IN_MS = 5000;

class PbbSchemaManager {
  private activeTypeNames: string[] = [];
  private lastFetchedAt?: number;
  private fetchPromise?: Promise<void>;

  public async initialize(): Promise<void> {
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    if (this.isInitialized()) {
      return;
    }

    this.fetchPromise = this.fetchSchemas();
    try {
      await this.fetchPromise;
    } finally {
      this.fetchPromise = undefined;
    }
  }

  public getActiveTypeNames(): string[] {
    return [...this.activeTypeNames];
  }

  public isInitialized(): boolean {
    return (
      this.activeTypeNames.length > 0 &&
      this.lastFetchedAt !== undefined &&
      this.lastFetchedAt + TWO_HOURS_IN_MS > Date.now()
    );
  }

  private async fetchSchemas(): Promise<void> {
    try {
      const url = appsUrlBuilder(platformBuildingBlocksSchemasUrl());
      const httpsAgent = new https.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        rejectUnauthorized: false,
      });

      const response = await axios.get<PbbSchemaEntry[]>(url, {
        timeout: FETCH_TIMEOUT_IN_MS,
        headers: { Accept: 'application/json' },
        httpsAgent,
      });

      const schemas = Array.isArray(response.data) ? response.data : [];
      this.activeTypeNames = schemas
        .filter(schema => schema.status === 'ACTIVE' && typeof schema.name === 'string' && schema.name.length > 0)
        .map(schema => schema.name as string);
      this.lastFetchedAt = Date.now();
    } catch (error) {
      logger.debug(error, 'pbb-schema-manager');
    }
  }
}

export const pbbSchemaManager = new PbbSchemaManager();
