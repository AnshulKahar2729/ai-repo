import { api } from "~/trpc/react";
import {useLocalStorage} from "usehooks-ts"

export const useProject = () => {
  const {data: projects} =  api.project?.getProjects.useQuery();
  console.log(projects);
  const [projectId, setProjectId] = useLocalStorage("ai-repo-projectId", "");
  const project = projects?.find((project) => project.id === projectId);

  return {
    projects ,
    project,
    projectId,
    setProjectId,
  }
};
