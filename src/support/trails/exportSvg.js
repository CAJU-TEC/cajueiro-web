/**
 * Exporta um <svg> da página como PNG, no navegador.
 *
 * O pôster do "Meu Cajueiro" é auto-contido (gradientes, filtros e fontes por
 * atributo), então serializar o nó e desenhá-lo num canvas produz exatamente a
 * mesma imagem que está na tela. Nada de biblioteca e nada de servidor.
 */
export async function svgToPngBlob(svgElement, width, height) {
  if (!svgElement) throw new Error('SVG não encontrado para exportar.');

  const clone = svgElement.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);

  const source = new XMLSerializer().serializeToString(clone);
  // encodeURIComponent + unescape trata os acentos sem quebrar o base64.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

  const image = await loadImage(url);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível gerar a imagem.'))),
      'image/png'
    );
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível desenhar o cajueiro.'));
    image.src = src;
  });
}
