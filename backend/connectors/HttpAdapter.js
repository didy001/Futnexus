import logger from '../core/logger.js';

export class HttpAdapter {
  async send(config) {
    // Config expects: { url, method, headers, body }
    const { url, method = 'GET', headers = {}, body } = config;

    if (!url) throw new Error("URL is required for HTTP Adapter");

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nexus-Omega-Core/1.0',
        ...headers
      }
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const startTime = Date.now();
    try {
      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;
      
      logger.info(`[HTTP ADAPTER] ${method} ${url} - ${response.status} (${duration}ms)`);

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(data)}`);
      }

      return data;

    } catch (error) {
      logger.error(`[HTTP ADAPTER] Request failed: ${error.message}`);
      throw error;
    }
  }
}