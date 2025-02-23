import { Octokit } from "octokit";
import { db } from "~/server/db";
import axios from "axios";
import { aiSummarizeCommits } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(3);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 15).map(
    (commit) =>
      ({
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitAuthorName: commit.commit.author.name ?? "",
        commitDate: commit.commit.author.date ?? "",
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
      }) as Response,
  );
};

export const pollCommits = async (projectId: string) => {
  try {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(
      projectId,
      commitHashes,
    );

    const summarises = await Promise.allSettled(
      unprocessedCommits.map(async (commit) => {
        const summary = await summarizeCommit(githubUrl, commit.commitHash);
        return {
          ...commit,
          summary,
        };
      }),
    );

    const processedCommits = await db.commit.createMany({
      data: summarises
        .filter((summary) => summary.status === "fulfilled")
        .map((summary) => ({
          commitHash: summary.value.commitHash,
          commitMessage: summary.value.commitMessage,
          commitAuthorName: summary.value.commitAuthorName,
          commitAuthorAvatar: summary.value.commitAuthorAvatar,
          commitDate: summary.value.commitDate,
          summary: summary.value.summary,
          projectId,
        })),
    });

    return processedCommits;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no GitHub URL");
  }
  return { project, githubUrl: project?.githubUrl };
};

export const filterUnprocessedCommits = async (
  projectId: string,
  commitHashes: Response[],
) => {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });

  if (processedCommits.length === 0) {
    return commitHashes;
  }

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
};

export const summarizeCommit = async (
  githubUrl: string,
  commitHash: string,
) => {
  // get the diff, and then pass the diff to the ai
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  return (await aiSummarizeCommits(data)) || "";
};
