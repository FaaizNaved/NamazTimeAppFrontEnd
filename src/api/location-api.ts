import apiClient from './api-client';

interface ApiResponse<T> {
  model?: T;
  Model?: T;
  totalRows?: number;
  messages?: { messageType: number; value: string; fieldName: string }[];
}

function unwrapModel<T>(data: ApiResponse<T>): T {
  const model = data.model ?? data.Model;
  if (model === undefined) {
    throw new Error('API response missing model');
  }
  return model;
}

export const locationApi = {
  getCountries: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/locations/countries');
    return unwrapModel(response.data);
  },

  getStates: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/locations/states');
    return unwrapModel(response.data);
  },

  getCities: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/locations/cities');
    return unwrapModel(response.data);
  },

  resolveLocation: async (
    country: string,
    state: string,
    city: string
  ): Promise<{ code: string; name: string } | null> => {
    const response = await apiClient.get<
      ApiResponse<{ code?: string; Code?: string; name?: string; Name?: string }>
    >('/api/v1/locations/resolve', {
      params: { country, state, city },
    });
    const model = unwrapModel(response.data);
    if (!model) return null;
    const code = model.code ?? model.Code;
    const name = model.name ?? model.Name;
    if (!code) return null;
    return { code, name: name ?? city };
  },
};
