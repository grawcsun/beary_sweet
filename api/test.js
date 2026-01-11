/**
 * Simple test endpoint to verify API is working
 */
export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  return res.status(200).json({
    message: 'API is working',
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    apiKeyPrefix: apiKey?.substring(0, 20) + '...',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC'))
  });
}
