import { useState, useEffect } from 'react';
import { Input, Select, Spin, Empty, message, Button } from 'antd';
import { Search, MapPin, Sparkles, FilterX } from 'lucide-react';
import { authFetch } from '../../utils/api';
import { JOB_TYPES } from '../../utils/constants';
import JobCard from '../../components/JobCard/job-card';
import './jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
  });

  const onChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const onTypeChange = value => {
    setFilters({ ...filters, type: value || '' });
  };

  const onClearFilters = () => {
    setFilters({ search: '', type: '', location: '' });
  };

  const hasActiveFilters = filters.search || filters.type || filters.location;

  useEffect(() => {
    const getJobs = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.type) params.append('type', filters.type);
        if (filters.location) params.append('location', filters.location);

        const response = await authFetch(`/api/jobs?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setJobs(data.jobs);
        } else {
          message.error(data.message);
        }
      } catch (e) {
        message.error('Cannot connect to server');
      }
      setLoading(false);
    };

    const timer = setTimeout(getJobs, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="jobs-page">
      <div className="jobs-hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Curated Job Listings</span>
        </div>
        <h1>Explore Career Opportunities</h1>
        <p>Discover open positions from high-growth tech companies and top employers.</p>
      </div>

      <div className="filter-card">
        <div className="filter-inputs">
          <Input
            name="search"
            placeholder="Search by job title or keyword"
            prefix={<Search size={16} className="filter-icon" />}
            value={filters.search}
            onChange={onChange}
            allowClear
            className="filter-input-search"
          />
          <Select
            placeholder="All Job Types"
            allowClear
            value={filters.type || undefined}
            onChange={onTypeChange}
            options={JOB_TYPES.map(type => ({
              value: type,
              label: <span style={{ textTransform: 'capitalize' }}>{type}</span>,
            }))}
            className="filter-select-type"
          />
          <Input
            name="location"
            placeholder="Location (e.g. Remote, NY)"
            prefix={<MapPin size={16} className="filter-icon" />}
            value={filters.location}
            onChange={onChange}
            allowClear
            className="filter-input-location"
          />
          {hasActiveFilters && (
            <Button
              icon={<FilterX size={15} />}
              onClick={onClearFilters}
              className="clear-filters-btn"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="filter-meta">
          <span className="results-count">
            Showing <strong>{jobs.length}</strong> {jobs.length === 1 ? 'position' : 'positions'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="jobs-loading-state">
          <Spin size="large" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="jobs-empty-wrapper">
          <Empty
            description={
              hasActiveFilters
                ? 'No matching positions found for your filter criteria'
                : 'No open jobs available right now'
            }
          >
            {hasActiveFilters && (
              <Button type="primary" onClick={onClearFilters}>
                Clear All Filters
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
