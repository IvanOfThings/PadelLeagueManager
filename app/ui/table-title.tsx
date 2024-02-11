export default function TableTitle({ title }: { title: string }) {
  return (
    <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-20">
      <div className={`flex flex-row items-center leading-none text-white`}>
        <p className="text-[44px]">{`${title}`}</p>
      </div>
    </div>
  );
}
