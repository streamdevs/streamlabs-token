import React, { useState } from "react";
import qs from "qs";
import "./App.css";

const App: React.FC = function () {
  const apiUrl = "https://streamlabs.com/api/v1.0/";
  const redirectUri = `${window.location.protocol}//${window.location.host}`;
  const authorizeUrl = `${apiUrl}authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${process.env.REACT_APP_CLIENT_ID}&scope=alerts.create`;
  const [token, setToken] = useState<string | null>(null);
  const [viewToken, setViewToken] = useState<boolean>(false);

  const { code } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  if (code && !token) {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", process.env.REACT_APP_CLIENT_ID || "");
    formData.append("client_secret", process.env.REACT_APP_CLIENT_SECRET || "");
    formData.append("redirect_uri", redirectUri);

    const fetchToken = async () => {
      const { access_token } = await fetch(`/api/token`, {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (!res.ok) {
          window.location.search = "";
        }

        return res.json();
      });

      setToken(access_token);
    };

    fetchToken();
  }

  if (token) {
    return (
      <div className="App">
        <header className="App-header">
          <input type={viewToken ? "text" : "password"} defaultValue={token} />
          <button onClick={() => setViewToken(!viewToken)}>
            {viewToken ? "Hide token" : "Show token"}
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <a style={{ color: "white" }} href={authorizeUrl}>
          Login with StreamLabs
        </a>
      </header>
    </div>
  );
};

export default App;
