import type { TestUser } from './types'

import { faker } from '@faker-js/faker'

export function createNewUser(): TestUser {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}
