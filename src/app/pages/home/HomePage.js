import React, { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Builder from "./Builder";
import Dashboard from "./Dashboard";
import User from "./User";
import Attribute from "./Attribute";
import Audience from "./Audience";
import DocsPage from "./docs/DocsPage";
import { LayoutSplashScreen } from "../../../_metronic";

const GoogleMaterialPage = lazy(() =>
  import("./google-material/GoogleMaterialPage")
);
const ReactBootstrapPage = lazy(() =>
  import("./react-bootstrap/ReactBootstrapPage")
);
const ContentPage = lazy(() =>
  import("./content/ContentPage")
);

export default function HomePage() {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }
        <Route path="/builder" component={Builder} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/user" component={User} />
        <Route path="/attribute" component={Attribute} />
        <Route path="/audience" component={Audience} />
        <Route path="/content" component={ContentPage} />
        <Route path="/google-material" component={GoogleMaterialPage} />
        <Route path="/react-bootstrap" component={ReactBootstrapPage} />
        <Route path="/docs" component={DocsPage} />
        <Redirect to="/error/error-v1" />
      </Switch>
    </Suspense>
  );
}
