
import { ACME_API_BASE } from '../constants';
import { AcmeDoc } from '../types';

export const acmeApi = {
  async getTable(): Promise<AcmeDoc[]> {
    const response = await fetch(`${ACME_API_BASE}/docs`);
    if (!response.ok) throw new Error('Failed to fetch docs table');
    return response.json();
  },

  async getOutline(id: string): Promise<AcmeDoc> {
    const response = await fetch(`${ACME_API_BASE}/docs/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch outline for doc ${id}`);
    return response.json();
  },

  async getFull(id: string): Promise<AcmeDoc> {
    const response = await fetch(`${ACME_API_BASE}/docs/${id}/full`);
    if (!response.ok) throw new Error(`Failed to fetch full content for doc ${id}`);
    return response.json();
  }
};
