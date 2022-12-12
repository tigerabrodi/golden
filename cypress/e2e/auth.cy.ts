import { createNewUser } from '../support/factory'
import { TestUser } from '../support/types'

const SIGNED_IN_SUCCESS_MESSAGE = 'Signed in successfully!'
const SIGNED_UP_SUCCESS_MESSAGE = 'Signed up successfully!'
const SOMETHING_WENT_WRONG_MESSAGE =
  'Something went wrong, please fill in the values again!'

const SIGNING_IN = 'signing in'
const SIGNING_UP = 'signing up'

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

  cy.findByRole('link', { name: 'Golden' }).should('be.visible')
  cy.findByRole('heading', {
    name: 'Golden let’s you take notes in Mardown effortlessy',
  }).should('be.visible')
  cy.findByRole('heading', {
    name: 'Meet the simplistic way of taking and organizing notes in Markdown.',
  }).should('be.visible')

  cy.findByRole('link', { name: 'Sign up' }).click()
  cy.findByRole('heading', { name: 'Sign up' }).should('be.visible')
  cy.findByText(
    'Welcome, setup your account and start organizing your notes!'
  ).should('be.visible')

  // Sign up
  cy.findByLabelText('Email').type(newUser.email)
  cy.findByLabelText('Password').type(newUser.password)
  cy.findByLabelText('Confirm Password').type(newUser.password)

  cy.findByRole('button', { name: 'Sign up' }).click()
  cy.findByRole('alert', { name: SIGNING_UP }).should('be.visible')

  // Toast Message
  cy.findByRole('status').within(() => {
    cy.findByText(SIGNED_UP_SUCCESS_MESSAGE).should('be.visible')
    cy.findByRole('button', { name: 'Close' }).click()
  })

  cy.location('pathname').should('eq', '/notebooks/all-notes')
  cy.findByRole('heading', { name: 'All notes' }).should('be.visible')
})
