import { Match } from '@/app/lib/definitions';
import TableTitle from '../table-title';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default async function MatchesTable({
  matches,
  leagueId,
}: {
  matches: Match[];
  leagueId: string;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          <div className="py-2">
            <TableTitle title="Partidos"></TableTitle>
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Pareja Local
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Pareja Visitante
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Sets
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Ganador
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {matches.map((match) => (
                <tr
                  key={match.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p>{match.teamLocal.drive.name}</p>
                    <p>{match.teamLocal.reverse.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p>{match.teamVisitor.drive.name}</p>
                    <p>{match.teamVisitor.reverse.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p>{match.date.toLocaleString()}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {match.results.map((result, i) => {
                      const setResult = `${result.localScore} - ${result.visitorScore}`;
                      const tieBRes = `${result.localTieBreak} - ${result.visitorTieBreak}`;
                      return (
                        <div key={`${match.id}-${i}-${setResult}`}>
                          <p>{`${setResult}`}</p>
                          {result.localTieBreak > 0 ? (
                            <p>`${tieBRes}`</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {match.finished ? (
                      <p>{match.localWins ? `Local` : `Visitante`}</p>
                    ) : (
                      <Link
                        href={`/dashboard/leagues/${leagueId}/matches/${match.id}/resolve`}
                        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                      >
                        <span>Resolve</span>{' '}
                        <ArrowRightIcon className="w-5 md:w-6" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="py-3 ">
            <Link
              href={`/dashboard/leagues/${leagueId}/matches/confirm`}
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              Confirmar Partidos Pendientes
              <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
