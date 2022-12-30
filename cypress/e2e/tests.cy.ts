import { createNewNote, createNewUser } from '../support/factory'

const SIGNED_UP_SUCCESS_MESSAGE = 'Successfully signed up!'
const GENERAL_NOTES = 'General notes'
const UNTITLED = 'Untitled'
const NOTE_NAME_LABEL = 'Note name'
const SAVING = 'Saving'
const SAVED = 'Saved'
const CREATE_NEW_NOTE_NAME = 'Create new note'
const VIEW_NOTE_NAME = 'View note'

beforeEach(() => {
  cy.clearCookies()
})

it('Simple user flow of creating a note', () => {
  const newUser = createNewUser()
  const newNote = createNewNote()

  cy.visit('/')

  cy.findByRole('link', { name: 'Sign up' }).click()

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

  // Page after sign up
  cy.findByRole('heading', { name: GENERAL_NOTES, level: 1 }).should(
    'be.visible'
  )
  cy.findByRole('heading', { name: 'No notes.', level: 2 }).should('be.visible')
  cy.findByRole('list')
    .findByRole('listitem')
    .findByRole('link', { name: GENERAL_NOTES })
    .should('be.visible')

  // Assert page after note creation
  cy.findByRole('button', { name: CREATE_NEW_NOTE_NAME }).click()
  cy.findByRole('link', { name: UNTITLED }).should('be.visible')
  cy.location('pathname').should('include', '/edit')

  cy.findByLabelText(NOTE_NAME_LABEL).should('have.value', UNTITLED)
  cy.findByLabelText(NOTE_NAME_LABEL).should('be.focused')

  cy.findByRole('link', { name: VIEW_NOTE_NAME }).should('be.visible')
  cy.findByRole('link', { name: 'Delete note' }).should('be.visible')
  cy.findByRole('status', { name: SAVED }).should('be.visible')

  // Change Title
  cy.findByLabelText(NOTE_NAME_LABEL).clear().type(newNote.name)
  cy.findByRole('status', { name: SAVING }).should('be.visible')
  cy.findByRole('link', { name: UNTITLED }).should('not.exist')
  cy.findByRole('link', { name: newNote.name }).should('be.visible')

  // Add content
  cy.findByLabelText('Markdown content').type(newNote.content)
  cy.findByRole('status', { name: SAVING }).should('be.visible')
  cy.findByRole('status', { name: SAVED }).should('be.visible')

  // View note
  cy.findByRole('link', { name: VIEW_NOTE_NAME }).click()
  cy.findByText(newNote.content).should('be.visible')
})

it('Delete note', () => {
  const newUser = createNewUser()

  cy.visit('/')

  cy.findByRole('link', { name: 'Sign up' }).click()

  // Sign up
  cy.findByLabelText('Email').type(newUser.email)
  cy.findByLabelText('Password').type(newUser.password)
  cy.findByLabelText('Confirm password').type(newUser.password)

  cy.findByRole('button', { name: 'Sign up' }).click()

  // Toast Message
  cy.findByRole('status').within(() => {
    cy.findByRole('button', { name: 'Close' }).click()
  })

  // Create note
  cy.findByRole('heading', { name: GENERAL_NOTES }).should('be.visible')
  cy.findByRole('button', { name: CREATE_NEW_NOTE_NAME }).click()

  cy.findByRole('link', { name: VIEW_NOTE_NAME }).click()
  cy.location('pathname').should('include', '/view')
  cy.findByRole('heading', { name: UNTITLED }).should('be.visible')

  // Delete note from view
  cy.findByRole('link', { name: 'Delete note' }).click()

  cy.findByRole('dialog', {
    name: 'Are you sure you want to delete your note?',
  }).within(() => {
    cy.findByRole('heading', {
      name: 'Are you sure you want to delete your note?',
    }).should('be.visible')

    cy.findByRole('button', { name: 'Delete' }).click()
  })

  cy.findByRole('status').within(() => {
    cy.findByText('Successfully deleted note!').should('be.visible')
    cy.findByRole('button', { name: 'Close' }).click()
  })

  // Create new note and delete inside edit page
  cy.findByRole('link', { name: UNTITLED }).should('not.exist')
  cy.findByRole('button', { name: CREATE_NEW_NOTE_NAME }).click()
  cy.findByRole('link', { name: UNTITLED }).should('be.visible').click()
  cy.findByRole('link', { name: 'Edit note' }).click()

  cy.findByLabelText(NOTE_NAME_LABEL).should('be.visible')

  cy.findByRole('link', { name: 'Delete note' }).should('be.visible').click()

  cy.findByRole('dialog', {
    name: 'Are you sure you want to delete your note?',
  }).within(() => {
    cy.findByRole('heading', {
      name: 'Are you sure you want to delete your note?',
    }).should('be.visible')

    cy.findByRole('button', { name: 'Delete' }).click()
  })

  cy.findByRole('dialog').should('not.exist')

  cy.findByRole('status').within(() => {
    cy.findByText('Successfully deleted note!').should('be.visible')
    cy.findByRole('button', { name: 'Close' }).click()
  })
})
