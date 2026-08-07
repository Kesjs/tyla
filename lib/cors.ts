/**
 * Configuration CORS pour sécuriser les requêtes cross-origin
 */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://tyla-jaffirme.vercel.app' // Remplacer par votre domaine production
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 heures
};

/**
 * Applique les headers CORS à une réponse
 */
export function applyCORS(response: Response): Response {
  const newResponse = new Response(response.body, response);
  
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}

/**
 * Middleware pour gérer les requêtes OPTIONS preflight
 */
export function handleCORSOptions(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  return null;
}