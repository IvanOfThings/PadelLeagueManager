'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { User } from '../../definitions';
import { UpdateScores } from '../../dao/lueague';

const AddParticipants = z.object({
  action: z.enum(['confirm', 'discard']),
});

export const addParticipants = async (
  leagueId: string,
  users: User[],
  formData: FormData,
) => {
  //try {
  const { action } = AddParticipants.parse({
    action: formData.get('action'),
  });
  if (action === 'confirm') {
    /*
      await addResults(match, [
        {
          id: v4(),
          matchId: match.id,
          visitorScore: set1Visitor,
          localScore: set1Local,
          setNumber: 1,
          localWins: set1Local > set1Visitor,
          localTieBreak: 0,
          visitorTieBreak: 0,
        },
      ]);

      await UpdateScores(match.leagueId);
    }
  } catch (e) {
    console.log('error', e);
    return { message: `${e}` };
  }*/
    revalidatePath(`/dashboard/leagues/${leagueId}`);
    redirect(`/dashboard/leagues/${leagueId}`);
  }
};

export const updateScore = async (leagueId: string) => {
  await UpdateScores(leagueId);
};
