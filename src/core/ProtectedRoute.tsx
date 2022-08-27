import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Titlebar from '../ui/titlebar/Titlebar';
import Player from './Player';

interface ProtectedRouteProps {
  authenticated: boolean | undefined;
  searchContainer: React.RefObject<HTMLDivElement>;
}

const ProtectedRoute = ({ authenticated, searchContainer }: ProtectedRouteProps) => {
  if (!authenticated) {
    return <Navigate replace to="/login" />;
  }

  return (
    <Player>
      <Titlebar authenticated={authenticated} searchContainer={searchContainer} />
      <Outlet />
    </Player>
  );
};

export default ProtectedRoute;
