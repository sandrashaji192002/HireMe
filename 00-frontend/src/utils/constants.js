export const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract'];

export const STATUS_COLORS = {
  applied: 'blue',
  reviewed: 'gold',
  shortlisted: 'green',
  rejected: 'red',
};

export const NEXT_STATUS = {
  applied: ['reviewed'],
  reviewed: ['shortlisted', 'rejected'],
  shortlisted: ['rejected'],
  rejected: [],
};
