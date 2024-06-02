'use client';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { addUser } from '@/app/lib/actions/participants/actions';

export default function CreateUser({ leagueId }: { leagueId: string }) {
  const addUserAction = addUser.bind(null, leagueId);

  return (
    <form action={addUserAction}>
      <div className="grid grid-cols-5 rounded-md bg-gray-50 p-4 md:p-6">
        <div className="col-span-5 mb-4">
          <label htmlFor="customer" className="mb-2 block text-2xl font-bold">
            Create User
          </label>
        </div>

        <div className="col-span-4 mb-4  grid grid-cols-4 ">
          <div className="  col-span-2 mt-2 rounded-md">
            <label htmlFor="amount" className="block  text-sm font-medium">
              User Name:
            </label>
          </div>
          <div className="  col-span-2 mt-2 rounded-md">
            <input
              id="userName"
              name="userName"
              type="string"
              placeholder="Introduzca el nombre del jugador"
              className="peer block w-full rounded-md border border-gray-200  pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
          <div className="relative  mt-2 rounded-md"></div>
        </div>
        <div className="col-span-4 mb-4  grid grid-cols-4 ">
          <div className="  col-span-2 mt-2 rounded-md">
            <label htmlFor="amount" className="block  text-sm font-medium">
              email:
            </label>
          </div>
          <div className="  col-span-2 mt-2 rounded-md">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Introduzca el email del jugador"
              className="peer block w-full rounded-md border border-gray-200  pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
          <div className="relative  mt-2 rounded-md"></div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href={`/dashboard/leagues/${leagueId}`}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button color="blue" type="submit" value="confirm" name="action">
          Generar
        </Button>
      </div>
    </form>
  );
}
