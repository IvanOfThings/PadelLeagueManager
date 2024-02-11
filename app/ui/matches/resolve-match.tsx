'use client';
import { Match, User } from '@/app/lib/definitions';

import { ArrowDownTrayIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { confirmMatch, resolveMatch } from '@/app/lib/actions';
import TableTitle from '../table-title';
import Link from 'next/link';

export default function ResolveMatch({
  match,
  leagueId,
}: {
  match: Match;
  leagueId: string;
}) {
  return (
    <div>
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <MatchCard match={match} leagueId={leagueId} />
        </div>
      </div>
    </div>
  );
}

function ResultsForm({ leagueId, match }: { leagueId: string; match: Match }) {
  const resolveMatchWithMatch = resolveMatch.bind(null, match);
  return (
    <form action={resolveMatchWithMatch}>
      <div className="mb-4  grid grid-cols-5 gap-4">
        <span className=" inline-block px-5 py-1  ">
          <label htmlFor="amount" className=" text-sm font-medium"></label>
        </span>
        <span className="col-span-2 inline-block px-5 py-1  ">
          <label htmlFor="amount" className=" text-sm font-medium">
            Local
          </label>
        </span>
        <span className="col-span-2 inline-block px-5 py-1  ">
          <label htmlFor="amount" className=" text-sm font-medium">
            Visitante
          </label>
        </span>
      </div>
      <div className="mb-4  grid grid-cols-5 gap-4">
        <span className=" inline-block px-5 py-1  ">
          <label htmlFor="amount" className=" text-sm font-medium">
            Set 1:
          </label>
        </span>
        <span className="col-span-2 inline-block pe-5">
          <input
            id="set1Local"
            name="set1Local"
            type="number"
            step="1"
            min="1"
            max="9"
            placeholder="Juegos ganados local"
            className="   w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
          />
        </span>
        <span className="col-span-2 inline-block pe-5">
          <input
            id="set1Visitor"
            name="set1Visitor"
            type="number"
            step="1"
            min="1"
            max="9"
            placeholder="Juegos ganados visitante"
            className="   w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
          />
        </span>
      </div>

      <div className="mb-4  grid grid-cols-4 gap-4">
        <span className="col-span-2 "></span>
        <Link
          href={`/dashboard/leagues/${leagueId}`}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          {' '}
          Cancelar{' '}
        </Link>
        <Button type="submit" color="blue">
          Confirmar
        </Button>
      </div>
    </form>
  );
}

function MatchCard({ match, leagueId }: { match: Match; leagueId: string }) {
  return (
    <div className="md:p-65  rounded-md bg-gray-50 p-4">
      <div className="mb-4">
        <div className="py-2">
          <TableTitle title="Resolver Partido"></TableTitle>
        </div>
      </div>

      <TeamPresentation
        label="Equipo Local"
        team={match.teamLocal}
        inputPrefix="local"
      />
      <TeamPresentation
        label="Equipo Visitante"
        team={match.teamVisitor}
        inputPrefix="visitor"
      />

      <div className="mb-4  grid grid-cols-4 gap-4">
        <span className=" inline-block px-5 py-1  ">
          <label htmlFor="Date" className=" inline-block text-sm font-medium">
            Fecha:
          </label>
        </span>
        <span className="col-span-3  inline-block pe-5">
          <input
            readOnly={true}
            id="date"
            name="date"
            type="text"
            defaultValue={match.date.toLocaleString()}
            className="peer  w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </span>
      </div>
      <div className="mb-4  grid grid-cols-4 gap-4">
        <span className=" inline-block px-5 py-1  ">
          <label htmlFor="amount" className=" text-sm font-medium">
            Ronda:
          </label>
        </span>
        <span className="col-span-3 inline-block pe-5">
          <input
            readOnly={true}
            id="rounds"
            name="rounds"
            type="number"
            step="1"
            min="1"
            max="3"
            defaultValue={match.round}
            placeholder="Introduzca el número de rondas"
            className="   w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
          />
        </span>
        <ArrowDownTrayIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      <ResultsForm match={match} leagueId={leagueId} />
    </div>
  );
}

function TeamPresentation({
  team,
  label,
  inputPrefix,
}: {
  team: {
    drive: User;
    reverse: User;
  };
  label: string;
  inputPrefix: string;
}) {
  return (
    <div className="relative">
      <div className="mb-4">
        <label htmlFor="customer" className=" block px-5 text-sm font-medium">
          {`${label}`}
        </label>
      </div>

      <div className="mb-2 ">
        <UserSelect
          label="Drive"
          user={team.drive}
          userId={team.drive.id}
          inputName={`${inputPrefix}Drive`}
        />
      </div>
      <div className="mb-4 ">
        <UserSelect
          label="Revés"
          user={team.reverse}
          userId={team.reverse.id}
          inputName={`${inputPrefix}Reverse`}
        />
      </div>
    </div>
  );
}

function UserSelect({
  user,
  userId,
  label,
  inputName,
}: {
  user: User;
  userId: string;
  label: string;
  inputName: string;
}) {
  return (
    <div className="relative">
      <div className="mb-2  grid grid-cols-4 gap-4">
        <span className=" inline-block px-8 py-3  ">
          <label htmlFor="customer" className=" block text-sm font-medium">
            {`${label}`}
          </label>
        </span>
        <span className=" col-span-3 inline-block px-5  py-1 ">
          <div className="relative">
            <input
              readOnly={true}
              id="player"
              name={`${inputName}`}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={`${user.name}`}
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </span>
      </div>
    </div>
  );
}
