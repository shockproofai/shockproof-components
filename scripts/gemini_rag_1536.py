#!/usr/bin/env python3
"""
RAG Population with LangChain RecursiveCharacterTextSplitter and gemini-embedding-001

Uses LangChain's RecursiveCharacterTextSplitter for robust, batchable text splitting
and VertexAI embeddings with gemini-embedding-001 model.
"""

import argparse
import logging
import os
import sys
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import json

# Core libraries
import numpy as np
from google.cloud import storage
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials
from google.cloud.firestore_v1.vector import Vector
 


# LangChain imports for chunking and embeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_vertexai.embeddings import VertexAIEmbeddings
from langchain.text_splitter import RecursiveJsonSplitter

# File processing
import PyPDF2
import io

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'rag_gemini_1536_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class GeminiRAGPopulator:
    def __init__(self, bucket_path: str, target_dimensions: int = 1536, firestore_mode: str = 'cloud'):
        self.bucket_path = bucket_path.rstrip('/')
        self.bucket_name = bucket_path.replace('gs://', '').split('/')[0]
        self.bucket_prefix = '/'.join(bucket_path.replace('gs://', '').split('/')[1:]) if '/' in bucket_path.replace('gs://', '') else ''
        self.target_dimensions = target_dimensions
        self.firestore_mode = firestore_mode

        logger.info(f"🚀 Gemini RAG Populator initialized")
        logger.info(f"📦 Bucket: {self.bucket_name}")
        logger.info(f"📁 Prefix: {self.bucket_prefix}")
        logger.info(f"🎯 Target dimensions: {target_dimensions}")
        logger.info(f"🗄️  Firestore mode: {firestore_mode}")

        # Initialize services
        self._init_firebase()
        self._init_storage()
        self._init_langchain_embeddings()
        self._init_text_splitter()
        
    def _init_firebase(self):
        """Initialize Firebase Admin SDK for emulator or cloud based on mode"""
        try:
            if not firebase_admin._apps:
                firebase_admin.initialize_app()
            if self.firestore_mode == 'emulator':
                os.environ['FIRESTORE_EMULATOR_HOST'] = 'localhost:9198'
                self.db = firestore.Client()
                logger.info("✅ Firebase initialized for emulator")
            else:
                # Remove emulator env if set
                if 'FIRESTORE_EMULATOR_HOST' in os.environ:
                    del os.environ['FIRESTORE_EMULATOR_HOST']
                # Use cloud Firestore for project shockproof-dev in us-central1
                self.db = firestore.Client(project='shockproof-dev')
                logger.info("✅ Firebase initialized for cloud Firestore (project shockproof-dev, us-central1)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase: {e}")
            raise
    
    def _init_storage(self):
        """Initialize Google Cloud Storage"""
        try:
            self.storage_client = storage.Client()
            self.bucket = self.storage_client.bucket(self.bucket_name)
            logger.info("✅ Google Cloud Storage initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Storage: {e}")
            raise
    
    def _init_langchain_embeddings(self):
        """Initialize LangChain VertexAI embeddings with gemini-embedding-001"""
        try:
            # Initialize LangChain VertexAI embeddings with output_dimensionality
            self.embeddings = VertexAIEmbeddings(
                model_name="gemini-embedding-001",
                project="shockproof-dev",
                location="us-central1"
                #dimensions=1536 # Specify desired dimensions
            )
            
            # Test embedding generation
            #logger.info(f"🧪 Testing embedding generation with gemini-embedding-001...")
            #test_embedding = self.embeddings.embed(["Test embedding with gemini-embedding-001"], dimensions=self.target_dimensions)
            
            #actual_dimensions = len(test_embedding)
            logger.info(f"📊 Embedding model: gemini-embedding-001")
            logger.info(f"📏 Requested dimensions: {self.target_dimensions}")
            #logger.info(f"📏 Actual dimensions: {actual_dimensions}")
            
            #if actual_dimensions == self.target_dimensions:
            #    logger.info(f"✅ Successfully configured embeddings to {self.target_dimensions}D using output_dimensionality")
            #else:
            #    logger.warning(f"⚠️  Expected {self.target_dimensions}D but got {actual_dimensions}D")
            #    logger.info("💡 Using actual dimensions from the model")
            #    self.target_dimensions = actual_dimensions
            
            logger.info("✅ LangChain VertexAI embeddings initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize LangChain embeddings: {e}")
            raise
    
    def _init_text_splitter(self):
        """Initialize LangChain's RecursiveCharacterTextSplitter and RecursiveJSONSplitter"""
        try:
            # Use reasonable chunk size and overlap for RAG
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1024,
                chunk_overlap=128
            )
            self.json_splitter = RecursiveJsonSplitter(
                max_chunk_size=1024,
                min_chunk_size=200
            )
            logger.info("✅ LangChain RecursiveCharacterTextSplitter and RecursiveJSONSplitter initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize text splitters: {e}")
            raise
    
    def clear_collections(self):
        """Clear existing embeddings and sources collections"""
        logger.info("🧹 Clearing existing collections...")
        
        collections_to_clear = ['embeddings', 'sources']
        total_deleted = 0
        
        for collection_name in collections_to_clear:
            logger.info(f"🗑️  Clearing {collection_name} collection...")
            
            collection_ref = self.db.collection(collection_name)
            docs = list(collection_ref.stream())
            
            if not docs:
                logger.info(f"   📭 {collection_name} collection is already empty")
                continue
            
            logger.info(f"   📊 Found {len(docs)} documents to delete")
            
            # Delete in batches of 500 (Firestore limit)
            batch_size = 500
            for i in range(0, len(docs), batch_size):
                batch = self.db.batch()
                batch_docs = docs[i:i + batch_size]
                
                for doc in batch_docs:
                    batch.delete(doc.reference)
                
                batch.commit()
                total_deleted += len(batch_docs)
                logger.info(f"   ✅ Deleted batch {i//batch_size + 1}: {len(batch_docs)} documents")
        
        logger.info(f"🗑️  Total documents deleted: {total_deleted}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using LangChain VertexAI embeddings with output_dimensionality"""
        try:
            embedding = self.embeddings.embed([text], dimensions=self.target_dimensions)[0]
            actual_dim = len(embedding)
            if actual_dim != self.target_dimensions:
                logger.warning(f"⚠️  Embedding dimension mismatch: requested {self.target_dimensions}, got {actual_dim}")
            else:
                logger.info(f"✅ Embedding dimension: {actual_dim}")
            return embedding
        except Exception as e:
            logger.error(f"❌ Failed to generate embedding: {e}")
            raise
    
    def extract_text_from_pdf(self, blob) -> str:
        """Extract text from PDF blob"""
        try:
            pdf_content = blob.download_as_bytes()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            logger.warning(f"⚠️  Failed to extract text from PDF {blob.name}: {e}")
            return ""
    
    def extract_text_from_file(self, blob) -> str:
        """Extract text from any file, including JSON"""
        try:
            file_name = blob.name.lower()

            if file_name.endswith('.pdf'):
                return self.extract_text_from_pdf(blob)
            elif file_name.endswith(('.txt', '.md', '.csv')):
                return blob.download_as_text(encoding='utf-8')
            elif file_name.endswith('.json'):
                # Download and parse JSON
                try:
                    json_text = blob.download_as_text(encoding='utf-8')
                    json_obj = json.loads(json_text)
                    # Use RecursiveJSONSplitter to chunk JSON
                    json_chunks = self.json_splitter.split_json(json_obj)
                    # Join chunks as newline-separated strings for downstream chunking/embedding
                    return '\n'.join([json.dumps(chunk, ensure_ascii=False) for chunk in json_chunks])
                except Exception as e:
                    logger.error(f"❌ Failed to parse or split JSON from {blob.name}: {e}")
                    return ""
            elif file_name.endswith('.docx'):
                # For now, return empty - would need python-docx
                logger.warning(f"⚠️  DOCX files not supported yet: {blob.name}")
                return ""
            else:
                logger.warning(f"⚠️  Unsupported file type: {blob.name}")
                return ""
        except Exception as e:
            logger.error(f"❌ Failed to extract text from {blob.name}: {e}")
            return ""
    
    def split_text(self, text: str, file_name: Optional[str] = None) -> List[str]:
        """
        Use LangChain's RecursiveCharacterTextSplitter for most files, but skip for JSON (already chunked)
        """
        if not text or len(text.strip()) == 0:
            return []
        try:
            # If file is .json, treat each line as a chunk (from extract_text_from_file)
            if file_name and file_name.lower().endswith('.json'):
                return [line for line in text.split('\n') if line.strip()]
            # Otherwise, use text splitter
            chunks = self.text_splitter.split_text(text)
            return chunks
        except Exception as e:
            logger.error(f"❌ Error in text splitting: {e}")
            return []
    

    
    def process_file(self, blob, file_index: int, total_files: int) -> Dict[str, Any]:
        """Process a single file and return processing stats"""
        file_name = blob.name
        logger.info(f"📄 [{file_index}/{total_files}] Processing: {file_name}")
        start_time = time.time()
        try:
            # Extract text
            logger.info(f"   📖 Extracting text...")
            text = self.extract_text_from_file(blob)
            if not text or len(text.strip()) == 0:
                logger.warning(f"   ⚠️  No text extracted from {file_name}")
                return {
                    'status': 'no_text',
                    'chunks_created': 0,
                    'processing_time': time.time() - start_time
                }
            logger.info(f"   📊 Extracted {len(text):,} characters")
            # Create source document with FULL TEXT, split if >1MB
            logger.info(f"   💾 Creating source document...")
            source_doc_ref = self.db.collection('sources').document()
            max_field_size = 1_000_000  # 1MB in bytes (safe margin for Firestore)
            text_bytes = text.encode('utf-8')
            if len(text_bytes) <= max_field_size:
                # Store as single field
                source_doc_data = {
                    'fileName': file_name,
                    'text': text,
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'status': 'processed',
                    'contentType': blob.content_type or 'application/octet-stream',
                    'fileSize': blob.size,
                    'chunkCount': 0  # Will be updated after chunking
                }
            else:
                # Split into multiple fields
                logger.info(f"   ⚠️  Text exceeds 1MB, splitting into multiple fields...")
                text_fields = {}
                start = 0
                idx = 1
                while start < len(text_bytes):
                    end = min(start + max_field_size, len(text_bytes))
                    # Ensure we don't split in the middle of a multi-byte character
                    chunk = text_bytes[start:end]
                    # Try to decode, if fails, backtrack until valid
                    while True:
                        try:
                            chunk_str = chunk.decode('utf-8')
                            break
                        except UnicodeDecodeError:
                            chunk = chunk[:-1]
                    text_fields[f'text{idx}'] = chunk_str
                    start += len(chunk)
                    idx += 1
                source_doc_data = {
                    'fileName': file_name,
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'status': 'processed',
                    'contentType': blob.content_type or 'application/octet-stream',
                    'fileSize': blob.size,
                    'chunkCount': 0  # Will be updated after chunking
                }
                source_doc_data.update(text_fields)
            source_doc_ref.set(source_doc_data)
            source_doc_id = source_doc_ref.id
            logger.info(f"   ✅ Source document created: {source_doc_id}")
            # Chunking using RecursiveCharacterTextSplitter
            logger.info(f"   🔪 Performing RecursiveCharacterTextSplitter chunking...")
            chunks = self.split_text(text, file_name=file_name)
            if not chunks:
                logger.error(f"   ❌ Text splitting failed for {file_name}")
                # Update source document to reflect failure
                source_doc_ref.update({
                    'status': 'failed',
                    'error': 'Text splitting failed',
                    'chunkCount': 0
                })
                return {
                    'status': 'chunking_failed',
                    'chunks_created': 0,
                    'processing_time': time.time() - start_time
                }
            logger.info(f"   📋 Created {len(chunks)} text chunks")
            # Batch embed chunks in groups of 100 (VertexAI API limit is 250, exclusive of 251)
            logger.info(f"     🔢 Generating embeddings for {len(chunks)} chunks (batch size ≤ 100)...")
            embedding_start = time.time()
            all_embeddings = []
            max_batch = 100
            for batch_start in range(0, len(chunks), max_batch):
                batch_chunks = chunks[batch_start:batch_start+max_batch]
                batch_embeddings = self.embeddings.embed(batch_chunks, dimensions=self.target_dimensions)
                # Check dimension for first batch only
                if batch_embeddings:
                    actual_dim = len(batch_embeddings[0])
                    if actual_dim != self.target_dimensions:
                        logger.warning(f"⚠️  Embedding dimension mismatch in batch: requested {self.target_dimensions}, got {actual_dim}")
                    else:
                        logger.info(f"✅ Embedding dimension in batch: {actual_dim}")
                all_embeddings.extend(batch_embeddings)
            embedding_time = time.time() - embedding_start
            logger.info(f"     ✅ Generated {len(all_embeddings)} embeddings in {embedding_time:.2f}s")
            # Batch write embedding documents (max 50 per Firestore batch to avoid transaction size limits)
            chunks_created = 0
            batch_size = 50
            total_chunks = len(chunks)
            batch = self.db.batch()
            for chunk_index in range(total_chunks):
                chunk_text = chunks[chunk_index]
                embedding = Vector(all_embeddings[chunk_index])
                logger.info(f"   🧩 Processing chunk {chunk_index + 1}/{total_chunks} ({len(chunk_text):,} chars)")
                logger.info(f"   🔎 Embedding length before Firestore write: {len(embedding)}")
                embedding_doc_data = {
                    'text': chunk_text,
                    'embedding': embedding,
                    'fileName': file_name,
                    'sourceId': source_doc_id,
                    'chunkIndex': chunk_index,
                    'totalChunks': total_chunks,
                    'chunkSize': len(chunk_text),
                    'chunkId': f"{source_doc_id}_chunk_{chunk_index}",
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'status': 'active'
                }
                embedding_doc_ref = self.db.collection('embeddings').document()
                batch.set(embedding_doc_ref, embedding_doc_data)
                chunks_created += 1
                # Commit every batch_size chunks
                if (chunks_created % batch_size == 0) or (chunk_index == total_chunks - 1):
                    batch.commit()
                    logger.info(f"     💾 Batch committed: chunks {chunk_index - batch_size + 2} to {chunk_index + 1}")
                    batch = self.db.batch()
            # Update source document with chunk count
            source_doc_ref.update({'chunkCount': chunks_created})
            processing_time = time.time() - start_time
            logger.info(f"   ✅ File processed in {processing_time:.2f}s")
            logger.info(f"   📊 Summary: {chunks_created} chunks, {len(text):,} chars, {len(all_embeddings[0])}D embeddings")
            return {
                'status': 'success',
                'chunks_created': chunks_created,
                'processing_time': processing_time,
                'text_length': len(text),
                'embedding_dimensions': len(all_embeddings[0])
            }
        except Exception as e:
            logger.error(f"   ❌ Failed to process {file_name}: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'chunks_created': 0,
                'processing_time': time.time() - start_time
            }
    
    def process_all_files(self):
        """Process all files in the bucket"""
        logger.info(f"🔍 Scanning bucket for files...")
        
        # List all files
        blobs = list(self.bucket.list_blobs(prefix=self.bucket_prefix))
        
        # Filter out directories and hidden files
        file_blobs = [blob for blob in blobs if not blob.name.endswith('/') and not blob.name.split('/')[-1].startswith('.')]
        
        logger.info(f"📊 Found {len(file_blobs)} files to process")
        
        if not file_blobs:
            logger.warning("⚠️  No files found in bucket")
            return
        
        # Process each file
        total_stats = {
            'total_files': len(file_blobs),
            'successful': 0,
            'failed': 0,
            'no_text': 0,
            'chunking_failed': 0,
            'total_chunks': 0,
            'start_time': time.time(),
            'failed_files': []  # List of dicts: {'file': ..., 'error': ...}
        }
        
        for i, blob in enumerate(file_blobs, 1):
            logger.info(f"\n{'='*100}")
            logger.info(f"🎯 PROCESSING FILE {i}/{len(file_blobs)} ({i/len(file_blobs)*100:.1f}%)")
            logger.info(f"📁 File: {blob.name}")
            logger.info(f"📊 Size: {blob.size:,} bytes")
            logger.info(f"⏱️  Estimated completion: {((time.time() - total_stats['start_time']) / i * (len(file_blobs) - i) / 60):.1f} minutes")
            logger.info(f"{'='*100}")
            
            result = self.process_file(blob, i, len(file_blobs))

            # Update statistics
            if result['status'] == 'success':
                total_stats['successful'] += 1
                total_stats['total_chunks'] += result['chunks_created']
            elif result['status'] == 'error':
                total_stats['failed'] += 1
                total_stats['failed_files'].append({'file': blob.name, 'error': result.get('error', 'Unknown error')})
            elif result['status'] == 'no_text':
                total_stats['no_text'] += 1
            elif result['status'] == 'chunking_failed':
                total_stats['chunking_failed'] += 1
                total_stats['failed_files'].append({'file': blob.name, 'error': 'Text splitting failed'})
        
        # Final summary (moved inside method for correct scope)
        total_time = time.time() - total_stats['start_time']
        logger.info(f"\n{'='*100}")
        logger.info(f"🏁 PROCESSING COMPLETE - RECURSIVE CHARACTER TEXT SPLITTER WITH GEMINI-EMBEDDING-001")
        logger.info(f"{'='*100}")
        logger.info(f"📊 Total files processed: {total_stats['total_files']}")
        logger.info(f"✅ Successful: {total_stats['successful']}")
        logger.info(f"❌ Failed: {total_stats['failed']}")
        logger.info(f"📝 No text: {total_stats['no_text']}")
        logger.info(f"🔪 Chunking failed: {total_stats['chunking_failed']}")
        logger.info(f"🧩 Total chunks created: {total_stats['total_chunks']:,}")
        logger.info(f"🎯 Embedding dimensions: {self.target_dimensions}")
        logger.info(f"⏱️  Total processing time: {total_time/60:.1f} minutes")
        logger.info(f"📈 Average time per file: {total_time/total_stats['total_files']:.1f} seconds")
        logger.info(f"🔢 Average chunks per file: {total_stats['total_chunks']/max(total_stats['successful'], 1):.1f}")
        logger.info(f"💾 Sources collection: Full text stored for each file")
        logger.info(f"🔍 Embeddings collection: RecursiveCharacterTextSplitter chunks with {self.target_dimensions}D vectors")
        logger.info(f"🤖 Model: gemini-embedding-001 via LangChain VertexAI")
        if total_stats['failed_files']:
            logger.info(f"\n❌ Failed files:")
            for fail in total_stats['failed_files']:
                logger.info(f"   - {fail['file']}: {fail['error']}")
        logger.info(f"{'='*100}")

def main():
    parser = argparse.ArgumentParser(description='Populate RAG with gemini-embedding-001 and configurable dimensions')
    parser.add_argument('bucket_path', help='GCS bucket path (e.g., gs://bucket_name/path/)')
    parser.add_argument('--dimensions', type=int, default=1536, help='Target embedding dimensions (max 3072)')
    parser.add_argument('--clear-collections', action='store_true', help='Clear existing collections before processing')
    parser.add_argument('--firestore-mode', choices=['cloud', 'emulator'], default='cloud', help='Use Firestore emulator or cloud (default: cloud)')

    args = parser.parse_args()

    # Validate dimensions
    if args.dimensions > 3072:
        logger.error("❌ Maximum dimensions for gemini-embedding-001 is 3072")
        sys.exit(1)

    try:
        populator = GeminiRAGPopulator(args.bucket_path, args.dimensions, firestore_mode=args.firestore_mode)

        if args.clear_collections:
            populator.clear_collections()

        populator.process_all_files()

    except KeyboardInterrupt:
        logger.info("\n⏹️  Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()