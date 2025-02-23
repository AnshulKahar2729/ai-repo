import { Octokit } from "octokit";

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

export const pullCommits = async (projectId : string) => {
  try {
    const {project, githubUrl} = await fetchProjectGithubUrl(projectId);
    
    return commits;
  } catch (error) {
    console.error(error);
    return [];
  }
};
