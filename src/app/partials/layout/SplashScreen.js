import React from "react";
import { CircularProgress } from "@material-ui/core";
import { toAbsoluteUrl } from "../../../_metronic";

class SplashScreen extends React.Component {
  render() {
    const logoStyle = {
      width: "80px"
    };

    return (
      <>
        <div className="kt-splash-screen">
        <img src={toAbsoluteUrl("/media/logos/logo-netpolitan-small.png")}
          alt="Metronic logo"
          style={logoStyle}
           />
          }
        <CircularProgress className="kt-splash-screen__spinner" />
        </div>
      </>
    );
  }
}

export default SplashScreen;
