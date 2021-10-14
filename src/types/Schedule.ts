import { ClockEvent } from "./Clock";

export type CalendarEvent = {
    id: number;
    job_id: number;
    contractor_id: number;
    color: string;
    site_location: string;
    time_begin: string;
    time_end: string;
    timecard_id: number;
    timeclock_events: ClockEvent[];
}