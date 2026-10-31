import { Outlet } from 'react-router-dom';
import { GroupsProvider } from '../../context/GroupsContext';
import Navbar from './Navbar';

/** Shell for every signed-in page: navbar + shared groups data. */
function AppLayout() {
  return (
    <GroupsProvider>
      <div className="shell">
        <Navbar />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </GroupsProvider>
  );
}

export default AppLayout;
