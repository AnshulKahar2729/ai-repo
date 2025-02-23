"use client";

import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useRefetch } from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

interface CreatePageProps {}

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};
const CreatePage: FC<CreatePageProps> = ({}) => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const refetch = useRefetch();

  const createProject = api.project.createProject.useMutation();
  const onSubmit = (data: FormInput) => {
    createProject.mutate({
      projectName: data.projectName,
      repoUrl: data.repoUrl,
      githubToken: data.githubToken,
    }, {
      onSuccess() {
          toast.success("Project created successfully");
          reset();
          refetch();
      },
      onError(){
        toast.error("Error creating project");
      }
    });
    console.log("submitted");
  };
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img
        src="/create-project.svg"
        alt=""
        className="h-56 w-auto rounded-md"
      />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to the platform.
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("repoUrl", { required: true })}
              type="url"
              placeholder="Enter your repository URL"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Enter your project name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken", { required: true })}
              placeholder="Enter your github token (optional) "
              required
            />
            <div className="h-4"></div>
            <Button disabled={createProject.isPending} type="submit">Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
