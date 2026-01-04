/**
 * Centralized Configuration Module
 * All environment variables should be accessed through here.
 */

// Fallback values for local development if .env is missing
const DEFAULT_DASH_URL = 'http://127.0.0.1:8050';
const DEFAULT_GRAPHQL_ENDPOINT = 'http://localhost:4001';

export const config = {
  // Dash Application URL (Visualization)
  DASH_URL: import.meta.env.VITE_DASH_URL || DEFAULT_DASH_URL,

  // Asset Service GraphQL Endpoint
  GRAPHQL_ENDPOINT:
    import.meta.env.VITE_GRAPHQL_ENDPOINT || DEFAULT_GRAPHQL_ENDPOINT,
};
