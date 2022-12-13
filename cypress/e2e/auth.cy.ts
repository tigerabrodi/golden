import { createNewUser } from '../support/factory'
import { TestUser } from '../support/types'

const SIGNED_IN_SUCCESS_MESSAGE = 'Successfully logged in!'
const SIGNED_UP_SUCCESS_MESSAGE = 'Successfully signed up!'
const GOLDEN_HOME_HEADING = 'Golden let’s you take notes in Mardown effortlessy'

const existingUser: TestUser = {
  email: 'tiger@gmail.com',
  password: 'tiger123',
} as const

const newUser = createNewUser()

beforeEach(() => {
  cy.clearCookies()
})

it('Should be able to validate confirm password', () => {
  cy.visit('/')

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('be.visible')

  cy.findByRole('link', { name: 'Sign up' }).click()
  cy.findByRole('heading', { name: 'Sign up' }).should('be.visible')

  // Sign up
  cy.findByLabelText('Email').type(newUser.email)
  cy.findByLabelText('Password').type(newUser.password)
  cy.findByLabelText('Confirm password').type('ldksalksaldkaldadldsal')

  cy.findByRole('button', { name: 'Sign up' }).click()

  // Toast Message
  cy.findByRole('status')
    .findByText("Passwords don't match.")
    .should('be.visible')
})

it('Should not be able to sign up with existing user.', () => {
  cy.visit('/')

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('be.visible')

  cy.findByRole('link', { name: 'Sign up' }).click()
  cy.findByRole('heading', { name: 'Sign up' }).should('be.visible')

  // Sign up
  cy.findByLabelText('Email').type(existingUser.email)
  cy.findByLabelText('Password').type(existingUser.password)
  cy.findByLabelText('Confirm password').type(existingUser.password)

  cy.findByRole('button', { name: 'Sign up' }).click()

  // Toast Message
  cy.findByRole('status')
    .findByText('User with this email already exists.')
    .should('be.visible')
})

it('Should be able to sign up', () => {
  cy.visit('/')

  cy.findByRole('link', { name: 'Golden' }).should('be.visible')
  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
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
  cy.findByLabelText('Confirm password').type(newUser.password)

  cy.findByRole('button', { name: 'Sign up' }).click()

  // Toast Message
  cy.findByRole('status').within(() => {
    cy.findByText(SIGNED_UP_SUCCESS_MESSAGE).should('be.visible')
    cy.findByRole('button', { name: 'Close' }).click()
  })

  cy.location('pathname').should('eq', '/notebooks/all-notes')
  cy.findByRole('heading', { name: 'All notes' }).should('be.visible')
})

it('Should be able to login.', () => {
  cy.visit('/')

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('be.visible')

  cy.findByRole('link', { name: 'Login' }).click()
  cy.findByRole('heading', { name: 'Login' }).should('be.visible')

  cy.findByLabelText('Email').type(existingUser.email)
  cy.findByLabelText('Password').type(existingUser.password)

  cy.findByRole('button', { name: 'Login' }).click()

  // Toast Message
  cy.findByRole('status')
    .findByText(SIGNED_IN_SUCCESS_MESSAGE)
    .should('be.visible')
})

it('Should not be able to login with wrong password.', () => {
  cy.visit('/')

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('be.visible')

  cy.findByRole('link', { name: 'Login' }).click()
  cy.findByRole('heading', { name: 'Login' }).should('be.visible')

  cy.findByLabelText('Email').type(existingUser.email)
  cy.findByLabelText('Password').type('kfnklsfnskdl')

  cy.findByRole('button', { name: 'Login' }).click()

  // Toast Message
  cy.findByRole('status')
    .findByText('Invalid email or password.')
    .should('be.visible')
})

it('Should be able to logout.', () => {
  cy.visit('/')

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('be.visible')

  cy.findByRole('button', { name: 'Logout' }).should('not.exist')

  cy.findByRole('link', { name: 'Login' }).click()
  cy.findByRole('heading', { name: 'Login' }).should('be.visible')

  cy.findByLabelText('Email').type(existingUser.email)
  cy.findByLabelText('Password').type(existingUser.password)

  cy.findByRole('button', { name: 'Login' }).click()

  // Toast Message
  cy.findByRole('status').within(() => {
    cy.findByText(SIGNED_IN_SUCCESS_MESSAGE).should('be.visible')
    cy.findByRole('button', { name: 'Close' }).click()
  })

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('not.exist')

  cy.findByRole('button', { name: 'Logout' }).click()

  cy.findByText('Successfully logged out.').should('be.visible')

  cy.findByRole('heading', {
    name: GOLDEN_HOME_HEADING,
  }).should('be.visible')
})
