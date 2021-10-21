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
import { job } from '../../fixtures/jobs'

describe('jobs', () => {

  beforeEach(() => {
    cy.login('admin')
  })

  afterEach(() => {
    cy.logout()
  })
  
  before(() => {
    cy.login()
    cy.visit('localhost:8080/jobs')
    cy.logout
  })

  it('should create job', () => {
    cy.get('header').contains('Add job').click()

    cy.contains('Job name').parent().type(job.name)
    cy.contains('Address').parent().type(job.address)
    // Wait for google maps autocomplete options
    cy.wait(1000)
    cy.contains('Address').parent().type('{downarrow}{enter}')

    cy.contains('Organizational manager').parent().type('{downarrow}{enter}')
    cy.contains('Contractor manager').parent().type('{downarrow}{enter}')

    cy.contains('Name').parent().type(job.consultantName)
    cy.contains('Phone number').parent().type(job.consultantPhone)
    cy.contains('Email').parent().type(job.consultantEmail)

    cy.get('.v-dialog--active button').contains('Create').click()
    cy.get('main').should('contain', job.name)
  })

  it('should edit job', () => {
    cy.get('main').contains(job.name).parent().parent().find('.v-list-item__action button').click()
    cy.get('.v-menu__content').contains('Edit').click()
    cy.get('.v-dialog--active').should('be.visible')
    cy.get('.v-dialog--active').contains('Job name').parent().type(' (edited)')
    cy.get('.v-dialog--active button').contains('Save').click()

    cy.get('main').should('contain', `${job.name} (edited)`)
  })

  it('should close job', () => {
    cy.get('main').contains(job.name).parent().parent().find('.v-list-item__action button').click({force: true})
    cy.get('.v-menu__content').contains('Close').click({force: true})
    cy.get('.v-dialog--active button').contains('Yes, close').click()

    cy.get('main').should('not.contain', `${job.name} (edited)`)
  })

})

// describe('auth', () => {

//   before(() => {
//     cy.visit('localhost:8080')
//   })

//   it('will load', () => {
//     cy.get('main').contains('The adaptive solution').should('be.visible')
//   })

//   it('should sign in', () => {
//     cy.get('main').contains('Sign in').click()

//     const email = 'alex+test1@worxstr.com'
//     const password = 'password'

//     cy.get('input[type=email]')
//       .type(email)
//       .should('have.value', email)
      
//     cy.get('input[type=password]')
//     .type(password)
//     .should('have.value', password)

//     cy.get('main').contains('button', 'Sign in').click()
//   })

//   it('should sign out', () => {
//     cy.contains('Sign out').click()
//   })

// })