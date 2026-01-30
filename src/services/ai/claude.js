/**
 * Anthropic Claude API Client
 *
 * Handles all communication with the Claude API.
 * Uses environment variable for API key.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

/**
 * Check if API key is available
 */
export const hasApiKey = () => {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY
}

/**
 * Get the API key from environment
 */
const getApiKey = () => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) {
    throw new Error('VITE_ANTHROPIC_API_KEY environment variable is not set')
  }
  return key
}

/**
 * Make a request to Claude API
 *
 * @param {Object} options
 * @param {string} options.systemPrompt - System prompt for Claude
 * @param {string} options.userMessage - User message/query
 * @param {number} options.maxTokens - Max tokens in response (default 1024)
 * @param {number} options.temperature - Temperature for response (default 0.3 for consistency)
 * @returns {Promise<string>} - Claude's response text
 */
export const callClaude = async ({
  systemPrompt,
  userMessage,
  maxTokens = 1024,
  temperature = 0.3
}) => {
  const apiKey = getApiKey()

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

/**
 * Make a request expecting JSON response
 * Parses the response and validates it's valid JSON
 *
 * @param {Object} options - Same as callClaude
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const callClaudeJSON = async (options) => {
  const response = await callClaude(options)

  // Try to extract JSON from the response
  // Claude sometimes wraps JSON in markdown code blocks
  let jsonStr = response

  // Remove markdown code blocks if present
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    return JSON.parse(jsonStr.trim())
  } catch (e) {
    console.error('Failed to parse Claude response as JSON:', response)
    throw new Error('AI response was not valid JSON')
  }
}

export default {
  hasApiKey,
  callClaude,
  callClaudeJSON,
}
