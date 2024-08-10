import { NhostClient } from '@nhost/nextjs';

export function namify(name: string) {
  if (name.toLowerCase() === 'silicoflare') return 'SilicoFlare';
  let tokens = name.split(' ');
  tokens = tokens.map(
    (token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase(),
  );
  return tokens.join(' ');
}

export const studentFields: Record<string, string> = {
  prn: 'PRN',
  srn: 'SRN',
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  program: 'Program',
  branch: 'Branch',
  semester: 'Semester',
  section: 'Section',
  campus: 'Campus',
  cycle: 'Cycle',
};

export function studentField(field: string): string {
  return studentFields[field] || '';
}

export function snakify(name: string) {
  return name.replace(/ /g, '_').toLowerCase();
}

export function generatePassword(length: number) {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';
  for (let i = 0; i <= length; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
}

export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_SUBDOMAIN,
  region: process.env.NEXT_PUBLIC_REGION,
  adminSecret: process.env.NEXT_PUBLIC_SECRET,
});

export const navbarLinks = (role: 'admin' | 'student' | 'club', id: string) => {
  const links = {
    admin: [
      {
        title: 'Clubs',
        link: '/clubs',
      },
    ],
    student: [],
    club: [
      {
        title: 'Profile',
        link: `/clubs/${id}`,
      },
    ],
  };
  return links[role];
};
