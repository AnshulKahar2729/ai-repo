import NextAuth from "next-auth";
import "next-auth/jwt";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { db } from "./server/db";
import { signInSchema } from "./types/auth";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { NextResponse } from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub,
    Google,
    LinkedIn,
    Credentials({
      async authorize(credentials) {
        const { email, password } = await signInSchema.parseAsync(credentials);
        console.log("Authenticating with email in auth.ts:", email);
        // Check if the user exists

        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          // If the user does not exist, create a new user
          const hashedPassword = await bcrypt.hash(password, 10);

          user = await db.user.create({
            data: {
              email,
              password: hashedPassword, // Store the hashed password
            },
          });
        }

        // Check if the password matches
        if (!user?.password) {
          throw new Error("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
  pages: {
    newUser: "/auth/sign-up",
    signIn: "/auth/sign-in",
  },
  basePath: "/auth",
  session: { strategy: "jwt" },
  callbacks: {
    async redirect({ baseUrl, url }) {
      console.log("Redirect callback triggered, URL:", url, baseUrl);
      return `${baseUrl}/dashboard`
    },

    // authorized({ request: { nextUrl }, auth }) {
    //   const isLoggedIn = !!auth?.user;
    //   console.log("isLoggedIn in auth.ts:", isLoggedIn);
    //   const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
    //   if (isOnDashboard) {
    //     if (isLoggedIn) return true;
    //     return false;
    //   } else if (isLoggedIn) {
    //     return true;
    //   }
    //   return true;
    // },
    jwt({ token, trigger, session }) {
      if (trigger === "update") token.name = session.user.name;
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;

      return session;
    },
  },
  experimental: { enableWebAuthn: true },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
