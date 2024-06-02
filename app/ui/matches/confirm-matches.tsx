'use client';
import { Match, User } from '@/app/lib/definitions';

import { ArrowDownTrayIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { confirmMatch } from '@/app/lib/actions/actions';
import TableTitle from '../table-title';
import { UserSelect } from '../components/user-selector';

export default function ConfirmMatchesForm({
  matches,
  leagueId,
}: {
  matches: Match[];
  leagueId: string;
}) {
  return (
    <div>
      {matches.map((match, index) => {
        const confirmMatchWithMatchData = confirmMatch.bind(null, match);

        return (
          <form key={`match-${index}`} action={confirmMatchWithMatchData}>
            <div key={`match-${index}`} className="mt-6 flow-root">
              <div className="inline-block min-w-full align-middle">
                <MatchCard match={match} matchIndex={index + 1} />
              </div>
            </div>
          </form>
        );
      })}
    </div>
  );
}

function MatchCard({
  match,
  matchIndex,
}: {
  match: Match;
  matchIndex: number;
}) {
  return (
    <div className="md:p-65  rounded-md bg-gray-50 p-4">
      <div className="mb-4">
        <div className="py-2">
          <TableTitle title={`Partido ${matchIndex}`}></TableTitle>
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
            value={match.round}
            placeholder="Introduzca el número de rondas"
            className="   w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
          />
        </span>
        <ArrowDownTrayIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      <div className="mb-4  grid grid-cols-4 gap-4">
        <span className=" inline-block px-5 py-1  ">
          <label htmlFor="amount" className=" text-sm font-medium">
            Oficial:
          </label>
        </span>
        <span className="col-span-3 inline-block pe-5">
          <input
            readOnly={true}
            id="official"
            name="official"
            type="boolean"
            value={`${match.official === true ? 'Si' : 'No'}`}
            placeholder="Introduzca el número de rondas"
            className="   w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
          />
        </span>
      </div>
      <div className="mb-4  grid grid-cols-4 gap-4">
        <span className="col-span-2 "></span>
        <Button name="action" value="discard" type="submit" color="red">
          Descartar
        </Button>
        <Button name="action" value="confirm" type="submit" color="blue">
          Confirmar
        </Button>
      </div>
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
          users={[team.drive, team.reverse]}
          userId={team.drive.id}
          inputName={`${inputPrefix}Drive`}
        />
      </div>
      <div className="mb-4 ">
        <UserSelect
          label="Revés"
          users={[team.drive, team.reverse]}
          userId={team.reverse.id}
          inputName={`${inputPrefix}Reverse`}
        />
      </div>
    </div>
  );
}
