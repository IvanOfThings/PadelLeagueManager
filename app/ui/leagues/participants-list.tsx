'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../button';
import { User } from '@/app/lib/definitions';
import { addParticipants } from '@/app/lib/actions/participants/actions';
import React from 'react';
import clsx from 'clsx';
import { AddingNewUser } from '../components/user-selector-guest';

export function AddParticipantsForm({
  leagueId,
  noParticipants,
}: {
  leagueId: string;
  noParticipants: User[];
}) {
  const [noParticipantsSt, setNoParticipantsSt] = React.useState([
    ...noParticipants,
  ]);
  const [participantsToAdd, setParticipantsToAdd] = React.useState(
    new Array<{ user: User; guest: boolean }>(),
  );
  const [newParticipant, setNewParticipant] = React.useState<{
    user: User;
    guest: boolean;
  } | null>(
    noParticipantsSt.length > 0
      ? { user: noParticipantsSt[0], guest: false }
      : null,
  );
  const resolveMatchWithMatch = addParticipants.bind(
    null,
    leagueId,
    participantsToAdd,
  );
  const [active, setActive] = React.useState<boolean>(
    noParticipantsSt.length > 0,
  );

  const clear = (): void => {
    setNoParticipantsSt([...noParticipants]);
    setParticipantsToAdd([]);
    setNewParticipant(
      noParticipants.length > 0
        ? { user: noParticipants[0], guest: false }
        : null,
    );
    setActive(noParticipants.length > 0);
  };

  const handleAddUser = (): void => {
    const part =
      newParticipant === null && noParticipantsSt.length > 0
        ? { user: noParticipantsSt[0], guest: false }
        : newParticipant;
    if (part !== null) {
      setParticipantsToAdd([...participantsToAdd, part]);

      const newNoParticipants = noParticipantsSt.filter(
        (user) => user.id !== part.user.id,
      );
      setNoParticipantsSt(newNoParticipants);
      setActive(newNoParticipants.length > 0);
      setNewParticipant(null);
    }
  };
  return (
    <div className="grounded-lg grid flex-1 grid-cols-5 bg-white px-6 pb-4 pt-8">
      <div className="ap-4 col-span-5 mb-4">
        <h2>Añadir Participantes</h2>
      </div>

      <span className="col-span-4 inline-block pe-5">
        <AddingNewUser
          label="Jugador"
          users={noParticipantsSt}
          userId={newParticipant !== null ? newParticipant.user.id : ''}
          guest={newParticipant?.guest ?? false}
          inputName={`hole`}
          onChangeUser={(participant: User) => {
            setNewParticipant({
              user: participant,
              guest: newParticipant?.guest ?? false,
            });
          }}
          onChangeGuest={(guest: boolean) => {
            if (newParticipant || noParticipantsSt.length > 0) {
              setNewParticipant({
                user: newParticipant
                  ? newParticipant.user
                  : noParticipantsSt[0],
                guest: guest,
              });
            }
          }}
        />
      </span>
      <span className="col-span-1 inline-block pe-5">
        <Button
          disabled={!active}
          onClick={(e) => handleAddUser()}
          className={clsx(
            'flex h-[36px] grow items-center justify-center gap-2 rounded-md border bg-gray-50 p-3 text-sm font-medium  md:flex-none md:justify-start md:p-2 md:px-3',
            {
              'hover:bg-sky-100 hover:text-blue-600': active,
            },
          )}
        >
          <PlusIcon className="w-6" />
          <p className="hidden md:block">Añadir</p>
        </Button>
      </span>
      <div className="col-span-5 mb-4  gap-4">
        <ParticipantsList users={participantsToAdd} />
      </div>
      <div className="col-span-5 mb-4  gap-4">
        <form action={resolveMatchWithMatch} onSubmit={(event) => clear()}>
          <div className="mb-4  grid grid-cols-4 gap-4">
            <span className="col-span-1 "></span>
            <Button
              name="action"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              onClick={() => {
                clear();
              }}
              value="discard"
              type="submit"
            >
              {' '}
              Limpiar{' '}
            </Button>
            <Button name="action" type="submit" value="confirm" color="blue">
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ParticipantsList = ({
  users,
}: {
  users: { user: User; guest: boolean }[];
}) => {
  return users.map((user, i) => (
    <div className="mb-4  grid grid-cols-5 gap-4" key={`${user.user.id}`}>
      <span className="col-span-4 inline-block pe-5">
        <AddingNewUser
          label={`Jugador ${i}`}
          users={users.map((user) => user.user)}
          userId={user.user.id}
          guest={user.guest}
          inputName={`hole`}
        />
      </span>
    </div>
  ));
};
