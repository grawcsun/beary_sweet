/**
 * AI Agent Service - Second Brain Analysis
 * Analyzes journal entries and provides personalized insights
 */

export const generateDayRecap = async (dateStr, entries) => {
  const dayEntries = entries.filter(e => e.date === dateStr);

  if (dayEntries.length === 0) {
    return null;
  }

  // Build comprehensive context from all entry data
  const entryDetails = dayEntries.map(e => {
    let detail = `Entry at ${e.time}:\n`;
    detail += `Mood: ${e.mood}\n`;
    detail += `Text: ${e.content}\n`;
    if (e.photo) detail += `[Photo attached]\n`;
    if (e.audio) detail += `[Voice note attached]\n`;
    return detail;
  }).join('\n---\n');

  // Get historical context for personalization
  const allHistoricalEntries = entries.filter(e => e.date !== dateStr);
  const recentHistory = allHistoricalEntries.slice(0, 20).map(e => e.content).join(' | ');

  try {
    // Call our secure serverless API endpoint instead of calling Anthropic directly
    // This keeps the API key secret on the server
    const response = await fetch('/api/generate-recap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are Cherry, an AI companion who acts as a second brain, analyzing journal entries to provide deep insights and personalized guidance.

Today's Date: ${dateStr}

TODAY'S ENTRIES:
${entryDetails}

RECENT HISTORY (for context):
${recentHistory}

Based on today's entries, provide a comprehensive analysis with these sections:

DAY SUMMARY
What happened today? Include emotions, activities, people, and places mentioned.

KEY LEARNINGS
What insights or lessons emerged from today? What did they discover about themselves?

PATTERNS & OBSERVATIONS
Notice any recurring themes, behaviors, or emotions. Compare to recent history.

WELLNESS RECOMMENDATIONS
Based on their mood and activities:
- Physical: Exercise, movement, or rest recommendations
- Mental: Activities for mental health and stress management
- Social: Connection and relationship suggestions

PERSONALIZED SUGGESTIONS
Based on their interests and goals:
- New activities or projects to explore
- Skills to develop
- Creative pursuits aligned with their passions

ACTION STEPS
3-5 specific, actionable recommendations for tomorrow or the week ahead to help them grow and achieve their goals.

Keep your tone warm, encouraging, and specific to their unique situation. Be like a wise, caring friend who truly knows them.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const recapText = data.content[0].text;

    return {
      success: true,
      recap: recapText
    };
  } catch (error) {
    console.error('Error generating recap:', error);
    return {
      success: false,
      recap: `DAY SUMMARY
What a ${dayEntries[0]?.mood || 'thoughtful'} day! You collected ${dayEntries.length} honey drop${dayEntries.length !== 1 ? 's' : ''}.

YOUR ENTRIES
${dayEntries.map((e, i) => `${i + 1}. (${e.mood}) ${e.content.substring(0, 150)}${e.content.length > 150 ? '...' : ''}`).join('\n\n')}

❌ AI ANALYSIS ERROR: ${error.message}

Check the browser console for more details. Make sure your API key is valid and you have internet connection.

In the meantime, reflect on what these entries tell you about your day!`
    };
  }
};
