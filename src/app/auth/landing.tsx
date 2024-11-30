import React, { useState } from "react";
import { Link, redirect, Navigate } from "react-router-dom";

import "@/App.css";
import reactLogo from "@/assets/react.svg";
import { authProvider } from "@/lib/router";

import { Transcript } from "../../../server/src/types/schema";
import { Settings } from "../app/settings";
import { Upload } from "../app/upload";
import viteLogo from "/vite.svg";

export const Landing: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button>
          <Link to="/auth/login">Login</Link>
        </button>
        <button>
          <Link to="/auth/register">Signup</Link>
        </button>
        {/* <button>
					<Link to="/auth/logout">Logout</Link>
				</button> */}
        <button onClick={async () => await authProvider.signout()}>
          Signout
        </button>
        <br />
        <button>
          <Link to="/app">Transcripts</Link>
        </button>
        <button>
          <Link to="/app/setup">Setup</Link>
        </button>
        <button>
          <Link to="/app/upload">Upload</Link>
        </button>
        <button>
          <Link to="/app/templates">Templates</Link>
        </button>
        <button>
          <Link to="/app/settings">Settings</Link>
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};
