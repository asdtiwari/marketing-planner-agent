import os
import chromadb
from chromadb.config import Settings
from langchain_huggingface import HuggingFaceEmbeddings

# Define where ChromaDB will store its SQLite and Parquet files locally
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "../../chroma_data")
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

# Initialize the persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# Get or create the main collection for all marketing documents
# We use cosine similarity to measure the distance between vectors
collection = chroma_client.get_or_create_collection(
    name="marketing_assets",
    metadata={"hnsw:space": "cosine"}
)

# Initialize the free, local embedding model
# This will download the model weights the first time it runs
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_chroma_collection():
    return collection

def get_embedding_model():
    return embedding_model