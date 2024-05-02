import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  DefaultUser,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { Role, StudentInfo, ClubInfo, AdminInfo } from "~/types";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  export interface Session extends DefaultSession {
    user: User;
  }


  export interface User extends DefaultUser {
    role: Role;
    id: string;
    studentInfo?: StudentInfo | undefined;
    clubInfo?: ClubInfo | undefined;
    adminInfo?: AdminInfo | undefined;
  }
}

declare module "next-auth/jwt" {
  export interface JWT {
    role: Role;
    id: string;
    studentInfo?: StudentInfo | undefined;
    clubInfo?: ClubInfo | undefined;
    adminInfo?: AdminInfo | undefined;
  }
}


/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        switch(user.role) {
          case "student":
            token.role = user.role;
            token.id = user.id;
            token.studentInfo = user.studentInfo;
            break;
          case "admin":
            token.role = user.role;
            token.id = user.id;
            token.adminInfo = user.adminInfo;
            break;
          case "club":
            token.role = user.role;
            token.id = user.id;
            token.clubInfo = user.clubInfo;
            break;
        }
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        role: token.role,
        id: token.id,
        studentInfo: token?.studentInfo,
        clubInfo: token?.clubInfo,
        adminInfo: token?.adminInfo,
      },
    }),
    async redirect(props) {
      const { baseUrl } = props;
      let { url } = props;
      const cleanedUpUrl = new URL(url);
      cleanedUpUrl.searchParams.delete("callbackUrl");
      url = cleanedUpUrl.toString();
      if (url.startsWith("/"))
        return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) 
        return url
      return baseUrl
    }
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "PESU Auth",
      id: "pesu-auth",
      credentials: {
        username: {
          label: "Username",
          type: "text",
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

        if (data) {
          const classAndSection = data.know_your_class_and_section;
          const user = {
            role: "student" as "student",
            id: data.profile.prn,
            studentInfo: {
              name: data.profile.name,
              prn: data.profile.prn,
              srn: data.profile.srn,
              email: data.profile.email,
              phone: data.profile.phone,
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
            }
          };
          return user;
        }
        // if user data could not be retrieved
        return null;
      },
    }),
    CredentialsProvider({
      name: "Tix Auth",
      id: "tix-auth",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        let user = null;
        if (credentials?.username == "pragma" && credentials?.password == "pragma") {
          user = {
            role: "club" as "club",
            id: "pragma",
            clubInfo: {
              username: "pragma",
              name: "pragma",
              campus: "RR" as "RR"
            }
          };
        }
        else if (credentials?.username == "admin" && credentials?.password == "admin") {
          user = {
            role: "admin" as "admin",
            id: "admin",
            adminInfo: {
              username: "admin",
              name: "Admin"
            }
          };
        }
        else  {
          user = null;
        }
        console.log(user);
        return user;
      },
    })
  ],
  pages: {
    signIn: "/login",
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
