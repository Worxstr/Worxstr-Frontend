/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

import * as users from "../fixtures/auth"
import { localUrl, serverUrl } from '../fixtures/app'

// -- This is a parent command --
Cypress.Commands.add('login', (userRole) => {
  
  // TODO: Cypress is clearing the localStorage in the middle of the tests.
  cy.request({
    method: 'POST',
    url: `${serverUrl}/auth/login`,
    qs: {
      include_auth_token: true,
    },
    body: {
      ...users[userRole],
    },
  }).then((response) => {
    console.log(response)
    const token = response.body.response.user.authentication_token
    localStorage.setItem('cap_sec_authToken', btoa(token))

    cy.request('GET', `${serverUrl}/users/me`).then((response) => {
      localStorage.setItem('me', JSON.stringify(response.body.authenticated_user))
    })
  })
})

Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'POST',
    url: `${serverUrl}/auth/logout`,
  }).then(() => {
    localStorage.removeItem('me')
    localStorage.removeItem('cap_sec_authToken')
  })
})

function getContainer(insideDialog) {
  return cy.get(insideDialog ? '.v-dialog--active' : 'main')
}

// Commands for user inputs
Cypress.Commands.add('textField', (name, input, insideDialog = false) => {
  cy.get(`[data-cy=${name}]`).type(input)
})

Cypress.Commands.add('selectField', (name, index, multiple = false, insideDialog = false) => {
  const arrowPresses = Array(index + (multiple ? 2 : 1)).fill('{downarrow}')
  const keySequence = ` ${arrowPresses.join('')}{enter}`
  
  cy.get(`[data-cy=${name}]`).parent().type(keySequence)
})

Cypress.Commands.add('button', (name, insideDialog = false) => {
  return getContainer(insideDialog).get(`[data-cy=${name}]`)
})

Cypress.Commands.add('listMenuButton', (listItemText, buttonText) => {
  cy.get('main').contains(listItemText).parent().parent().find('.v-list-item__action button').click({force: true})
  cy.get('.v-menu__content').contains(buttonText).click()
})


// Commands for job functions

Cypress.Commands.add('createJob', (job) => {
  cy.textField('job-name', job.name, true)
  cy.textField('job-address', job.address, true)

  // Wait for google maps autocomplete options
  cy.wait(1000)
  cy.contains('Address').parent().type('{downarrow}{enter}')

  // cy.contains('Organizational manager').parent().type('{downarrow}{enter}')
  cy.selectField('job-org-manager', 0, false, true)
  cy.selectField('job-contractor-manager', 0, false, true)

  cy.textField('job-consultant-name', job.consultantName, true)
  cy.textField('job-consultant-phone', job.consultantPhone, true)
  cy.textField('job-consultant-email', job.consultantEmail, true)

  cy.button('save-job-button', true).click()
})

Cypress.Commands.add('editJob', (job) => {
  cy.textField('job-name', ' (edited)', true)
  cy.button('save-job-button', true).click()
})

Cypress.Commands.add('closeJob', (job) => {
  cy.button('confirm-close-job-button', true).click()
})

Cypress.Commands.add('assignShift', (shiftLocation) => {
  cy.button('assign-shift-button').click()
  cy.wait(3000)
  cy.selectField('shift-contractors', 0, true, true)
  cy.textField('shift-site-location-0', shiftLocation, true)
  cy.button('create-shift-button', true).click()
})

Cypress.Commands.add('editShift', () => {
  cy.button('edit-shift-button').click()
  cy.textField('shift-site-location', ' (edited)', true)
  // TODO: Change start and end dates
  cy.button('save-shift-button', true).click()
})

Cypress.Commands.add('deleteShift', () => {
  cy.button('delete-shift-button').click()
  cy.button('confirm-delete-shift-button', true).click()
})


// Commands for payments functions

Cypress.Commands.add('transferFunds', (amount) => {
  const backspaces = Array(20).fill('{backspace}{del}').join('')
  cy.textField('transfer-amount', `${backspaces}${amount.toString()}`, true)
  cy.button('transfer-submit-button', true).click()
})