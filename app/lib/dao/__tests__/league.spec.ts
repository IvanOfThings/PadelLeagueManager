import { describe, expect, test } from 'vitest';
import { mapParticipants, updateParticipantScore } from '../lueague';
import { Match, Participates, Team, User } from '@prisma/client';
import { uuidV4 } from 'data-structure-typed';

const getMockDbUser = (id: string): User => {
  return {
    id: `${id}`,
    email: `email${id}@lll.com`,
    name: `name${id}`,
    password: `password${id}`,
    regularLoginActive: false,
  };
};

const getMockDbParticipates = (id: string, guest = false): Participates => {
  return {
    participantId: `${id}`,
    leagueId: `leagueId${id}`,
    playedMatches: 0,
    winMatches: 0,
    points: 0,
    guest,
  };
};

const getMockDbTeam = ({
  id,
  driveId,
  reverseId,
}: {
  id: string;
  driveId: string;
  reverseId: string;
}): Team => {
  return {
    id: `${id}`,
    driveId: `${driveId}`,
    reversId: `${reverseId}`,
  };
};

const getMockUsersAntParticipants = (
  ids: string[],
): { participants: Participates[]; users: User[] } => {
  const participants: Participates[] = ids.map((id) =>
    getMockDbParticipates(id),
  );

  const users: User[] = ids.map((id) => getMockDbUser(id));

  return { users, participants };
};

const getMockTeams = (
  ids: string[],
): { participants: Participates[]; users: User[]; teams: Team[] } => {
  const { users, participants } = getMockUsersAntParticipants(ids);
  const teams: Team[] = ids.reduce((acc, curr, index) => {
    if ((index + 1) % 2 === 0) {
      acc.push(
        getMockDbTeam({
          id: `${Math.ceil(index + 1 / 2)}`,
          driveId: ids[index - 1],
          reverseId: ids[index],
        }),
      );
    }
    return acc;
  }, [] as Team[]);

  return { users, participants, teams };
};

const getMockDbMatch = ({
  leagueId,
  localId,
  visitorId,
  confirmed,
  official,
  localWins,
}: {
  leagueId: string;
  localId: string;
  visitorId: string;
  confirmed: boolean;
  official: boolean;
  localWins: boolean;
}): Match => {
  return {
    id: `${uuidV4()}`,
    leagueId: `${leagueId}`,
    localId: `${localId}`,
    visitorId: `${visitorId}`,
    date: new Date(),
    localWins,
    finished: true,
    confirmed,
    round: 1,
    official,
  };
};

