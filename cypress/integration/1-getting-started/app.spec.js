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
    cy.login()
    cy.visit('localhost:8080/jobs')
  })

  afterEach(() => {
    cy.logout()
  })
  
  // before(() => {
  //   cy.login()
  //   cy.visit('localhost:8080/jobs')
  // })

  // after(() => {
  //   cy.logout()
  // })

  it('should create job', () => {
    cy.get('header').contains('Add job').click()

    cy.textField('Job name', job.name)
    cy.textField('Address', job.address)

    // Wait for google maps autocomplete options
    cy.wait(1000)
    cy.contains('Address').parent().type('{downarrow}{enter}')

    // cy.contains('Organizational manager').parent().type('{downarrow}{enter}')
    cy.selectField('Organizational manager', 0)
    cy.selectField('Contractor manager', 0)

    cy.textField('Name', job.consultantName)
    cy.textField('Phone number', job.consultantPhone)
    cy.textField('Email', job.consultantEmail)

    cy.button('Create')

    cy.get('main').should('contain', job.name)
  })

  it('should edit job', () => {
    cy.listMenuButton(job.name, 'Edit')
    cy.textField('Job name', ' (edited)')
    cy.button('Save')

    cy.get('main').should('contain', `${job.name} (edited)`)
  })

  it('should close job', () => {
    cy.listMenuButton(job.name, 'Close')
    cy.button('Yes, close')
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