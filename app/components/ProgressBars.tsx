import * as React from "react";
import { lang } from "../module/global_app";

export default function ProgressBars() {
  return (
    <div className="preloader-content">
      <div className="preloader-wrapper big active">
        <div className="spinner-layer spinner-blue-only">
          <div className="circle-clipper left">
            <div className="circle"></div>
          </div>
          <div className="gap-patch">
            <div className="circle" />
          </div>
          <div className="circle-clipper right">
            <div className="circle" />
          </div>
        </div>
      </div>
      <div className="preloader-text">{lang.get_resource.Settings.wait}</div>
    </div>
  );
}
