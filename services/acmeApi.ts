import { ACME_API_BASE } from '../constants';

export const acmeApi = {
  async getTable(): Promise<any> {
    const response = await fetch(`${ACME_API_BASE}/table`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error('Failed to fetch docs table');
    return response.json(); // Returns the array directly
  },

  async getOutline(id: string): Promise<any> {
    const response = await fetch(`${ACME_API_BASE}/outline`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"fileIds": [id]}),
    });

    if (!response.ok) throw new Error(`Failed to fetch outline for doc ${id}`);
    const data = await response.json(); // MUST await here
    return data[id]; // Extract the specific file's content
  },

  async getFull(id: string): Promise<any> {
    const response = await fetch(`${ACME_API_BASE}/full`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({"fileIds": [id]}),
    });
    if (!response.ok) throw new Error(`Failed to fetch full content for doc ${id}`);
    const data = await response.json(); // MUST await here
    return data[id]; // Extract the specific file's content
  }
};