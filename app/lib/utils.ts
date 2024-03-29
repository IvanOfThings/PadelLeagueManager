import { LeagueParticipant, Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

/*
export const generateMatchingRandom = (players: User[]) => {
  const shuffledPlayers = shuffle(players);

  return shuffledPlayers;
};*/

/*
export const getSubelementCacheKey = (players: User[], index: number) => {

  const key = players.map((player, index) => player.id).join('-');
  return `${key}-iter-${index}`;
};
*/

export const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export function sortParticipants(
  participants: Array<LeagueParticipant>,
): LeagueParticipant[] {
  const sortedParticipants = Object.values(participants).sort(
    (a: LeagueParticipant, b: LeagueParticipant) => {
      if (a.score.points > b.score.points) {
        return -1;
      } else if (a.score.points < b.score.points) {
        return 1;
      }
      if (
        a.score.playedMatches < b.score.playedMatches &&
        a.score.playedMatches > 0 &&
        b.score.playedMatches > 0
      ) {
        return -1;
      }
      if (b.score.playedMatches <= 0) {
        return -1;
      }
      return 1;
    },
  );
  return sortedParticipants;
}
