"use client";
import React, { FC } from "react";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { Prism as SyntaxHiglighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeReferencesProps {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
}
const CodeReferences: FC<CodeReferencesProps> = ({ filesReferences }) => {
  const [tab, setTab] = React.useState(filesReferences[0]?.fileName);
  if (filesReferences.length === 0) return null;
  return (
    <div className="max-w-[80vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-auto rounded-md bg-gray-200 p-1">
          {filesReferences?.map((file) => {
            return (
              <button
                onClick={() => setTab(file.fileName)}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                  {
                    "bg-primary text-primary-foreground": tab === file.fileName,
                  },
                )}
                key={file.fileName}
              >
                {file.fileName}
              </button>
            );
          })}
        </div>

        {filesReferences?.map((file) => {
          return (
            <TabsContent
              value={file.fileName}
              key={file.fileName}
              className="max-h-[40vh] max-w-7xl overflow-auto rounded-md"
            >
              <SyntaxHiglighter
                language="typescript"
                style={lucario}
                showLineNumbers
              >
                {file.sourceCode}
              </SyntaxHiglighter>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
