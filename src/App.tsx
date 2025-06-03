import {useState} from 'react'
import './App.css'

function App() {
  // Alternatively, we should have streamdevs-streamlabs-cli to just ask for the client_id and secret, and return the token
  // This is a self-hosted web app. Only the developer is going to see this page
  const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return (
      <main>
        <header>
          Configuration error
          <p><code>VITE_CLIENT_ID</code>, <code>VITE_CLIENT_SECRET</code> and <code>VITE_REDIRECT_URI</code> must be provided as environment variables.
          </p>
        </header>
      </main>
    )
  }

  const apiUrl = "https://streamlabs.com/api/v2.0/";
  const authorizeUrl = `${apiUrl}authorize?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&scope=alerts.create`;
  const code = new URLSearchParams(window.location.search).get("code");

  if (code && code.length > 0 && !token) {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_SECRET);
    formData.append("redirect_uri", REDIRECT_URI);

    const fetchToken = async () => {
      const response = await fetch(`/api/token`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json() as { access_token: string | undefined };
      const {access_token} = data;

      setToken(access_token ?? null);
    };

    fetchToken().catch((e: unknown) => {
      setErrorMessage((e as Error).message)
    });
  }

  if (errorMessage) {
    return (
      <main>
        <header>
          An error occurred fetching the Streamlabs token:
          <p>{errorMessage}</p>
        </header>
      </main>
    )
  }

  if (token) {
    return (
      <main>
        <header>
          <input type={showToken ? "text" : "password"} defaultValue={token}/>
          <button type="button" onClick={() => {
            setShowToken(!showToken)
          }}>
            {showToken ? "Hide token" : "Show token"}
          </button>
        </header>
      </main>
    );
  }

  return (
    <main className="App">
      <header>
        <a className='header__authorization-link' href={authorizeUrl}>
          Login with Streamlabs
        </a>
      </header>
    </main>
  );
}

export default App
