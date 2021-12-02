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


// Commands for user inputs
Cypress.Commands.add('textField', (placeholderText, input) => {
  cy.contains(placeholderText).parent().type(input)
})

Cypress.Commands.add('selectField', (placeholderText, index) => {
  const arrowPresses = Array(index + 1).fill('{downarrow}')
  const keySequence = `${arrowPresses.join()}{enter}`
  cy.contains(placeholderText).parent().type(keySequence)
})

Cypress.Commands.add('button', (buttonText) => {
  // Old selector: .v-dialog--active button
  cy.get('button').contains(buttonText).click()
})

Cypress.Commands.add('listMenuButton', (listItemText, buttonText) => {
  cy.get('main').contains(listItemText).parent().parent().find('.v-list-item__action button').click({force: true})
  cy.get('.v-menu__content').contains(buttonText).click()
})
