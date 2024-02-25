import { League, Match, Team, User, Set } from '@prisma/client';
import { uuidV4 } from 'data-structure-typed';

export const users: User[] = [
  {
    id: uuidV4(),
    name: 'Ivan',
    email: 'ivan@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Jose Miñana',
    email: 'jose@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Manolo',
    email: 'manolo@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Quique',
    email: 'quique@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Jolmanh',
    email: 'jolmanh@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Jimmy',
    email: 'jimmy@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Alberto',
    email: 'alberto@nextmail.com',
    password: '123456',
  },
  {
    id: uuidV4(),
    name: 'Victor',
    email: 'victor@nextmail.com',
    password: '123456',
  },
];

export const teams: Team[] = [];

export const leagues: League[] = [
  {
    id: uuidV4(),
    name: 'Liga Test',
    adminId: users[0].id,
  },
];

export const matches: Match[] = [];
