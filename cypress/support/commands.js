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

import { manager } from "../fixtures/auth"

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/auth/login',
    body: {
      ...manager
    },
  }).then((response) => {
    cy.request('GET', 'http://localhost:5000/users/me').then((response) => {
      localStorage.setItem('token', JSON.stringify(response.body.authenticated_user))
    })
  })
})

Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/auth/logout',
  }).then(() => {
    localStorage.removeItem('token')
  })
})

function getContainer(insideDialog) {
  return cy.get(insideDialog ? '.v-dialog--active' : 'main')
}

// Commands for user inputs
Cypress.Commands.add('textField', (name, input, insideDialog = false) => {
  cy.get(`[data-cy=${name}]`).type(input)
})

Cypress.Commands.add('selectField', (name, index, insideDialog = false) => {
  const arrowPresses = Array(index + 1).fill('{downarrow}')
  const keySequence = `${arrowPresses.join()}{enter}`
  
  cy.get(`[data-cy=${name}]`).parent().type(keySequence)
})

Cypress.Commands.add('button', (name, insideDialog = false) => {
  // Old selector: .v-dialog--active button
  getContainer(insideDialog).get(`[data-cy=${name}]`).click()
})

Cypress.Commands.add('listMenuButton', (listItemText, buttonText) => {
  cy.get('main').contains(listItemText).parent().parent().find('.v-list-item__action button').click({force: true})
  cy.get('.v-menu__content').contains(buttonText).click()
})



Cypress.Commands.add('createJob', (job) => {
  cy.button('add-job-button')

  cy.textField('job-name', job.name, true)
  cy.textField('job-address', job.address, true)

  // Wait for google maps autocomplete options
  cy.wait(1000)
  cy.contains('Address').parent().type('{downarrow}{enter}')

  // cy.contains('Organizational manager').parent().type('{downarrow}{enter}')
  cy.selectField('job-org-manager', 0, true)
  cy.selectField('job-contractor-manager', 0, true)

  cy.textField('job-consultant-name', job.consultantName, true)
  cy.textField('job-consultant-phone', job.consultantPhone, true)
  cy.textField('job-consultant-email', job.consultantEmail, true)

  cy.button('save-job-button', true)
})

Cypress.Commands.add('editJob', (job) => {
  cy.listMenuButton(job.name, 'Edit')
  cy.textField('job-name', ' (edited)', true)
  cy.button('save-job-button', true)
})

Cypress.Commands.add('closeJob', (job) => {
  cy.listMenuButton(job.name, 'Close')
  cy.button('close-job-button', true)
})

Cypress.Commands.add('assignShift', () => {
  cy.button('Assign shift')
  cy.wait(2000)
  cy.contains('Contractors').parent().click().type('{downarrow}{downarrow}{enter}{escape}')
})