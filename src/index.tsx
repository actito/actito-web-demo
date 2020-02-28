/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import "./index.scss";

import { Logger } from "./helpers/types";
import { BasicForm } from "./use-cases/basic-form";
import { PreferenceCenter } from "./use-cases/preference-center";
import cx from "classnames";

const tabComponents: { [tab: string]: React.FC<Logger> } = {
  "Basic form": BasicForm,
  "Preference center": PreferenceCenter
};

type Tab = keyof typeof tabComponents;
const tabs = Object.keys(tabComponents) as Tab[];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  function addLogEntry(entry: string) {
    setLogMessages([...logMessages, entry]);
  }

  const Component = tabComponents[activeTab];
  return (
    <section className="section">
      <div className="container">
        <div className="tabs">
          <ul>
            {tabs.map(tab => (
              <li key={tab} className={cx({ "is-active": tab === activeTab })}>
                <a onClick={() => setActiveTab(tab)}>{tab}</a>
              </li>
            ))}
          </ul>
        </div>
        <Component addLogEntry={addLogEntry} />
        <div>
          <h1 className="title">Logs</h1>
          <ul>
            {logMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
