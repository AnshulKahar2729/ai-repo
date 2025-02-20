import React from "react";
import { auth } from "~/auth";

export default async function Page() {
  const session = await auth();
  return <pre>{session?.user?.email}</pre>;
}
