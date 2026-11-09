'use client';
import { useEffect, useRef, useState } from 'react';
import { catalogImage, type CatalogEntry } from '../lib/demo-catalog';

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Catalog() {
  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [active, setActive] = useState<CatalogEntry | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [quote, setQuote] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setFailed(false);
    fetch('/api/catalog', { signal: controller.signal }).then(response => {
      if (!response.ok) throw Error();
      return response.json() as Promise<CatalogEntry[]>;
    }).then(setItems).catch(error => { if (error.name !== 'AbortError') setFailed(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    setQuote(false);
    if (active) dialog.current?.showModal(); else dialog.current?.close();
  }, [active]);

  const categories = ['Todas', ...new Set(items.map(item => item.category).filter(Boolean))];
  const filtered = items.filter(item => (category === 'Todas' || item.category === category) && normalize(item.name + ' ' + item.person + ' ' + item.category + ' ' + item.description).includes(normalize(query)));

  return <>
    {items.some(item => item.demo) && <div className="demo-notice"><span aria-hidden="true">✳</span><p><strong>Catálogo de demostración.</strong> Las fichas marcadas como ejemplo contienen nombres, productos y precios ficticios; las fotos son referenciales.</p></div>}
    <div className="catalog-tools"><div className="filters" aria-label="Filtrar por rubro">{categories.map(value => <button key={value} aria-pressed={category === value} className={category === value ? 'selected' : ''} onClick={() => setCategory(value)}>{value}</button>)}</div><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Buscar emprendimientos" placeholder="Buscar un emprendimiento" value={query} onChange={event => setQuery(event.target.value)}/></label></div>
    {loading ? <p role="status">Cargando emprendimientos…</p> : failed ? <div role="alert" className="coming"><div><h3>No pudimos cargar el catálogo.</h3><p>Intenta nuevamente en unos momentos.</p><button className="button" onClick={() => setAttempt(attempt + 1)}>Volver a intentar</button></div></div> : items.length ? <>
      <p className="catalog-count" role="status">{filtered.length} {filtered.length === 1 ? 'emprendimiento' : 'emprendimientos'}</p>
      <div className="cards">{filtered.map(item => <button className="card" key={item.id} onClick={() => setActive(item)} aria-label={'Ver ficha de ' + item.name}>
        <div className="card-image">{item.image ? <img loading="lazy" src={catalogImage(item.image)} alt={'Productos de ' + item.name + (item.demo ? ', fotografía referencial' : '')}/> : <span className="card-symbol">✳</span>}<span className="badge">{item.category}</span>{item.demo && <span className="demo-badge">EJEMPLO</span>}</div>
        <div className="card-body"><small>{item.person}</small><h3>{item.name}<span>↗</span></h3><p>{item.description.split('\n')[0]}</p>{item.price && <strong className="card-price">{item.price}</strong>}<span className="card-more">Conoce la propuesta →</span></div>
      </button>)}</div>
      {filtered.length === 0 && <div className="catalog-empty"><h3>No encontramos coincidencias.</h3><p>Prueba con otro nombre o rubro.</p><button className="button" onClick={() => { setQuery(''); setCategory('Todas'); }}>Ver todos los emprendimientos</button></div>}
    </> : <div className="coming"><span className="coming-mark">✳</span><div><h3>Seis historias por descubrir.</h3><p>Estamos preparando las fichas de nuestras emprendedoras. Pronto podrás conocer aquí sus propuestas.</p><a href="https://wa.me/56986355626" target="_blank" rel="noreferrer">Mientras tanto, conversemos ↗</a></div></div>}
    <dialog ref={dialog} className="profile" aria-labelledby="profile-title" onClose={() => setActive(null)}>{active && <>
      <button className="close" onClick={() => setActive(null)} aria-label="Cerrar ficha">×</button>
      {active.image && <img src={catalogImage(active.image)} alt={'Productos de ' + active.name}/>}
      {active.demo && <p className="profile-demo">Ficha de demostración · Productos y precios ficticios</p>}
      <p className="eyebrow">{active.category}</p><h2 id="profile-title">{active.name}</h2><p className="large-copy">{active.person}</p><p className="preserve">{active.description}</p><p className="profile-price">{active.price}</p>
      {active.demo ? <><button className="button" onClick={() => setQuote(!quote)}>Ver ejemplo de cotización →</button>{quote && <div className="quote-example" role="status"><strong>Vista previa del mensaje</strong><p>Hola, quisiera cotizar con {active.name}. Me interesa conocer sus productos y disponibilidad.</p><small>Esta demostración no envía mensajes ni genera un pedido.</small></div>}</> : <a className="button" href={'https://wa.me/' + (active.whatsapp || '56986355626') + '?text=' + encodeURIComponent('Hola, quisiera cotizar con ' + active.name + '.')} target="_blank" rel="noreferrer">Solicitar cotización ↗</a>}
    </>}</dialog>
  </>;
}
