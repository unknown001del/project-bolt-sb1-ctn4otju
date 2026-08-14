import React from 'react';
const GithubBrowser = React.lazy(()=> import('./GithubBrowser'));

export const GithubBrowserWrapper: React.FC = () => {
  return <GithubBrowser />;
};

export default GithubBrowserWrapper;