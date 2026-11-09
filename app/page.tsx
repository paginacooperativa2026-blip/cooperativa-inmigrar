import Catalog from './catalog';
import HeaderAccount from './header-account';
import { identity } from '../lib/access';

export const dynamic = 'force-dynamic';

const whatsapp='https://wa.me/56986355626';

export default async function Home(){const user=await identity();return <div className="site-home">
  <div className="announcement">Seis emprendedoras. Distintas historias. Una misma cooperativa. <a href="#nosotras">Conócenos →</a></div>
  <header className="header">
    <a href="/" aria-label="Cooperativa Inmigrar, inicio"><img className="logo" src="/logo-inmigrar.png" alt="Cooperativa Inmigrar"/></a>
    <nav aria-label="Principal"><a href="#inicio">Inicio</a><a href="#nosotras">Nosotras</a><a href="#emprendimientos">Catálogo</a><a href="#como-cotizar">Cómo cotizar</a><a href="#contacto">Contacto</a></nav>
    <HeaderAccount signedIn={Boolean(user)}/>
  </header>
  <main>
    <section className="hero-cover" id="inicio">
      <div className="cover-art" aria-hidden="true"><div className="flower"><i/><i/><i/><i/><i/><i/><b>i</b></div></div>
      <div className="cover-copy"><p className="eyebrow">BIENVENIDA A COOPERATIVA INMIGRAR</p><h1>Historias que se unen.<br/><em>Talentos que florecen.</em></h1><p>Descubre los emprendimientos de nuestras integrantes<br className="desktop-break"/> y conecta con la mujer detrás de cada propuesta.</p><a className="button light" href="#emprendimientos">Conoce nuestros emprendimientos <span>→</span></a></div>
      <div className="cover-caption"><span>COOPERATIVA INMIGRAR</span><span>EMPRENDIMIENTOS EN COMUNIDAD</span></div>
    </section>
    <section className="benefits" aria-label="Conoce nuestra cooperativa">
      <a href="#nosotras"><span className="benefit-icon" aria-hidden="true">✳</span><h2>Seis emprendedoras</h2><p>Una cooperativa que reúne<br/>historias y talentos.</p></a>
      <a href="#emprendimientos"><span className="benefit-icon" aria-hidden="true">◇</span><h2>Diversas propuestas</h2><p>Conoce lo que cada<br/>integrante tiene para ofrecer.</p></a>
      <a href="#como-cotizar"><span className="benefit-icon" aria-hidden="true"><ChatIcon/></span><h2>Contacto para cotizar</h2><p>Conversa sobre lo que buscas<br/>y consulta los detalles.</p></a>
      <a href="#contacto"><span className="benefit-icon" aria-hidden="true">⌖</span><h2>Visita nuestra sede</h2><p>Encuéntranos<br/>en Plaza Aníbal Pinto.</p></a>
    </section>
    <section id="emprendimientos" className="section catalog">
      <div className="section-heading"><div><p className="eyebrow">DESCUBRE NUESTRAS PROPUESTAS</p><h2>Emprendimientos con historia</h2><p>Explora el catálogo, conoce a las emprendedoras y encuentra con quién conectar.</p></div></div>
      <Catalog/>
    </section>
    <section id="nosotras" className="about section">
      <div className="identity-panel"><img src="/logo-inmigrar.png" alt="Cooperativa Inmigrar"/><div><span>06</span><p>Emprendedoras.<br/><strong>Una red que nos une.</strong></p></div></div>
      <div className="about-copy"><p className="eyebrow">MUJERES · EMPRENDIMIENTO · COMUNIDAD</p><h2>Conoce a<br/><em>Cooperativa Inmigrar.</em></h2><p className="large-copy">Somos una red de seis emprendedoras con sede en Valparaíso.</p><p>Reunimos nuestras propuestas en un mismo espacio para que puedas conocer cada emprendimiento y a la mujer que le da vida.</p><p>Queremos que este sea el punto de encuentro entre lo que buscas y los talentos de nuestras integrantes.</p><a className="button" href={whatsapp} target="_blank" rel="noreferrer">Conversemos →</a></div>
    </section>
    <section id="como-cotizar" className="section how-to"><div className="section-heading"><div><p className="eyebrow">DE UNA IDEA A UNA CONVERSACIÓN</p><h2>¿Cómo solicitar una cotización?</h2><p>Un contacto cercano para conocer cada propuesta.</p></div></div><div className="steps"><article><span>01</span><h3>Explora el catálogo</h3><p>Busca por nombre o rubro y descubre el emprendimiento que te interesa.</p></article><article><span>02</span><h3>Conoce su propuesta</h3><p>Abre su ficha para leer la descripción y ver la información disponible.</p></article><article><span>03</span><h3>Conversa y cotiza</h3><p>Usa el botón de WhatsApp de la ficha para consultar detalles y solicitar tu cotización.</p></article></div></section>
    <section className="quote"><p className="eyebrow">ESTAMOS PARA CONVERSAR</p><h2>¿Buscas algo en particular?</h2><p>Cuéntanos qué necesitas y te ayudamos a contactar a la emprendedora indicada.</p><a className="button light" target="_blank" rel="noreferrer" href={whatsapp+'?text=Hola%2C%20quisiera%20conocer%20los%20emprendimientos%20de%20Cooperativa%20Inmigrar.'}>Escríbenos por WhatsApp →</a></section>
    <section id="contacto" className="section contact"><div><p className="eyebrow">ESTAMOS CERCA</p><h2>Sigamos en contacto.</h2><p>Para conocer la cooperativa o consultar por nuestros emprendimientos.</p></div><div className="contact-details"><div><small>NUESTRA SEDE</small><p>Plaza Aníbal Pinto 341<br/>Piso 3, oficina 5 · Valparaíso</p><a href="https://www.google.com/maps/search/?api=1&query=Plaza+Anibal+Pinto+341+Valparaiso+Chile" target="_blank" rel="noreferrer">Ver ubicación →</a></div><div><small>CORREO DE CONTACTO</small><a href="mailto:inmigrar.rdmm.valparaiso@gmail.com">inmigrar.rdmm.valparaiso@gmail.com</a><small>WHATSAPP</small><a href={whatsapp} target="_blank" rel="noreferrer">+56 9 8635 5626 →</a></div></div></section>
  </main>
  <footer className="site-footer"><a href="#inicio" className="footer-brand"><img className="logo" src="/logo-inmigrar.png" alt="Cooperativa Inmigrar"/></a><div><h3>Explora</h3><a href="#nosotras">La cooperativa</a><a href="#emprendimientos">Nuestros emprendimientos</a><a href="#como-cotizar">Cómo cotizar</a></div><div><h3>Conecta</h3><a href="#contacto">Contacto y ubicación</a><a href="/admin">Acceso integrantes →</a><a href="#inicio">Volver arriba ↑</a></div><p className="footer-note">Cooperativa Inmigrar · Una red de emprendedoras<br/>Historias que se unen. Talentos que florecen.</p></footer>
  <a className="floating-whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Cotizar por WhatsApp"><ChatIcon/><span>¿Conversemos?</span></a>
</div>}

function ChatIcon(){return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.2c.5 3.5 2 5 5.4 5.8l1.1-1.3-2-1-1 .7-1.7-1.7.6-1.1-1-2Z"/></svg>}
