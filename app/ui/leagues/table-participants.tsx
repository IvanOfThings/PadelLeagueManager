import { fetchLeagueAndParticipants, fetchLeagueById } from '@/app/lib/data';
import { LeagueParticipant } from '@/app/lib/definitions';
import TableTitle from '../table-title';
import { Button } from '../button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function ParticipantsTable({
  participants,
  leagueId,
}: {
  participants: LeagueParticipant[];
  leagueId: string;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          <div className="py-2">
            <TableTitle title="Ranking"></TableTitle>
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Player
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Win Matches
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Played Matches
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {participants.map((player) => (
                <tr
                  key={player.user.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {/*
                      <Image
                        src={invoice.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
              */}
                      <p>{player.user.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {player.score.winMatches}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {/*{formatCurrency(invoice.amount)}*/}
                    {player.score.playedMatches}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {player.score.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="py-3 ">
            <Link
              href={`/dashboard/leagues/${leagueId}/matches/create`}
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              Generar Confrontación
              <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
