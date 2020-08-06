/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

// Lazily load routes and code split with webpacck
const LazyFileSelectPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/FileSelectPage')
);

const FileSelectPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyFileSelectPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.WYBORPLIKOW} component={FileSelectPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
