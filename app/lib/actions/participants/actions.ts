'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { User } from '../../definitions';
import { UpdateScores } from '../../dao/lueague';
import prisma from '../../prisma';
import { unstable_noStore as noStore } from 'next/cache';

const createUserFormat = z.object({
  userName: z.string().refine((val) => val !== ''),
  email: z.string().refine((val) => val !== ''),
  action: z.enum(['confirm', 'discard']),
});

export const addUser = async (leagueId: string, formData: FormData) => {
  noStore();

  const { action, userName, email } = createUserFormat.parse({
    userName: formData.get('userName'),
    email: formData.get('email'),
    action: formData.get('action'),
  });
  if (action === 'confirm') {
    await createUser(leagueId, {
      email: email,
      name: userName,
    });
    revalidatePath(`/dashboard/leagues/${leagueId}/players`);
    redirect(`/dashboard/leagues/${leagueId}/players`);
  }
};

const AddParticipants = z.object({
  action: z.enum(['confirm', 'discard']),
});

export const addParticipants = async (
  leagueId: string,
  users: { user: User; guest: boolean }[],
  formData: FormData,
) => {
  noStore();

  const { action } = AddParticipants.parse({
    action: formData.get('action'),
  });
  if (action === 'confirm') {
    console.log('adding users', users);
    for (const user of users) {
      await addParticipant(leagueId, user);
    }
    revalidatePath(`/dashboard/leagues/${leagueId}/players`);
    redirect(`/dashboard/leagues/${leagueId}/players`);
  }
};

export const updateScore = async (leagueId: string) => {
  await UpdateScores(leagueId);
};

const addParticipant = async (
  leagueId: string,
  users: { user: User; guest: boolean },
) => {
  const user = await prisma.user.findFirst({
    where: { id: users.user.id },
  });
  const league = await prisma.league.findFirst({
    where: { id: leagueId },
  });
  if (user && league) {
    await prisma.participates.create({
      data: {
        leagueId: leagueId,
        participantId: users.user.id,
        playedMatches: 0,
        playedOfficialMatches: 0,
        winMatches: 0,
        winOfficialMatches: 0,
        points: 0,
        guest: users.guest,
      },
    });
  } else {
    console.error('No user or league found');
  }
};

const createUser = async (
  leagueId: string,
  user: {
    email: string;
    name: string;
  },
) => {
  const userExists = await prisma.user.findFirst({
    where: { email: user.email },
  });
  if (!userExists) {
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: '123456',
        regularLoginActive: false,
      },
    });
  } else {
    console.error('Email already exists');
  }
};
