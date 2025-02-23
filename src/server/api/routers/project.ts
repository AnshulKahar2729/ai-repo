import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollCommits } from "~/lib/github";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        repoUrl: z.string(),
        projectName: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectName, repoUrl, githubToken } = input;

      console.log({ projectName, repoUrl, githubToken, ctx });
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.repoUrl,
          name: input.projectName,
          UserToProject: {
            create: {
              userId: ctx.user.id!,
            },
          },
          deletedAt: null,
        },
      });

      await pollCommits(project.id);
      return {
        success: true,
        message: "Project created successfully",
      };
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: ctx.user.id,
          },
        },
      },
    });

    if (!projects) {
      return [];
    }
    return projects;
  }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const commits = await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });

      pollCommits(input.projectId).then().catch(console.error);

      console.log({ commits });

      return commits;
    }),
});
