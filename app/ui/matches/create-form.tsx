'use client';
import { User } from '@/app/lib/definitions';
import Link from 'next/link';
import { ArrowDownTrayIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { generateMatches } from '@/app/lib/actions';
import { SetStateAction, useState } from 'react';

import { TuiDatePicker } from 'nextjs-tui-date-picker';

export default function CreateMatchesForm({
  users,
  leagueId,
}: {
  users: User[];
  leagueId: string;
}) {
  const [playersIds, setPlayersIds] = useState(
    new Array<string>(12).fill('').map((_, index) => ''),
  );

  const handlePlayersChange = (index: number, value: string) => {
    const p = playersIds.map((id, idx) => (idx !== index ? id : value));
    setPlayersIds(p);
    console.log(playersIds);
  };

  const [selectedDate, setSelectedDay] = useState(new Date());

  const [selectedOption, setSelectedOption] = useState('4');
  const selectedOptionNumber = parseInt(selectedOption, 10);

  const handleOptionSelect = (value: SetStateAction<string>) => {
    setSelectedOption(value);
  };

  console.log(`leagueId: ${leagueId}`);
  const generateMatchesWithLeagueId = generateMatches.bind(null, leagueId);

  return (
    <form action={generateMatchesWithLeagueId}>
      <input type="hidden" name="playersIds" value={playersIds} />
      <input type="hidden" name="leagueId" value={leagueId} />
      <input
        type="hidden"
        name="matchDate"
        value={selectedDate.toISOString()}
      />
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-2xl font-bold">
            Configurar Confrontación
          </label>
        </div>
        <PlayerNumber onSelect={handleOptionSelect} />

        {/* Customer Name */}

        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Elija los jugadores
          </label>
        </div>
        {Array(selectedOptionNumber)
          .fill(0)
          .map((_, index) => (
            <div key={`user-${index}`} className="mb-4 ">
              <UserSelect
                users={users}
                index={index}
                handler={handlePlayersChange}
              />
            </div>
          ))}

        <TuiDatePicker
          handleChange={(e: any) => {
            console.log(e);
            setSelectedDay(new Date(e));
          }}
          date={selectedDate}
          inputWidth={140}
          fontSize={16}
        />

        {/* Rounds Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Elija Numero de rondas
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="rounds"
                name="rounds"
                type="number"
                step="1"
                min="1"
                max="3"
                defaultValue="3"
                placeholder="Introduzca el número de rondas"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <ArrowDownTrayIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href={`/dashboard/leagues/${leagueId}`}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button color="blue" type="submit">
          Generar
        </Button>
      </div>
    </form>
  );
}

function UserSelect({
  users,
  index,
  handler,
}: {
  users: User[];
  index: number;
  handler: (index: number, value: string) => void;
}) {
  const id = `customerId-${index}`;
  console.log(id);

  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
        defaultValue=""
        onChange={(event) => {
          handler(index, event.target.value);
        }}
      >
        <option value="" disabled>
          Seleccione un jugador
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
    </div>
  );
}

function PlayerNumber({ onSelect }: { onSelect: (value: any) => void }) {
  const [selectedOption, setSelectedOption] = useState('4');
  {
    /* Invoice Status */
  }
  const handleOptionChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setSelectedOption(value);
    onSelect(value);
  };

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium">
        Elija el número de jugadores
      </legend>
      <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
        <div className="flex gap-4">
          <div className="flex items-center">
            <input
              id="4"
              name="playersCount"
              type="radio"
              value="4"
              checked={selectedOption === '4'}
              onChange={handleOptionChange}
              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
            />
            <label
              htmlFor="4"
              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              4
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="8"
              name="playersCount"
              type="radio"
              value="8"
              checked={selectedOption === '8'}
              onChange={handleOptionChange}
              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
            />
            <label
              htmlFor="8"
              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              8
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="12"
              name="playersCount"
              type="radio"
              value="12"
              checked={selectedOption === '12'}
              onChange={handleOptionChange}
              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
            />
            <label
              htmlFor="12"
              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              12
            </label>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
