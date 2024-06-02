import { LeagueParticipant } from '../definitions';
import { expect, test, describe } from 'vitest';
import { sortParticipants } from '../utils';

const getParticipantsMock = (
  id: string,
  winMatches: number,
  playedMatches: number,
): LeagueParticipant => {
  return {
    user: {
      id: id,
      name: id,
      email: id,
    },
    leagueId: 'league1',
    score: {
      playedMatches: playedMatches,
      playedOfficialMatches: playedMatches,
      winMatches: winMatches,
      winOfficialMatches: winMatches,
      points: winMatches,
    },
  };
};

describe('Testing Sorting Users', () => {
  test.each([
    [
      'Only One Item',
      [getParticipantsMock('1', 1, 1)],
      [getParticipantsMock('1', 1, 1)],
    ],
    [
      'Happy Path',
      [getParticipantsMock('1', 1, 1), getParticipantsMock('2', 2, 2)],
      [getParticipantsMock('2', 2, 2), getParticipantsMock('1', 1, 1)],
    ],
    [
      'In case of draw less matches goes first',
      [
        getParticipantsMock('1', 1, 1),
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('3', 2, 3),
      ],
      [
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('1', 1, 1),
      ],
    ],
    [
      'In case of draw less matches goes first no matters initial order',
      [
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('1', 1, 1),
      ],
      [
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('1', 1, 1),
      ],
    ],
    [
      'In case of draw on 0, the one that have play goes first',
      [
        getParticipantsMock('0', 0, 0),
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('0', 0, 1),
        getParticipantsMock('1', 1, 1),
      ],
      [
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('1', 1, 1),
        getParticipantsMock('0', 0, 1),
        getParticipantsMock('0', 0, 0),
      ],
    ],
    [
      'In case of draw on 0, the one that have play goes first no matters the initial order',
      [
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('0', 0, 1),
        getParticipantsMock('0', 0, 0),
        getParticipantsMock('1', 1, 1),
      ],
      [
        getParticipantsMock('2', 2, 2),
        getParticipantsMock('3', 2, 3),
        getParticipantsMock('1', 1, 1),
        getParticipantsMock('0', 0, 1),
        getParticipantsMock('0', 0, 0),
      ],
    ],
  ])('%s', (title, list, sortedList) => {
    const sorted = sortParticipants(list);
    expect(sorted).toEqual(sortedList);
  });
});