describe('Testing league dao functions', () => {
  test('Mapping participant', () => {
    // Arrange
    const { users, participants } = getMockUsersAntParticipants([
      '1',
      '2',
      '3',
      '4',
    ]);

    // Act

    const mappedParticipants = mapParticipants({ participants, users });

    //Assert
    expect(mappedParticipants['1']).toEqual({
      leagueId: 'leagueId1',
      score: {
        playedMatches: 0,
        winMatches: 0,
        points: 0,
      },
      user: {
        id: '1',
        email: 'email1@lll.com',
        name: 'name1',
      },
    });
  });

  test('Calculating scores', () => {
    // Arrange
    const { users, participants, teams } = getMockTeams(['1', '2', '3', '4']);

    const mappedParticipants = mapParticipants({ participants, users });

    const matches = [
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
    ];

    // Act

    const participantScores = updateParticipantScore(
      mappedParticipants,
      matches,
      teams,
    );

    //Assert
    expect(participantScores['1']).toEqual({
      user: {
        id: '1',
        email: 'email1@lll.com',
        name: 'name1',
      },
      leagueId: 'leagueId1',
      score: {
        playedMatches: 1,
        playedOfficialMatches: 1,
        points: 1,
        winMatches: 1,
        winOfficialMatches: 1,
      },
    });

    expect(participantScores['2']).toEqual({
      user: {
        id: '2',
        email: 'email2@lll.com',
        name: 'name2',
      },
      leagueId: 'leagueId2',
      score: {
        playedMatches: 1,
        playedOfficialMatches: 1,
        points: 1,
        winMatches: 1,
        winOfficialMatches: 1,
      },
    });

    expect(participantScores['3']).toEqual({
      user: {
        id: '3',
        email: 'email3@lll.com',
        name: 'name3',
      },
      leagueId: 'leagueId3',
      score: {
        playedMatches: 1,
        playedOfficialMatches: 1,
        points: 0,
        winMatches: 0,
        winOfficialMatches: 0,
      },
    });

    expect(participantScores['4']).toEqual({
      user: {
        id: '4',
        email: 'email4@lll.com',
        name: 'name4',
      },
      leagueId: 'leagueId4',
      score: {
        playedMatches: 1,
        playedOfficialMatches: 1,
        points: 0,
        winMatches: 0,
        winOfficialMatches: 0,
      },
    });
  });

  test('Calculating scores when played 2 matches', () => {
    // Arrange
    const { users, participants, teams } = getMockTeams(['1', '2', '3', '4']);

    const mappedParticipants = mapParticipants({ participants, users });

    const matches = [
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
    ];

    // Act

    const participantScores = updateParticipantScore(
      mappedParticipants,
      matches,
      teams,
    );

    //Assert
    expect(participantScores['1']).toEqual({
      user: {
        id: '1',
        email: 'email1@lll.com',
        name: 'name1',
      },
      leagueId: 'leagueId1',
      score: {
        playedMatches: 2,
        playedOfficialMatches: 2,
        points: 2,
        winMatches: 2,
        winOfficialMatches: 2,
      },
    });

    expect(participantScores['2']).toEqual({
      user: {
        id: '2',
        email: 'email2@lll.com',
        name: 'name2',
      },
      leagueId: 'leagueId2',
      score: {
        playedMatches: 2,
        playedOfficialMatches: 2,
        points: 2,
        winMatches: 2,
        winOfficialMatches: 2,
      },
    });

    expect(participantScores['3']).toEqual({
      user: {
        id: '3',
        email: 'email3@lll.com',
        name: 'name3',
      },
      leagueId: 'leagueId3',
      score: {
        playedMatches: 2,
        playedOfficialMatches: 2,
        points: 0,
        winMatches: 0,
        winOfficialMatches: 0,
      },
    });

    expect(participantScores['4']).toEqual({
      user: {
        id: '4',
        email: 'email4@lll.com',
        name: 'name4',
      },
      leagueId: 'leagueId4',
      score: {
        playedMatches: 2,
        playedOfficialMatches: 2,
        points: 0,
        winMatches: 0,
        winOfficialMatches: 0,
      },
    });
  });

  test('Calculating scores when played 3 matches', () => {
    // Arrange
    const { users, participants, teams } = getMockTeams(['1', '2', '3', '4']);

    const mappedParticipants = mapParticipants({ participants, users });

    const matches = [
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
    ];

    // Act

    const participantScores = updateParticipantScore(
      mappedParticipants,
      matches,
      teams,
    );

    //Assert
    expect(participantScores['1']).toEqual({
      user: {
        id: '1',
        email: 'email1@lll.com',
        name: 'name1',
      },
      leagueId: 'leagueId1',
      score: {
        playedMatches: 3,
        playedOfficialMatches: 3,
        winOfficialMatches: 3,
        points: 2,
        winMatches: 3,
      },
    });

    expect(participantScores['2']).toEqual({
      user: {
        id: '2',
        email: 'email2@lll.com',
        name: 'name2',
      },
      leagueId: 'leagueId2',
      score: {
        playedMatches: 3,
        playedOfficialMatches: 3,
        points: 2,
        winMatches: 3,
        winOfficialMatches: 3,
      },
    });

    expect(participantScores['3']).toEqual({
      user: {
        id: '3',
        email: 'email3@lll.com',
        name: 'name3',
      },
      leagueId: 'leagueId3',
      score: {
        playedMatches: 3,
        playedOfficialMatches: 3,
        points: 0,
        winMatches: 0,
        winOfficialMatches: 0,
      },
    });

    expect(participantScores['4']).toEqual({
      user: {
        id: '4',
        email: 'email4@lll.com',
        name: 'name4',
      },
      leagueId: 'leagueId4',
      score: {
        playedMatches: 3,
        playedOfficialMatches: 3,
        points: 0,
        winMatches: 0,
        winOfficialMatches: 0,
      },
    });
  });

  test('Calculating scores when played 2 matches, 1 no official', () => {
    // Arrange
    const { users, participants, teams } = getMockTeams(['1', '2', '3', '4']);

    const mappedParticipants = mapParticipants({ participants, users });

    const matches = [
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: true,
      }),
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: false,
        localWins: true,
      }),
    ];

    // Act

    const participantScores = updateParticipantScore(
      mappedParticipants,
      matches,
      teams,
    );

    //Assert
    expect(participantScores['1']).toMatchObject(
      expect.objectContaining({
        user: {
          id: '1',
          email: 'email1@lll.com',
          name: 'name1',
        },
        leagueId: 'leagueId1',
        score: {
          playedMatches: 2,
          playedOfficialMatches: 1,
          points: 1,
          winMatches: 2,
          winOfficialMatches: 1,
        },
      }),
    );
  });
  test('Calculating scores when played 2 matches, 1 no official 1 loosen', () => {
    // Arrange
    const { users, participants, teams } = getMockTeams(['1', '2', '3', '4']);

    const mappedParticipants = mapParticipants({ participants, users });

    const matches = [
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: true,
        localWins: false,
      }),
      getMockDbMatch({
        leagueId: '1',
        localId: teams[0].id,
        visitorId: teams[1].id,
        confirmed: true,
        official: false,
        localWins: true,
      }),
    ];

    // Act

    const participantScores = updateParticipantScore(
      mappedParticipants,
      matches,
      teams,
    );

    //Assert
    expect(participantScores['1']).toMatchObject(
      expect.objectContaining({
        user: {
          id: '1',
          email: 'email1@lll.com',
          name: 'name1',
        },
        leagueId: 'leagueId1',
        score: {
          playedMatches: 2,
          playedOfficialMatches: 1,
          points: 0,
          winMatches: 1,
          winOfficialMatches: 0,
        },
      }),
    );
  });
});
