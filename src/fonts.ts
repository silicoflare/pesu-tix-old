import { Inter, Montserrat } from 'next/font/google';

const intr = Inter({ subsets: ['latin'] });
const mont = Montserrat({ subsets: [ 'latin' ] });

export const inter = intr.className;
export const montserrat = mont.className;