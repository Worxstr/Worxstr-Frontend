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