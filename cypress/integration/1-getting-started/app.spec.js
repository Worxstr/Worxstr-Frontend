/* eslint-disable no-undef */
/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('auth', () => {

  before(() => {
    cy.visit('localhost:8080')
  })

  it('will load', () => {
    cy.get('main').contains('The adaptive solution').should('be.visible')
  })

  it('should sign in', () => {
    cy.get('main').contains('Sign in').click()

    const email = 'alex+test1@worxstr.com'
    const password = 'password'

    cy.get('input[type=email]')
      .type(email)
      .should('have.value', email)
      
    cy.get('input[type=password]')
    .type(password)
    .should('have.value', password)

    cy.get('main').contains('button', 'Sign in').click()
  })

  it('should sign out', () => {
    cy.contains('Sign out').click()
  })

})