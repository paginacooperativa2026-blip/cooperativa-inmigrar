'use client';
import {useState} from 'react';
export default function Logout(){const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><button type="button" className="logout-button" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch('/api/auth/logout',{method:'POST'});if(!response.ok)throw Error(await response.text());window.location.assign('/admin')}catch(e){setError(e instanceof Error?e.message:'No se pudo cerrar la sesión.');setBusy(false)}}}>{busy?'Cerrando sesión…':'Cerrar sesión'}</button>{error&&<p role="alert">{error}</p>}</>}
