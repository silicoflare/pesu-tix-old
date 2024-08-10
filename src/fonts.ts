import { Inter, Montserrat, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const montserrat = Montserrat({ subsets: [ 'latin' ] });
const space = Space_Grotesk({ subsets: [ 'latin' ] });

export const font = space.className;