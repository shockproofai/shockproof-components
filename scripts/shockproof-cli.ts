import { Command } from 'commander';
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import pdf from 'pdf-parse';
import { genkit } from 'genkit';
import { gemini25FlashLite, googleAI, textEmbedding004 } from '@genkit-ai/googleai';
import { z } from 'zod';
import { chunk } from 'llm-chunk';

const program = new Command();

program
	.name('shockproof-cli')
	.description('CLI for Shockproof')
	.version('1.0.0');

// Initialize Firebase with emulator configuration AFTER setting emulator host
initializeApp({
	projectId: 'shockproof-dev'  // Ensure we use the same project as Python
})
const db = getFirestore();

// Set global timeout for HTTP requests
process.env.GCLOUD_PROJECT_TIMEOUT = '300000'; // 5 minutes

const ai = genkit({
	plugins: [googleAI()],
});

const questionsSchema = z.array(z.string().describe("A high-level conceptual question extracted from the text"));


program
	.command('generate-sample-questions <numQuestions> [fileName]')
	.description('Generate sample questions for the given fileName from embeddings, or for all documents if fileName not provided')
	.action(async (numQuestions: string, fileName?: string) => {
		try {
			let querySnapshot;

			if (fileName) {
				// Query Firestore for the specific document with fileName
				querySnapshot = await db.collection('sources').where('fileName', '==', fileName).get();
				if (querySnapshot.empty) {
					console.error(`No document found with fileName: ${fileName}`);
					process.exit(1);
				}
			} else {
				// Query all documents in the embeddings collection
				querySnapshot = await db.collection('sources').get();
				if (querySnapshot.empty) {
					console.error('No documents found in sources collection');
					process.exit(1);
				}
				console.log(`Found ${querySnapshot.docs.length} documents to process`);
			}

			// Process each document
			for (const doc of querySnapshot.docs) {
				const data = doc.data();
				const text = data.text;
				const docFileName = data.fileName;

				if (!text) {
					console.error(`No text field in document ${docFileName || doc.id}`);
					continue;
				}

				console.log(`Processing ${docFileName || doc.id}...`);

				// Generate questions using Genkit
				const prompt = `Generate ${numQuestions} high-level conceptual sample questions (not details) that a learner might plausibly ask about the general concepts in this text: ${text}`;
				try {
					const response = await ai.generate({
						model: gemini25FlashLite,
						prompt: prompt,
						output: { schema: questionsSchema }
					});

					console.log(`Generated questions for ${docFileName || doc.id}:`, response.output);
					const questions = response.output;

					// Update the document
					await doc.ref.update({ questions });
					console.log(`Questions generated and stored successfully for ${docFileName || doc.id}`);
				} catch (genError) {
					console.error(`❌ Failed to generate questions for ${docFileName || doc.id}:`, genError);
					continue;
				}
			}

			console.log('All documents processed successfully');
		} catch (error) {
			console.error('Error:', error);
			process.exit(1);
		}
	});


program.command("*").action(() => {
	program.help()
})

program.parse(process.argv)

if (!program.args.length) program.help()
