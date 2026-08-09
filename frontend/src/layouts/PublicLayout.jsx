/* ============================================================
   Public Layout — Landing, Login, Register (no sidebar/navbar)
   ============================================================ */

import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
