'use server';

import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  League,
  User,
  Revenue,
  LeagueParticipant,
  UserParticipant,
} from './definitions';
import { formatCurrency, rankParticipantsByMatches } from './utils';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from './prisma';
import { auth } from '@/auth';
import { fetchLeagueParticipants } from './dao/lueague';

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLeagueById(leagueId: string): Promise<League> {
  noStore();

  try {
    const league = await prisma.league.findFirstOrThrow({
      where: { id: leagueId },
    });

    return {
      ...league,
      participants: await prisma.participates.count({
        where: { leagueId: league.id },
      }),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLeaguesByUser(): Promise<League[]> {
  noStore();
  try {
    const session = await auth();
    const userMail = session?.user?.email;
    console.log('User Mail:', userMail);
    if (!userMail) {
      throw new Error('Failed to fetch Leagues for the user.');
    }
    console.log('Retrieving user');
    const user = await getUser(userMail);
    if (!user) {
      throw new Error('Failed to fetch Leagues for the user.');
    }
    const participates = await prisma.participates.findMany({
      where: { participantId: user.id },
    });

    const leagues = await prisma.league.findMany({
      where: { id: { in: participates.map((p) => p.leagueId) } },
    });

    const myLeagues = await Promise.all(
      leagues.map(async (league): Promise<League> => {
        return {
          ...league,
          participants: await prisma.participates.count({
            where: { leagueId: league.id },
          }),
        };
      }),
    );
    return myLeagues;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch Leagues for the user.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

/*
export async function fetchParticipants(leagueId: string): Promise<User[]> {
  noStore();
  try {
    const prisma = getPrismaInstance();
    const participants = await prisma.participates.findMany({
      where: { leagueId },
    });
    const participantsData = await prisma.user.findMany({
      where: { id: { in: participants.map((p) => p.participantId) } },
    });

    return participantsData.map(
      (p): User => ({
        id: p.id,
        name: p.name,
        email: p.email,
      }),
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}*/

export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / 10);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    console.log(invoice); // Invoice is an empty array []
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Failed to fetch user.');
    }
    return [user].map((u): User => {
      return { id: u.id, name: u.name, email: u.email };
    })[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchParticipants(leagueId: string) {
  return fetchLeagueParticipants(leagueId);
}

export async function fetchLeagueRaking(
  leagueId: string,
): Promise<{ league: League; sortedParticipants: LeagueParticipant[] }> {
  noStore();
  const league = await fetchLeagueById(leagueId);
  const participants = await fetchLeagueParticipants(leagueId, true);

  const sortedParticipants = rankParticipantsByMatches(
    Object.values(participants),
    true,
  );
  return { league, sortedParticipants };
}

export async function fetchLeagueAndParticipants(
  leagueId: string,
): Promise<{ league: League; sortedParticipants: LeagueParticipant[] }> {
  noStore();
  const league = await fetchLeagueById(leagueId);
  const participants = await fetchLeagueParticipants(leagueId);

  const sortedParticipants = rankParticipantsByMatches(
    Object.values(participants),
    false,
  );
  return { league, sortedParticipants };
}

export async function fetchPlayersByLeague(leagueId: string): Promise<User[]> {
  noStore();
  const participantIds = await prisma.participates.findMany({
    where: {
      leagueId: leagueId,
    },
  });
  return fetchUsers(participantIds.map((p) => p.participantId));
}

export async function fetchUsersParticipants(
  userIds: string[],
  leagueId: string,
): Promise<UserParticipant[]> {
  noStore();
  const players = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  const participants = await prisma.participates.findMany({
    where: {
      leagueId,
      participantId: {
        in: userIds,
      },
    },
  });
  if ((userIds.length > 0 && players.length) === 0) {
    throw new Error('Failed to fetch users');
  }
  const userParticipants = participants.reduce((acc, curr) => {
    const user = players.find((p) => p.id === curr.participantId);
    if (user) {
      acc.push({
        id: user.id,
        name: user.name,
        email: user.email,
        guest: curr.guest,
      });
    }
    return acc;
  }, new Array<UserParticipant>());
  return userParticipants;
}

export async function fetchUsers(userIds: string[]): Promise<User[]> {
  noStore();
  const players = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
  if ((userIds.length > 0 && players.length) === 0) {
    throw new Error('Failed to fetch users');
  }
  return players.map((player) => {
    return { id: player.id, name: player.name, email: player.email };
  });
}

export async function fetchUsersNotInLeague(leagueId: string): Promise<User[]> {
  noStore();
  const players = await prisma.user.findMany({});

  const participants = await prisma.participates.findMany({
    where: {
      leagueId: leagueId,
    },
  });
  const participantsIds = participants.map((p) => p.participantId);
  const nonParticipants = players.filter(
    (player) => !participantsIds.includes(player.id),
  );
  return nonParticipants.map((player) => {
    return { id: player.id, name: player.name, email: player.email };
  });
}
