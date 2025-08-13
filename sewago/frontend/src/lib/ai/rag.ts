// Simple RAG system for FAQ and policy retrieval
// In production, this would use proper embeddings and vector search

export interface DocumentChunk {
  title: string;
  section: string;
  text: string;
  relevance: number;
}

// Mock FAQ and policy data - in production, this would come from a vector database
const FAQ_DATA: DocumentChunk[] = [
  {
    title: 'Cancellation Policy',
    section: '§2',
    text: 'Free cancellation up to 12 hours before start; 50% fee inside 12 hours. No refunds for same-day cancellations.',
    relevance: 0
  },
  {
    title: 'Payment Methods',
    section: '§1',
    text: 'We accept Cash on Delivery (COD) and eSewa payments. COD is available for all services up to Rs. 5,000.',
    relevance: 0
  },
  {
    title: 'Service Warranty',
    section: '§3',
    text: 'Electrical and plumbing services come with 30-day warranty. Cleaning and gardening services have no warranty.',
    relevance: 0
  },
  {
    title: 'Provider Ratings',
    section: '§4',
    text: 'All providers are verified and rated. Minimum rating requirement is 4.0 stars. Poor performers are removed.',
    relevance: 0
  },
  {
    title: 'Emergency Services',
    section: '§5',
    text: 'Emergency electrical and plumbing available 24/7 with 2x pricing. Response time: 1-2 hours in Kathmandu Valley.',
    relevance: 0
  },
  {
    title: 'Service Areas',
    section: '§6',
    text: 'Currently serving Kathmandu, Lalitpur, Bhaktapur, and Kirtipur. Expansion to other cities planned for Q2 2024.',
    relevance: 0
  }
];

// Simple keyword-based retrieval (in production, use proper embeddings)
export async function retrieve(query: string, k: number = 3): Promise<DocumentChunk[]> {
  const lowerQuery = query.toLowerCase();
  
  // Calculate relevance scores based on keyword matches
  const scoredChunks = FAQ_DATA.map(chunk => {
    const chunkText = chunk.text.toLowerCase();
    const titleText = chunk.title.toLowerCase();
    
    let score = 0;
    
    // Exact phrase matches get higher scores
    if (chunkText.includes(lowerQuery)) {
      score += 10;
    }
    
    // Word matches
    const queryWords = lowerQuery.split(/\s+/);
    queryWords.forEach(word => {
      if (chunkText.includes(word)) score += 2;
      if (titleText.includes(word)) score += 3;
    });
    
    return { ...chunk, relevance: score };
  });
  
  // Sort by relevance and return top k
  return scoredChunks
    .filter(chunk => chunk.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, k);
}

// Get specific policy by topic
export async function getPolicy(topic: string): Promise<DocumentChunk[]> {
  const normalizedTopic = topic.toLowerCase();
  
  // Map common topics to specific policies
  const topicMappings: Record<string, string[]> = {
    'cancellation': ['Cancellation Policy'],
    'cancel': ['Cancellation Policy'],
    'refund': ['Cancellation Policy'],
    'payment': ['Payment Methods'],
    'pay': ['Payment Methods'],
    'cod': ['Payment Methods'],
    'esewa': ['Payment Methods'],
    'warranty': ['Service Warranty'],
    'guarantee': ['Service Warranty'],
    'rating': ['Provider Ratings'],
    'review': ['Provider Ratings'],
    'emergency': ['Emergency Services'],
    'urgent': ['Emergency Services'],
    '24/7': ['Emergency Services'],
    'area': ['Service Areas'],
    'location': ['Service Areas'],
    'city': ['Service Areas']
  };
  
  // Find matching topics
  const matchingTopics = Object.entries(topicMappings)
    .filter(([key]) => normalizedTopic.includes(key))
    .flatMap(([, policies]) => policies);
  
  if (matchingTopics.length === 0) {
    return retrieve(topic, 3);
  }
  
  // Return specific policies
  return FAQ_DATA.filter(chunk => 
    matchingTopics.includes(chunk.title)
  );
}

// Search across all content
export async function searchAll(query: string): Promise<DocumentChunk[]> {
  return retrieve(query, 5);
}
