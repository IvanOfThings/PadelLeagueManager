'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { fetchUsersParticipants } from './data';
import {
  ConfirmMatch,
  DeleteMatch,
  addResults,
  createMatches,
  fetchMatches,
} from './dao/matches';
import { Match } from './definitions';
import { v4 } from 'uuid';
import { UpdateScores } from './dao/lueague';
import { buildMatchesFromList } from './branch-and-bounding';
import { signIn } from '@/auth';

const ResolveMatch = z.object({
  set1Local: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0),
  set1Visitor: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0),
});

export const resolveMatch = async (match: Match, formData: FormData) => {
  try {
    const { set1Local, set1Visitor } = ResolveMatch.parse({
      set1Local: formData.get('set1Local'),
      set1Visitor: formData.get('set1Visitor'),
    });

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
  } catch (e) {
    console.log('error', e);
    return { message: `${e}` };
  }
  revalidatePath(`/dashboard/leagues/${match.leagueId}`);
  redirect(`/dashboard/leagues/${match.leagueId}`);
};

const ConfirmMatchFormSchema = z.object({
  localDrive: z.string().min(1),
  localReverse: z.string().min(1),
  visitorDrive: z.string().min(1),
  visitorReverse: z.string().min(1),
  action: z.enum(['confirm', 'discard']),
});

export const confirmMatch = async (
  match: Match,
  formData: FormData,
): Promise<{ message: string }> => {
  const { localDrive, localReverse, visitorDrive, visitorReverse, action } =
    ConfirmMatchFormSchema.parse({
      localDrive: formData.get('localDrive'),
      localReverse: formData.get('localReverse'),
      visitorDrive: formData.get('visitorDrive'),
      visitorReverse: formData.get('visitorReverse'),
      action: formData.get('action'),
    });
  if (action === 'discard') {
    await DeleteMatch({ matchId: match.id });
  } else {
    if (localDrive === localReverse || visitorDrive === visitorReverse) {
      return { message: 'No se puede repetir jugador en el mismo equipo' };
    }
    await ConfirmMatch(match, {
      local: { driveId: localDrive, reversId: localReverse },
      visitor: { driveId: visitorDrive, reversId: visitorReverse },
    });
  }

  revalidatePath(`/dashboard/leagues/${match.leagueId}/matches/confirm`);
  redirect(`/dashboard/leagues/${match.leagueId}/matches/confirm`);

  return { message: '' };
};

const MatchesFormSchema = z.object({
  playersIds: z
    .string()
    .transform((val) => {
      const r = val.split(',');
      const r2 = r.filter(
        (field, index) => r.indexOf(field) === index && field !== '',
      );
      return r2;
    })
    .refine(
      (val) => {
        return val.length > 0 && val.length % 4 === 0;
      },
      {
        message:
          'El numero de jugadores ha de ser multiplo de 4 y diferentes entre si',
      },
    ),
  playersCount: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val % 4 === 0, {
      message: 'El numero de jugadores ha de ser multiplo de 4',
    }),
  rounds: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0)
    .refine((val) => val < 4),

  matchDate: z.string().refine((val) => new Date(val).getTime()),
});

export async function generateMatches(leagueId: string, formData: FormData) {
  const { rounds, matchDate, playersCount, playersIds } =
    MatchesFormSchema.parse({
      rounds: formData.get('rounds'),
      matchDate: formData.get('matchDate'),
      playersCount: formData.get('playersCount'),
      playersIds: formData.get('playersIds'),
    });

  const players = await fetchUsersParticipants(playersIds, leagueId);

  const playedMatches = await fetchMatches(leagueId, true);

  const matches = buildMatchesFromList({
    players,
    leagueId,
    playersCount,
    rounds,
    date: new Date(matchDate),
    playedMatches,
  });
  await createMatches(matches);

  revalidatePath(`/dashboard/leagues/${leagueId}/matches/confirm`);
  redirect(`/dashboard/leagues/${leagueId}/matches/confirm`);
}
/*
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
*/

export async function authenticateWithGoogle() {
  try {
    await signIn('google');
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
