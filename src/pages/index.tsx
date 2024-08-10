import { useEffect } from 'react';
import { font } from '~/fonts';
import Navbar from '~/pages/ui/Navbar';
import { api } from '~/utils/api';

export default function Home() {
  const data = api.club.sample.useQuery('foobar');
  const data2 = api.club.hello.useQuery({ text: 'world' });

  useEffect(() => {
    console.log(data.data?.text);
  });

  return (
    <div className={`window ${font}`}>
      <Navbar />
    </div>
  );
}
