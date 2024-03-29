/* eslint-disable no-undef */
/// <reference types="cypress" />

import { job } from '../../fixtures/jobs'
import { manager, contractor } from '../../fixtures/auth'
import dayjs from 'dayjs'
import { localUrl } from '../../fixtures/app'

describe('auth', () => {

  before(() => {
    cy.visit(`${localUrl}`)
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
    cy.visit(`${localUrl}/jobs`)
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
    cy.visit(`${localUrl}/jobs`)
    cy.get('main').should('contain', job.name)

    // Update
    cy.button('edit-job-button').first().click()
    cy.editJob(job)
    cy.get('main').should('contain', `${job.name} (edited)`)

    // Delete
    cy.button('close-job-button').first().click()
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
    cy.button('assign-shift-button').click()
    cy.assignShift(shiftLocation)

    // TODO: Check shift is displayed on page

    // Edit shift
    cy.contains(shiftLocation).click()
    cy.wait(1000)
    cy.button('edit-shift-button').click()
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
    cy.visit(`${localUrl}/payments`)
  })

  afterEach(() => {
    cy.logout()
  })

  it('should add funds', {
    defaultCommandTimeout: 30000
  }, () => {
    cy.wait(5000) // Wait for funding sources to come in
    cy.button('add-funds-button').click()
    cy.transferFunds(5000)
  })

  it('should transfer funds to bank', {
    defaultCommandTimeout: 30000
  }, () => {
    cy.button('transfer-to-bank-button').click()
    cy.transferFunds(1)
    cy.get('body').should('contain', 'Hang tight')
  })
})

describe('clock', {
  defaultCommandTimeout: 30000
}, () => {

  it('should clock in and out', () => {

    /* Assign a shift to contractor */

    cy.login('manager')
    cy.visit(`${localUrl}/jobs`)
    
    cy.button('add-job-button').click()
    cy.createJob(job)

    // Open job
    cy.get('main').contains(job.name).click()

    cy.get('[data-cy=clock-in-code]').invoke('text').then(clockInCode => {
      
      // Assign shift
      const shiftLocation = 'Cypress site location'
      cy.button('assign-shift-button').click()
      cy.assignShift(shiftLocation)
      cy.wait(1000)

      cy.logout()

      /* Switch to contractor and clock in and out */

      cy.login('contractor')

      cy.visit(`${localUrl}/dashboard`)
      cy.get('main').should('contain', shiftLocation)

      cy.contains(shiftLocation).click()
      
      // Generate 4 timecards
      for (let i = 0; i < 4; i++) {
        // Clock in
        cy.wait(1000)
        cy.button('clock-in-button').click()
        cy.textField('clock-in-code', clockInCode, true)
        cy.button('submit-clock-in-code-button', true).click()

        cy.get('main').should('contain', 'Clock out')
        cy.get('main').should('contain', 'Start break')
        cy.get('main').should('contain', `Your shift at ${shiftLocation} `)

        if (i === 0) {
          // Start break
          cy.wait(1000)
          cy.button('start-break-button').click()
          cy.get('main').should('contain', 'End break')

          // End break
          cy.wait(1000)
          cy.button('end-break-button').click()
          cy.get('main').should('contain', `Clock out`)
        }
          
        // Clock out
        cy.wait(1000)
        cy.button('clock-out-button').click()
        cy.get('main').should('contain', 'Clock in')
      }

      cy.logout()

      /* Pay contractor for timecard */

      cy.login('manager')
      cy.visit(`${localUrl}/payments`)

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
        cy.visit(`${localUrl}/payments`)

        cy.wait(10000) // Wait for funding sources to load
        cy.button('transfer-to-bank-button').click()
        cy.button('transfer-submit-button', true).click()
        cy.get('body').should('contain', 'Hang tight')

        cy.logout()
    
        /* Delete shift and close job */
        cy.login('manager')
        cy.visit(`${localUrl}/jobs`)
        
        cy.contains(job.name).click()
        // TODO: Shift can't be deleted right now if it is active
        // cy.wait(3000)
        // cy.contains(shiftLocation).click()
        // cy.deleteShift()
        cy.button('close-job-button').click()
        cy.closeJob(job)
      })
    })
  })
})

// describe('messages', () => {
//   beforeEach(() => {
//     cy.login('manager')
//     cy.visit(`${localUrl}/messages`)
//   })

//   afterEach(() => {
//     cy.logout()
//   })

//   it('should send messages', () => {
//     // Create a conversation
//     cy.button('new-conversation-button').click()
//     cy.wait(1500)
//     cy.selectField('users-select', 0, true, true)

//     const rand = Math.floor(Math.random() * 1000).toString()
//     const input = `Hello world ${rand}`

//     cy.get('[data-cy=conversation]').first().click()
//     cy.textField('message-input', `${input}{enter}`)

//     cy.get('main').should('contain', input)
//   })
// })