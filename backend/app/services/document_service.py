import tempfile
import os
import uuid
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.vector_store import get_chroma_collection, get_embedding_model

class DocumentService:
    def __init__(self):
        self.collection = get_chroma_collection()
        self.embedding_model = get_embedding_model()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )

    async def process_pdf(self, file: UploadFile, org_id: int):
        """Saves an uploaded PDF temporarily, extracts text, and ingests it."""
        # Create a temporary file to allow LangChain's PyPDFLoader to read it
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(await file.read())
            tmp_path = tmp_file.name

        try:
            loader = PyPDFLoader(tmp_path)
            docs = loader.load()
            self._ingest_documents(docs, source=file.filename, org_id=org_id)
        finally:
            os.remove(tmp_path) # Clean up the temp file

    def process_url(self, url: str, org_id: int):
        """Scrapes a URL, extracts text, and ingests it."""
        loader = WebBaseLoader(url)
        docs = loader.load()
        self._ingest_documents(docs, source=url, org_id=org_id)

    def _ingest_documents(self, docs, source: str, org_id: int):
        """Chunks documents, generates embeddings, and saves to ChromaDB with org_id metadata."""
        chunks = self.text_splitter.split_documents(docs)
        
        texts = [chunk.page_content for chunk in chunks]
        
        # MANDATORY: Attach the tenant ID to every chunk to ensure strict data isolation
        metadatas = [{"source": source, "org_id": org_id} for _ in chunks]
        
        # Generate unique IDs for ChromaDB
        ids = [str(uuid.uuid4()) for _ in chunks]
        
        # Generate embeddings locally
        embeddings = self.embedding_model.embed_documents(texts)
        
        # Upsert into the vector database
        self.collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )