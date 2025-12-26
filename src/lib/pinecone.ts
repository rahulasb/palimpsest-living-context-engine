import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY || '';
const indexName = process.env.PINECONE_INDEX || 'lce-context';

let pineconeClient: Pinecone | null = null;

if (apiKey) {
    pineconeClient = new Pinecone({ apiKey });
}

export async function getIndex() {
    if (!pineconeClient) {
        console.warn('Pinecone not configured. Please set PINECONE_API_KEY');
        return null;
    }
    return pineconeClient.index(indexName);
}

export async function upsertVector(
    id: string,
    embedding: number[],
    metadata: Record<string, string | number | boolean | string[]>
) {
    const index = await getIndex();
    if (!index) {
        console.warn('Pinecone index not available');
        return;
    }
    await index.upsert([
        {
            id,
            values: embedding,
            metadata,
        },
    ]);
}

export async function queryVectors(
    embedding: number[],
    topK: number = 5,
    filter?: Record<string, unknown>
) {
    const index = await getIndex();
    if (!index) {
        console.warn('Pinecone index not available');
        return [];
    }
    const results = await index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
        filter,
    });
    return results.matches || [];
}

export async function deleteVector(id: string) {
    const index = await getIndex();
    if (!index) {
        console.warn('Pinecone index not available');
        return;
    }
    await index.deleteOne(id);
}
