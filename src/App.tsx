import {useState} from 'react'
import './App.css'

const DEFAULT_REDIRECT_URI = "https://app.streamdevs.com/oauth/callback";

function App() {
  // Alternatively, we should have streamdevs-streamlabs-cli to just ask for the client_id and secret, and return the token
  // This is a self-hosted web app. Only the developer is going to see this page
  const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || DEFAULT_REDIRECT_URI;

  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log('lol');

    return false;
  }

  // When no env variable is set, work in standalone mode
  if (!CLIENT_ID && !CLIENT_SECRET) {
    return (
      <main className="standalone">
        <header>
          <h1>Streamlabs integration</h1>
          <ol>
            <li>Ensure you have a registered OAuth Client with the Streamlabs API. See <a href="#"></a> to edit or create a new one.</li>
            <li>In our OAUth client configuration, add <code>{REDIRECT_URI}</code> to your <em>redirect URIs</em></li>
            <li>Fill out the form below</li>
            <li>Authorize your app to use the Streamlabs API</li>
            <li>Copy the Authentication Token provided by the Streamlabs API</li>
            {/* eslint-disable-next-line react-dom/no-unsafe-target-blank */}
            <li>Use the token wherever you need to, like <strong><a href="https://github.com/streamdevs/webhook" target="_blank">streamdevs/webhook</a></strong></li>
          </ol>
          <form className="standalone__form" onSubmit={handleSubmit}>
            <div className="standalone__form__line">
              <input type="text" name="client_id" placeholder="Client ID" />
            </div>
            <div className="standalone__form__line">
              <input type="text" name="client_secret" placeholder="Client Secret" />
            </div>
            <div className="standalone__form__line">
              <input type="text" name="redirect_uri" placeholder="Redirect URI" defaultValue={REDIRECT_URI} readOnly />
            </div>
            <div className="standalone__form__line">
              <button type="submit">Authorize</button>
            </div>
          </form>
        </header>
      </main>
    )
  }

  // If only some are missing, report it
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
