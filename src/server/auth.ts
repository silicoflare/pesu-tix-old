import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { type GetServerSidePropsContext } from 'next';
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  DefaultUser,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { env } from '~/env.mjs';
import { db } from '~/server/db';
import { Role, StudentInfo, ClubInfo, AdminInfo } from '~/types';
import { server_api } from '~/utils/api';
import { sha256 } from 'js-sha256';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
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

declare module 'next-auth/jwt' {
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
    strategy: 'jwt',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        switch (user.role) {
          case 'student':
            token.role = user.role;
            token.id = user.id;
            token.studentInfo = user.studentInfo;
            break;
          case 'admin':
            token.role = user.role;
            token.id = user.id;
            token.adminInfo = user.adminInfo;
            break;
          case 'club':
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
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    /**
     * PESU-auth to authenticate students
     */
    CredentialsProvider({
      name: 'PESU Auth',
      id: 'pesu-auth',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const res = await fetch('https://pesu-auth.onrender.com/authenticate', {
          method: 'POST',
          body: JSON.stringify({ ...credentials, profile: true }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (data) {
          const classAndSection = data.know_your_class_and_section;
          const user = {
            role: 'student' as 'student',
            id: data.profile.prn,
            studentInfo: {
              prn: data.profile.prn,
              srn: data.profile.srn,
              name: data.profile.name,
              phone: data.profile.phone,
              email: data.profile.email,
              program: data.profile.program,
              branch: classAndSection.branch,
              semester: data.profile.semester,
              section: data.profile.section,
              campus: data.profile.campus,
              cycle: classAndSection.cycle,
            },
          };
          const res = await server_api.student.findStudent.query({
            prn: user.studentInfo.prn,
          });
          if (res === null) {
            await server_api.student.addStudent.mutate({
              student: user.studentInfo,
            });
          }
          return user;
        }
        // if user data could not be retrieved
        return null;
      },
    }),

    /**
     * Tix-auth to authenticate clubs and admins
     */
    CredentialsProvider({
      name: 'Tix Auth',
      id: 'tix-auth',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        let user = null;

        const res = await server_api.club.get.query({
          username: credentials!.username,
        });
        if (res && res.password === sha256(credentials!.password)) {
          console.log(res);
          user = {
            role: 'club' as 'club',
            id: res.username,
            clubInfo: {
              username: res.username,
              name: res.name,
              campus: res.campus as ClubInfo['campus'],
              avatar: res.avatar,
            },
          };
        } else {
          const res = await server_api.admin.getAdmin.query({
            username: credentials!.username,
          });
          if (res && res.password === sha256(credentials!.password)) {
            user = {
              role: 'admin' as 'admin',
              id: res.username,
              adminInfo: {
                username: res.username,
                name: res.name,
              },
            };
          } else {
            user = null;
          }
        }
        return user;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
