from crewai.tools import tool
from app.core.vector_store import get_chroma_collection, get_embedding_model

def create_secure_search_tool(org_id: int):
    """
    Creates a CrewAI tool dynamically bound to a specific org_id.
    """
    
    @tool("Search_Organization_Knowledge_Base")
    def search_knowledge_base(query: str) -> str:
        """
        Useful for searching the organization's uploaded PDFs, competitor data, 
        and marketing assets. Input should be a specific search query.
        """
        collection = get_chroma_collection()
        embedding_model = get_embedding_model()
        
        query_embedding = embedding_model.embed_query(query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            where={"org_id": org_id} 
        )
        
        if not results['documents'] or not results['documents'][0]:
            return "No relevant information found in the knowledge base."
            
        retrieved_text = "\n\n".join(results['documents'][0])
        return f"Retrieved Information:\n{retrieved_text}"
        
    return search_knowledge_base