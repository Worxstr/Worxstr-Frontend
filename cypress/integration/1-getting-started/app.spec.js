/* eslint-disable no-undef */
/// <reference types="cypress" />

import { job } from '../../fixtures/jobs'

describe('jobs', () => {

  beforeEach(() => {
    cy.login('manager')
    cy.visit('localhost:8080/jobs')
  })

  afterEach(() => {
    cy.logout()
  })
  
  it('should display and modify jobs', () => {
    // Create
    cy.button('add-job-button')
    cy.createJob(job)
    cy.get('main').should('contain', job.name)

    // Read
    cy.visit('localhost:8080/jobs')
    cy.get('main').should('contain', job.name)

    // Update
    cy.listMenuButton(job.name, 'Edit')
    cy.editJob(job)
    cy.get('main').should('contain', `${job.name} (edited)`)

    // Delete
    cy.listMenuButton(job.name, 'Close')
    cy.closeJob(job)
    cy.get('main').should('not.contain', `${job.name} (edited)`)
  })

  it('should perform job operations', () => {

    cy.button('add-job-button')
    cy.createJob(job)
    cy.get('main').should('contain', job.name)

    // Open job
    cy.contains(job.name).click()

    // Assign shift
    const shiftLocation = 'Cypress site location'
    cy.assignShift(shiftLocation)

    // TODO: Check shift is displayed on page

    // Edit shift
    cy.contains(shiftLocation).click()
    cy.editShift()

    // TODO: Check shift was updated

    // Delete shift
    cy.deleteShift()

    // TODO: Check shift was deleted

    // Edit job
    cy.button('edit-job-button')
    cy.editJob(job)

    // TODO: Check job was updated

    // Close job
    cy.button('close-job-button')
    cy.closeJob(job)

    // TODO: Check page was redirected to jobs page
  })

})

describe('payments', () => {
  
  beforeEach(() => {
    cy.login('manager')
    cy.visit('localhost:8080/payments')
  })

  afterEach(() => {
    cy.logout()
  })

  it('should add funds', () => {
    cy.wait(3000) // Wait for funding sources to load
    cy.button('add-funds-button')
    cy.transferFunds(100)
  })

  it('should transfer funds to bank', {
    defaultCommandTimeout: 20000
  }, () => {
    cy.wait(3000) // Wait for funding sources to load
    cy.button('transfer-to-bank-button')
    cy.transferFunds(1)
    cy.get('body').should('contain', 'Hang tight')
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