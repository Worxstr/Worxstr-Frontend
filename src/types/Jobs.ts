import dayjs from 'dayjs'
import { User } from './Users'

export type ClockEvent = {
	id: number
	action: number
	time: string
	timecard_id: number
	contractor_id: number
	job_id: number
	shift_id: number
}

export enum ClockAction {
	ClockIn = 1,
	ClockOut = 2,
	StartBreak = 3,
	EndBreak = 4,
}

export type Job = {
	id: number
	name: string
	active: boolean
	direct: boolean
	radius: number
	color: string
	city: string
	state: string
	address: string
	zip_code: string
	country: string
	consultant_name: string
	consultant_code: string
	consultant_email: string
	consultant_phone: string
	restrict_by_code: boolean
	restrict_by_location: boolean
	restrict_by_time: boolean
	restrict_by_time_window: number
	latitude: number
	longitude: number
	organization_id: number
	organization_manager_id: number
	contractor_manager_id: number
	contractor_manager: User
	organization_manager: User
	shifts?: Shift[]
	contractors: User[]
	managers: {
		contractor_managers: User[]
		organization_managers: User[]
	}
}

export type Shift = {
	id: number
	active: boolean
	job_id: number
	clock_state: ClockAction
	clock_history: ClockEvent[]
	contractor: User
	contractor_id: number
	site_location: string
	time_begin: string
	time_end: string
	timecard_id: number
	tasks: Task[]
}

export type Task = {
	id: number
	shift_id: number
	title: string
	description: string
	complete: boolean
	time_complete: string
}

// Compute the duration of a timecard in ms
export function clockedTime(shift: Shift) {
	const clockIn = shift.clock_history.find((clock: ClockEvent) => clock.action === ClockAction.ClockIn)
	const clockOut = shift.clock_history.find((clock: ClockEvent) => clock.action === ClockAction.ClockOut)
	if (clockIn && clockOut) {
		// Print in format 1h 30m
		return dayjs(clockOut.time).diff(dayjs(clockIn.time))
	}
	return 0
}

// Compute the break time on a shift in ms
export function breakTime(shift: Shift) {
	const breakStarts = shift.clock_history.filter((clock: ClockEvent) => clock.action === ClockAction.StartBreak)
	const breakEnds = shift.clock_history.filter((clock: ClockEvent) => clock.action === ClockAction.EndBreak)

	if (breakStarts && breakEnds) {
		let total = 0
		for (let i = 0; i < breakStarts.length; i++) {
			total += dayjs(breakEnds[i].time).diff(dayjs(breakStarts[i].time))
		}
		return total
	}
	return 0
}

// Compute the time worked on a shift in ms
export function workTime(shift: Shift) {
	return clockedTime(shift) - breakTime(shift)	
}