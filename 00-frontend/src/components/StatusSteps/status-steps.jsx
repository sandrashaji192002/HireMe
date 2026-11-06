import { Steps } from 'antd';
import './status-steps.css';
const StatusSteps = ({ status }) => {
  const isRejected = status === 'rejected';

  const items = [
    { title: 'Applied' },
    { title: 'Reviewed' },
    { title: isRejected ? 'Rejected' : 'Shortlisted' },
  ];

  const current = { applied: 0, reviewed: 1, shortlisted: 2, rejected: 2 }[
    status
  ];

  return (
    <div className={`status-steps status-${status}`}>
      <Steps
        size="small"
        current={current}
        status={isRejected ? 'error' : 'process'}
        items={items}
      />
    </div>
  );
};
export default StatusSteps;
