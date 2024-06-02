import { LeagueParticipant } from '@/app/lib/definitions';

export default async function ParticipantsTable({
  participants,
  official,
}: {
  participants: LeagueParticipant[];
  official: boolean;
}) {
  return (
    <table className=" min-w-full text-gray-900 md:table">
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
              {official
                ? player.score.winOfficialMatches
                : player.score.winMatches}
            </td>
            <td className="whitespace-nowrap px-3 py-3">
              {/*{formatCurrency(invoice.amount)}*/}
              {official
                ? player.score.playedOfficialMatches
                : player.score.playedMatches}
            </td>
            <td className="whitespace-nowrap px-3 py-3">
              {player.score.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
