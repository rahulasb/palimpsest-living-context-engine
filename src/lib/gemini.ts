import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { RawEvent, ContextCapsule } from '@/types';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;
let embeddingModel: GenerativeModel | null = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
}

export async function synthesizeContextCapsule(
    events: RawEvent[]
): Promise<Omit<ContextCapsule, 'id' | 'created_at' | 'vector_id'>> {
    // Sort events by time
    const sortedEvents = [...events].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const timeStart = sortedEvents[0]?.time || new Date().toISOString();
    const timeEnd = sortedEvents[sortedEvents.length - 1]?.time || new Date().toISOString();

    // Prioritize git commits for intent inference
    const gitEvents = events.filter((e) => e.source === 'git');
    const fileEvents = events.filter((e) => e.source === 'file');

    // Extract artifacts (file paths)
    const artifacts = [...new Set(
        fileEvents
            .map((e) => e.object)
            .filter((obj) => obj.includes('/') || obj.includes('.'))
    )];

    // Infer subsystem from file paths
    const subsystem = inferSubsystem(artifacts);

    // If AI not available, return basic capsule
    if (!model) {
        console.warn('Gemini not configured. Please set GOOGLE_AI_API_KEY');
        return {
            time_start: timeStart,
            time_end: timeEnd,
            title: 'Focus Session',
            goal: 'Working on project tasks',
            key_actions: events.slice(0, 3).map(e => `${e.source}: ${e.object}`),
            artifacts,
            subsystem,
        };
    }

    const eventSummary = events
        .map((e) => `[${e.source}] ${e.object}${e.inferred_intent ? ` - ${e.inferred_intent}` : ''}`)
        .join('\n');

    const prompt = `You are analyzing a developer's work session. Based on these events, identify the primary focus and synthesize a Context Capsule.

Events from this session:
${eventSummary}

${gitEvents.length > 0 ? `Git commits (prioritize for intent):\n${gitEvents.map(e => e.object).join('\n')}` : ''}

Output a JSON object with:
- "title": A concise title for this focus session (max 10 words)
- "goal": What the developer was trying to achieve (1-2 sentences)
- "keyActions": Array of 3 key actions/accomplishments from this session

Respond ONLY with valid JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Clean up potential markdown formatting
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        return {
            time_start: timeStart,
            time_end: timeEnd,
            title: parsed.title || 'Focus Session',
            goal: parsed.goal || 'Working on project tasks',
            key_actions: parsed.keyActions || ['Reviewed files', 'Made changes', 'Tested code'],
            artifacts,
            subsystem,
        };
    } catch (error) {
        console.error('Error synthesizing capsule:', error);
        // Fallback response
        return {
            time_start: timeStart,
            time_end: timeEnd,
            title: 'Focus Session',
            goal: 'Working on project tasks',
            key_actions: ['Reviewed files', 'Made changes'],
            artifacts,
            subsystem,
        };
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!embeddingModel) {
        console.warn('Gemini not configured. Please set GOOGLE_AI_API_KEY');
        return new Array(1536).fill(0);
    }

    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        // Return a zero vector as fallback (1536 dimensions for embedding-001)
        return new Array(1536).fill(0);
    }
}

function inferSubsystem(artifacts: string[]): string | undefined {
    if (artifacts.length === 0) return undefined;

    // Common subsystem patterns
    const patterns: Record<string, RegExp> = {
        'Frontend': /\/(components|pages|app|ui|views)\//i,
        'Backend API': /\/(api|routes|controllers|handlers)\//i,
        'Database': /\/(models|schema|migrations|db)\//i,
        'Auth': /\/(auth|login|session|security)\//i,
        'Tests': /\/(tests|__tests__|spec)\//i,
        'Config': /\/(config|settings|\.env)/i,
        'ML Pipeline': /\/(models|ml|ai|prediction)\//i,
    };

    for (const [subsystem, pattern] of Object.entries(patterns)) {
        if (artifacts.some((a) => pattern.test(a))) {
            return subsystem;
        }
    }

    return undefined;
}

export async function answerContextQuery(
    query: string,
    relevantCapsules: Array<{ capsule: ContextCapsule; score: number }>
): Promise<string> {
    if (!model) {
        return 'AI not configured. Please set GOOGLE_AI_API_KEY to enable context-aware answers.';
    }

    const capsuleSummaries = relevantCapsules
        .map(({ capsule, score }) =>
            `[Score: ${score.toFixed(2)}] ${capsule.title}\n` +
            `Time: ${capsule.time_start} to ${capsule.time_end}\n` +
            `Goal: ${capsule.goal}\n` +
            `Actions: ${capsule.key_actions.join(', ')}\n` +
            `Artifacts: ${capsule.artifacts.join(', ')}`
        )
        .join('\n\n');

    const prompt = `Based on these past work sessions, answer the user's question.

Past sessions:
${capsuleSummaries}

User question: ${query}

Provide a helpful, concise answer based on the context. If the information isn't available, say so.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Error answering query:', error);
        return 'Unable to process query at this time.';
    }
}
