/* eslint-disable no-undef */
/// <reference types="cypress" />

import { job } from '../../fixtures/jobs'
import { manager, contractor } from '../../fixtures/auth'
import dayjs from 'dayjs'

describe('auth', () => {

  before(() => {
    cy.visit('localhost:8080')
  })

  it('will load', () => {
    cy.get('main').contains('The adaptive solution').should('be.visible')
  })

  it('should sign in', () => {
    cy.get('main').contains('Sign in').click()

    const { email, password } = manager

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
    cy.button('add-job-button').click()
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

    cy.button('add-job-button').click()
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
    cy.button('edit-job-button').click()
    cy.editJob(job)

    // TODO: Check job was updated

    // Close job
    cy.button('close-job-button').click()
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
    cy.wait(10000) // Wait for funding sources to load
    cy.button('add-funds-button').click()
    cy.transferFunds(100)
  })

  it('should transfer funds to bank', {
    defaultCommandTimeout: 20000
  }, () => {
    cy.wait(10000) // Wait for funding sources to load
    cy.button('transfer-to-bank-button').click()
    cy.transferFunds(1)
    cy.get('body').should('contain', 'Hang tight')
  })
})

describe('payments', {
  defaultCommandTimeout: 20000
}, () => {

  it('should clock in and out', () => {

    /* Assign a shift to contractor */

    cy.login('manager')
    cy.visit('localhost:8080/clock')
    
    cy.button('add-job-button').click()
    cy.createJob(job)

    // Open job
    cy.get('main').contains(job.name).click()

    cy.get('[data-cy=clock-in-code]').invoke('text').then(clockInCode => {
      
      // Assign shift
      const shiftLocation = 'Cypress site location'
      cy.assignShift(shiftLocation)

      cy.logout()


      /* Switch to contractor and clock in and out */

      cy.login('contractor')

      cy.visit('localhost:8080/clock')
      cy.get('main').should('contain', 'Clock in')
      
      // Generate 4 timecards
      for (let i = 0; i < 4; i++) {
        // Clock in
        cy.button('clock-in-button').click()
        cy.textField('clock-in-code', clockInCode, true)
        cy.button('submit-clock-in-code-button', true).click()

        cy.get('main').should('contain', 'Clock out')
        cy.get('main').should('contain', 'Start break')
        cy.get('main').should('contain', `Your shift at ${shiftLocation} `)

        if (i === 0) {
          // Start break
          cy.button('start-break-button').click()
          cy.get('main').should('contain', 'End break')

          // End break
          cy.button('end-break-button').click()
          cy.get('main').should('contain', `Clock out`)
        }
          
        // Clock out
        cy.button('clock-out-button').click()
        cy.get('main').should('contain', 'Clock in')

        cy.wait(1000)
      }

      cy.logout()

      /* Pay contractor for timecard */

      cy.login('manager')
      cy.visit('localhost:8080/payments')

      // TODO: Transfer enough funds for payments
      // TODO: This is hard because the payments must be processed through dwolla externally

      // Edit a timecard
      cy.get('[data-cy=timecard]').first().click()
      cy.button('edit-timecard-button').last().click()
      
      // Get date 5 minutes before shift
      cy.get('[data-cy=timecard-time-in]').find('input').invoke('val').then(text => {

        const formatted = dayjs(text).subtract(5, 'minute').format('YYYY-MM-DDThh:mm')
        
        cy.textField('timecard-time-in', formatted, true)
        cy.button('save-timecard-button', true).click()
        
        // Approve edited timecard
        cy.get('[data-cy=timecard]').first().click()
        cy.button('complete-timecard-button').last().click()
        cy.button('confirm-complete-payment-button', true).click()

        // Deny a timecard
        cy.get('[data-cy=timecard]').last().click()
        cy.button('deny-timecard-button').last().click()
        cy.button('confirm-deny-payment-button', true).click()

        // Deny remaining timecards
        cy.button('deny-all-timecards-button').click()
        cy.button('confirm-deny-payment-button', true).click()

        cy.logout()
    
        /* Transfer new funds */

        cy.login('contractor')
        cy.visit('localhost:8080/payments')

        cy.wait(10000) // Wait for funding sources to load
        cy.button('transfer-to-bank-button').click()
        cy.button('transfer-submit-button', true).click()
        cy.get('body').should('contain', 'Hang tight')

        cy.logout()
    
        /* Delete shift and close job */
    
        cy.login('manager')
        cy.visit('localhost:8080/jobs')
        
        cy.contains(job.name).click()
        cy.wait(3000)
        cy.contains(shiftLocation).click()
        cy.deleteShift()
        cy.button('close-job-button').click()
        cy.closeJob(job)
      })
    })


  })
})