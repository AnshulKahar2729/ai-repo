"use client";
import React, { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface UserButtonProps {
  email: string;
  image?: string;
}

const UserButton: FC<UserButtonProps> = ({ email, image }) => {
  const extractInitials = (email: string) => {
    const name = email.split("@")[0];
    if (!name) return "";
    if (name.length === 1) return name.toUpperCase();
    return name?.[0]?.toUpperCase() || "";
  };

  return (
    <Avatar className="cursor-pointer bg-gray-600">
      <AvatarImage src={image} />
      <AvatarFallback>{extractInitials(email)}</AvatarFallback>
    </Avatar>
  );
};

export default UserButton;
