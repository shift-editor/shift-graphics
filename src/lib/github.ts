const repositoryUrl = "https://api.github.com/repos/shift-editor/shift";

export async function getGitHubStarCount(): Promise<number | null> {
  try {
    const response = await fetch(repositoryUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== "object" ||
      !("stargazers_count" in data) ||
      !Number.isSafeInteger(data.stargazers_count) ||
      (data.stargazers_count as number) < 0
    ) {
      return null;
    }

    return data.stargazers_count as number;
  } catch {
    return null;
  }
}
