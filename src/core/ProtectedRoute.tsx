import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Titlebar from '../ui/titlebar/Titlebar';
import Player from './Player';

interface ProtectedRouteProps {
  authenticated: string;
  searchContainer: React.RefObject<HTMLDivElement>;
  setAuthenticated: React.Dispatch<React.SetStateAction<string>>;
}

const ProtectedRoute = (
  { authenticated, searchContainer, setAuthenticated }: ProtectedRouteProps,
) => {
  if (authenticated === 'unknown' || authenticated === 'unauthenticated') {
    return <Navigate replace to="/login" />;
  }

  return (
    <Player>
      <Titlebar
        authenticated={authenticated}
        searchContainer={searchContainer}
        setAuthenticated={setAuthenticated}
      />
      <Outlet />
    </Player>
  );
};

export default ProtectedRoute;
