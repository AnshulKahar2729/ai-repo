import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { aiSummarizeCode, generateEmbedding } from "./gemini";
import { db } from "~/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      "test",
      "tests",
      "docs",
      "doc",
      "examples",
      "example",
      "samples",
      "sample",
      "public",
      "static",
      "assets",
      "asset",
      "images",
      "image",
      "img",
      "media",
      "video",
      "videos",
      "audio",
      "audios",
      "sounds",
      "sound",
      "fonts",
      "font",
      "css",
      "styles",
      "style",
      "scss",
      "sass",
      "less",
      "stylus",
      "html",
      "htm",
      "xml",
      "json",
      "yaml",
      "yml",
      "md",
      "markdown",
      "txt",
      "log",
      "lock",
      "gitignore",
      "editorconfig",
      "prettierrc",
      "eslintignore",
      "eslintrc",
      "babelrc",
      "babelrc.js",
      "babelrc.json",
      "babelrc.yaml",
      "babelrc.yml",
      "babelrc.lock",
      "tsconfig.json",
      "tsconfig.lock",
      "tsconfig.build",
      "tsconfig.prod",
      "tsconfig.dev",
      "tsconfig.test",
      "tsconfig.esm",
      "tsconfig.cjs",
      "tsconfig.common",
      "tsconfig.shared",
      "tsconfig.shared.json",
      "tsconfig.shared.lock",
      "tsconfig.shared.yaml",
      "tsconfig.shared.yml",
      "tsconfig.shared.lock",
      "tsconfig.shared.js",
      "tsconfig.shared.cjs",
      "tsconfig.shared.esm",
      "tsconfig.shared.prod",
      "tsconfig.shared.dev",
      "tsconfig.shared.test",
      "tsconfig.shared.build",
      "tsconfig.shared.esm.json",
      "tsconfig.shared.cjs.json",
      "tsconfig.shared.prod.json",
      "tsconfig.shared.dev.json",
      "tsconfig.shared.test.json",
      "tsconfig.shared.build.json",
      "tsconfig.shared.esm.lock",
      "tsconfig.shared.cjs.lock",
      "tsconfig.shared.prod.lock",
      "tsconfig.shared.dev.lock",
      "tsconfig.shared.test.lock",
      "tsconfig.shared.build.lock",
      "tsconfig.shared.esm.js",
      "tsconfig.shared.cjs.js",
      "tsconfig.shared.prod.js",
      "tsconfig.shared.dev.js",
      "tsconfig.shared.test.js",
      "tsconfig.shared.build.js",
      "tsconfig.shared.esm.cjs",
      "tsconfig.shared.cjs.esm",
      "tsconfig.shared.prod.cjs",
      "tsconfig.shared.dev.cjs",
      "tsconfig.shared.test.cjs",
      "tsconfig.shared.build",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();

  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);

  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.all(
    allEmbeddings.map(async (embedding) => {
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          fileName: embedding.fileName,
          sourceCode: embedding.sourceCode,
          summary: embedding.summary,
          projectId,
        },
      });

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
      `
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await aiSummarizeCode(doc);
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
