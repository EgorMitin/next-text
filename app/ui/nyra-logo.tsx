import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function NyraLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <Image
        src="/nyra-Health.png"
        alt="Nyra Health Logo"
        width={120}
        height={120}
      />
    </div>
  );
}