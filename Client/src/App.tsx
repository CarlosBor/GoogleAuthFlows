import './App.css'
import { GoogleLogin } from '@react-oauth/google'
import { useState, useEffect } from 'react'
import { domainURL } from './env.ts'


function App() {
  const [popUpEmail, setPopUpEmail] = useState("**Drumroll**");
  const [redirectEmail, setRedirectEmail] = useState("**Drumroll**");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    setRedirectEmail(email || "**Drumroll**");
  }, [])

  const popUpFlow = async (credentialResponse: any) => {
    const response = await fetch(`${domainURL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_token: credentialResponse.credential }),
    })
    const data = await response.json();
    setPopUpEmail(data.email);
  }


  return (
    <>
      <div className="wrapper">

        <div className="container">
          <h3>Popup version :</h3>
          <GoogleLogin
            onSuccess={credentialResponse => { popUpFlow(credentialResponse) }}
            onError={() => { console.log('Login Failed') }} 
            ux_mode="redirect"/>
          <span>This user's email is: {popUpEmail}</span>
        </div>

        <div className="container">
          <h3>Redirect version :</h3>
          <a href={`${domainURL}/auth/google-redirect`}>
            Login with Google (Redirect)
          </a>
          <span>This user's email is: {redirectEmail}</span>
        </div>
        
      </div>
    </>
  )
}

export default App
