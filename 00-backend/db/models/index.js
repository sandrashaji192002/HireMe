const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');

//1 to M
User.hasMany(Job, {
  foreignKey: 'recruiterId',
  as: 'jobs',
});
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });

//1 to M
User.hasMany(Application, {
  foreignKey: 'studentId',
  as: 'applications',
});
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

//1 to M
Job.hasMany(Application, {
  foreignKey: 'jobId',
  as: 'applications',
  onDelete: 'CASCADE',
});
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = { Job, User, Application };
