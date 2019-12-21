import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ContentListPage from "./ContentListPage";
import ChannelListPage from "./ChannelListPage";


export default function ContentPage() {
  return (
    <Switch>
      <Redirect
        exact={true}
        from="/content"
        to="/content/list-content"
      />

      <Route 
        path="/content/list-content" 
        component={ContentListPage} 
      />
      <Route 
        path="/content/list-channel" 
        component={ChannelListPage} 
      />

    </Switch>
  );
}
