'use server'
import {streamText} from "ai";
import {createStreamableValue} from "ai/rsc";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import { generateEmbedding } from "~/lib/gemini";
import { db } from "~/server/db";

const google = createGoogleGenerativeAI({
    apiKey : process.env.GEMINI_API_KEY!,
})

export async function askQuestion(question : string, projectId : string) {
    const stream = createStreamableValue();

    const queryVector = await generateEmbedding(question);
    const vectorQuery = `[${queryVector.join(",")}]`;

    const result = await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) as similarity
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC
        LIMIT 10
    ` as {fileName : string, sourceCode : string, summary : string}[];

    let context = "";

    for (const doc of result) {
        context += `source: ${doc.fileName}\n`;
        context += `Summary: ${doc.summary}\n`;
        context += `Code: ${doc.sourceCode}\n\n`;
    }

    (async () => {
        const {textStream} = await streamText({
            model : google("gemini-1.5-flash"),
            prompt : `
                You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase better. 
                AI assistant is a brand new, powerful, human-like  artificial intelligence. The traits of the AI include expert knowledge, helpfulness, cleverness, and articulateness.

                AI is a well-behaved and well-mannered individual. AI is always friendly, kind and inspiring and he is eager to provide vivid and thoughtful responses to the user.

                AI has sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.

                If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.

                START CONTEXT BLOCK
                ${context}
                END CONTEXT BLOCK

                START QUESTION
                ${question}
                END QUESTION

                AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
                If the context does not provided the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer tp that question.
                AI assistant will not apologize for the previous answer, but instead will indicated new information was gained.
                AI assistant will not invent anything that is not drawn directly from the context block.
                Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no ambiguity in the answer.
            `
        })

        for await (const text of textStream) {
            stream.update(text);
        }

        stream.done();
    })()

    return {
        output : stream.value,
        filesReference : result
    }

     
}