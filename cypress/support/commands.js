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
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
