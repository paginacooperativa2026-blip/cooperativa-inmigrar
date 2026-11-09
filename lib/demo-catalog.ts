export type CatalogEntry = {
  id: string; name: string; person: string; category: string; description: string;
  image: string | null; price: string | null; whatsapp: string | null; demo?: boolean;
};

export const demoCatalog: CatalogEntry[] = [
  { id:'demo-ceramica',name:'Barro y Raíz',person:'Emprendedora de ejemplo 01',category:'Cerámica',description:'Una mesa con personalidad: platos, cuencos y piezas decorativas en tonos naturales.\n\nProductos de ejemplo: juego de cuencos, platos de cerámica y piezas para regalar.\n\nEsta ficha es ficticia y solo muestra cómo se verá un emprendimiento en el catálogo.',image:'/demo/ceramica.jpg',price:'Precio de ejemplo: desde $18.000',whatsapp:null,demo:true },
  { id:'demo-panaderia',name:'Dulce Encuentro',person:'Emprendedora de ejemplo 02',category:'Panadería',description:'El aroma de una buena conversación empieza con pan recién hecho. Una propuesta de panadería para compartir.\n\nProductos de ejemplo: panes de semillas, hogazas y canastas de desayuno.\n\nEsta ficha es ficticia y solo muestra cómo se verá un emprendimiento en el catálogo.',image:'/demo/panaderia.jpg',price:'Precio de ejemplo: desde $4.500',whatsapp:null,demo:true },
  { id:'demo-textiles',name:'Hilos del Puerto',person:'Emprendedora de ejemplo 03',category:'Textil y hogar',description:'Texturas que abrigan los espacios. Una propuesta de textiles y decoración para llevar calidez al hogar.\n\nProductos de ejemplo: alfombras, caminos de mesa y textiles decorativos.\n\nEsta ficha es ficticia y solo muestra cómo se verá un emprendimiento en el catálogo.',image:'/demo/textiles.jpg',price:'Precio de ejemplo: desde $25.000',whatsapp:null,demo:true },
  { id:'demo-plantas',name:'Brote Urbano',person:'Emprendedora de ejemplo 04',category:'Jardinería',description:'Un pequeño rincón verde para todos los días. Ideas para comenzar a cultivar y disfrutar de la jardinería.\n\nProductos de ejemplo: kits de cultivo, maceteros y accesorios de jardinería.\n\nEsta ficha es ficticia y solo muestra cómo se verá un emprendimiento en el catálogo.',image:'/demo/plantas.jpg',price:'Precio de ejemplo: desde $8.000',whatsapp:null,demo:true },
  { id:'demo-joyeria',name:'Pequeños Tesoros',person:'Emprendedora de ejemplo 05',category:'Accesorios',description:'Detalles que acompañan tu estilo. Una selección de accesorios para regalar o elegir para ti.\n\nProductos de ejemplo: aros, collares y conjuntos de accesorios.\n\nEsta ficha es ficticia y solo muestra cómo se verá un emprendimiento en el catálogo.',image:'/demo/joyeria.jpg',price:'Precio de ejemplo: desde $12.000',whatsapp:null,demo:true },
  { id:'demo-gastronomia',name:'Sabores de Casa',person:'Emprendedora de ejemplo 06',category:'Gastronomía',description:'Comida para compartir alrededor de una misma mesa. Una propuesta de preparaciones para encuentros y ocasiones especiales.\n\nProductos de ejemplo: almuerzos, ensaladas y menús para reuniones.\n\nEsta ficha es ficticia y solo muestra cómo se verá un emprendimiento en el catálogo.',image:'/demo/gastronomia.jpg',price:'Precio de ejemplo: desde $7.500',whatsapp:null,demo:true },
];

export function catalogImage(image: string) {
  return image.startsWith('/demo/') ? image : '/api/images/' + image;
}
