import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummarizeCommits = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert programmer and you are trying to summarize a git diff. Reminders about the git diff format:
        For every file, there are a few metadata, like (for example):
        \'\'\'

        diff --git a/lib/index/js b/lib/index.js
        index aadf691..bfef603 10044
        --- a/lib/index.js
        +++ b/lib/index.js
        \'\'\'

        This means that \'a/lib/index.js\' was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \'+\' means that the line was added, a line starting with \'-\' means that the line was removed.
        A line that starts with neither \'+\' nor \'-\' is code given for context.
        It is not a part of diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \'\'\'
        * Raised the amount of returned recordings fromm \'10\' to \'20\'. [packages/server/recording.ts], [packages/server/constant.ts]
        * Added a new function to handle the new feature. [packages/server/recording.ts]
        * Removed the old function that was no longer needed. [packages/server/recording.ts]
        * Fixed a bug that caused the server to crash. [packages/server/recording.ts]
        * Added a new feature that allows users to download recordings. [packages/server/recording.ts]
        * Added a new feature that allows users to upload recordings.
        
        \'\'\'
        Most commmits will have less comments than this example list.
        The last comment does not include file names.
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary. This is only an example.`,
    `Please summarize the following git diff:\n\n${diff}`,
  ]);
  return response.response.text();
};

export const aiSummarizeCode = async (doc: Document) => {
  console.log("getting summmary for file name", doc.metadata.source);

  try {
    const code = doc.pageContent.slice(0, 10000);

    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects. You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file. Here is the code : 
        ---
        ${code}
        ---

        Give a summary no more than 100 words of the code above.
        `,
    ]);

    return response.response.text();
  } catch (error) {
    console.error("Error in summarizing code", error);
    return "";
  }
};

export const generateEmbedding = async (summary: string) => {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent([summary]);
  const embedding = result.embedding;

  return embedding.values;
};
