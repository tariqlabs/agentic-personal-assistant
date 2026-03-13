import React from "react";

const Header = ({ title = "Agentic Personal Assistant", subtitle = "Upload PDFs, then chat with your knowledge base." }) => {
  return (
    <header className="appHeader">
      <div className="appHeaderInner">
        <div className="appTitle">{title}</div>
        <div className="appSubtitle">{subtitle}</div>
      </div>
    </header>
  );
};

export default Header;