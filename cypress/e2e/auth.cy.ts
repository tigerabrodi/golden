import { createNewUser } from '../support/factory'
import { TestUser } from '../support/types'

const SIGNED_IN_SUCCESS_MESSAGE = 'Signed in successfully!'
const SIGNED_UP_SUCCESS_MESSAGE = 'Signed up successfully!'
const SOMETHING_WENT_WRONG_MESSAGE =
  'Something went wrong, please fill in the values again!'

const SIGNING_IN = 'signing in'

const existingUser: TestUser = {
  email: 'tiger@gmail.com',
  password: 'tiger123',
} as const

const newUser = createNewUser()

beforeEach(() => {
  cy.clearCookies()
})

it('Should be able to sign up', () => {
  cy.visit('/')
})
