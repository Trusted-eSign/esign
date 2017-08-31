import * as React from "react";

export default function ProgressBars({children}, context) {
  const { localize, locale } = context;

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
      <div className="preloader-text">{localize("Settings.wait", locale)}</div>
    </div>
  );
}

ProgressBars.contextTypes = {
  locale: React.PropTypes.string,
  localize: React.PropTypes.func,
};
