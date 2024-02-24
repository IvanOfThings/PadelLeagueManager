import { TrophyIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function PLMLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <span className="ml-2">
        <TrophyIcon className="h-12 w-12 rotate-[15deg]" />
      </span>
      <span className="ml-5">
        <p className=" text-[44px]"> PLM</p>
      </span>
    </div>
  );
}
