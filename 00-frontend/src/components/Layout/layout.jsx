import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/navbar';
import './layout.css';

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
};
export default Layout;
