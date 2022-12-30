import { faker } from '@faker-js/faker'

export type TestUser = {
  email: string
  password: string
}

type TestNote = {
  name: string
  content: string
}

type TestNotebook = {
  name: string
}

export function createNewUser(): TestUser {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}

export function createNewNote(): TestNote {
  return {
    name: faker.random.words(2),
    content: faker.random.words(10),
  }
}

export function createNewNotebook(): TestNotebook {
  return {
    name: faker.random.words(2),
  }
}
