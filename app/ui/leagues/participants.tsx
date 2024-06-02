import { LeagueParticipant } from '@/app/lib/definitions';
import TableTitle from '../table-title';
import ParticipantsTable from './table-players';
import { fetchUsersNotInLeague } from '@/app/lib/data';
import React from 'react';
import { AddParticipantsForm } from './participants-list';

export default async function Participants({
  participants,
  leagueId,
  isAdmin,
  title,
}: {
  participants: LeagueParticipant[];
  leagueId: string;
  isAdmin: boolean;
  title: string;
}) {
  const noParticipants = await fetchUsersNotInLeague(leagueId);
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          <div className="py-2">
            <TableTitle title={`${title}`}></TableTitle>
          </div>
          <ParticipantsTable participants={participants} official={false} />
          {isAdmin ? (
            <div className="py-3 ">
              <AddParticipantsForm
                leagueId={`${leagueId}`}
                noParticipants={noParticipants}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
