import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { profile } from "console";
import { User } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    // Custom "Credentials" provider based off https://github.com/HackerSpace-PESU/pesu-auth
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "PESU Auth",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "SRN or PRN",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const params = { ...credentials, profile: true };
        const res = await fetch("https://pesu-auth.onrender.com/authenticate", {
          method: "POST",
          body: JSON.stringify(params),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        // If no error and we have user data
        if (res.ok && data.status) {
          const classAndSection = data.know_your_class_and_section;
          // TODO: Fix the type scream caused by id default field not supplied
          // TODO: Consider if user exists in the database or not
          const user = {
            name: data.profile.name,
            prn: data.profile.prn,
            srn: data.profile.srn,
            program: data.profile.program,
            branch_short_code: data.profile.branch_short_code,
            branch: data.profile.branch,
            semester: data.profile.semester,
            section: data.profile.section,
            campus_code: data.profile.campus_code,
            campus: data.profile.campus,
            class: classAndSection.class,
            cycle: classAndSection.cycle,
            department: classAndSection.department,
            institute_name: classAndSection.institute_name,
          };

          return user;
        }

        // if user data could not be retrieved
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
