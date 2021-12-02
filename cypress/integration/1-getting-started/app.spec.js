/* eslint-disable no-undef */
/// <reference types="cypress" />

import { job } from '../../fixtures/jobs'

describe('jobs', () => {

  beforeEach(() => {
    cy.login()
    cy.visit('localhost:8080/jobs')
  })

  afterEach(() => {
    cy.logout()
  })
  
  it('should create and display jobs', () => {
    // Create
    cy.createJob(job)
    cy.get('main').should('contain', job.name)

    // Read
    cy.visit('localhost:8080/jobs')
    cy.get('main').should('contain', job.name)

    // Update
    cy.editJob(job)
    cy.get('main').should('contain', `${job.name} (edited)`)

    // Delete
    cy.closeJob(job)
    cy.get('main').should('not.contain', `${job.name} (edited)`)
  })

  it('should assign shifts', () => {
    // Create
    // cy.createJob(job)
    cy.get('main').should('contain', job.name)

    // Open job
    cy.contains(job.name).click()

    // Assign shift
    cy.assignShift()


  })

})

// describe('job', () => {

//   before(() => {
//     cy.login()
//     cy.visit('localhost:8080/jobs')
//   })

//   after(() => {
//     cy.logout()
//   }

//   it('should assign shift', () => {
//     cy.createJob(job)
//     cy.click
//   })

// })

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