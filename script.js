// Clase Nodo
class Nodo {
    constructor(isbn, titulo, autor, descripcion) {
        this.isbn = isbn;
        this.titulo = titulo;
        this.autor = autor;
        this.descripcion = descripcion;
        this.izquierda = null;
        this.derecha = null;
    }
}

// Clase Árbol de Búsqueda Binario
class ArbolBinarioBusqueda {
    constructor() {
        this.raiz = null;
    }

    // Método para insertar un nuevo nodo
    insertar(isbn, titulo, autor, descripcion) {
        const nuevoNodo = new Nodo(isbn, titulo, autor, descripcion);
        if (this.raiz === null) {
            this.raiz = nuevoNodo;
        } else {
            this._insertarNodo(this.raiz, nuevoNodo);
        }
    }

    _insertarNodo(nodo, nuevoNodo) {
        if (nuevoNodo.isbn < nodo.isbn) {
            if (nodo.izquierda === null) {
                nodo.izquierda = nuevoNodo;
            } else {
                this._insertarNodo(nodo.izquierda, nuevoNodo);
            }
        } else {
            if (nodo.derecha === null) {
                nodo.derecha = nuevoNodo;
            } else {
                this._insertarNodo(nodo.derecha, nuevoNodo);
            }
        }
    }

    // Método para buscar un nodo
    buscar(isbn) {
        return this._buscarNodo(this.raiz, isbn);
    }

    _buscarNodo(nodo, isbn) {
        if (nodo === null) return null;
        if (isbn === nodo.isbn) return nodo;
        return isbn < nodo.isbn
            ? this._buscarNodo(nodo.izquierda, isbn)
            : this._buscarNodo(nodo.derecha, isbn);
    }

    // Método para eliminar un nodo
    eliminar(isbn) {
        this.raiz = this._eliminarNodo(this.raiz, isbn);
    }

    _eliminarNodo(nodo, isbn) {
        if (nodo === null) return null;

        if (isbn < nodo.isbn) {
            nodo.izquierda = this._eliminarNodo(nodo.izquierda, isbn);
            return nodo;
        } else if (isbn > nodo.isbn) {
            nodo.derecha = this._eliminarNodo(nodo.derecha, isbn);
            return nodo;
        } else {
            // Caso 1: Nodo sin hijos
            if (nodo.izquierda === null && nodo.derecha === null) {
                return null;
            }
            // Caso 2: Nodo con un solo hijo
            if (nodo.izquierda === null) {
                return nodo.derecha;
            } else if (nodo.derecha === null) {
                return nodo.izquierda;
            }
            // Caso 3: Nodo con dos hijos
            const nodoMinimo = this._encontrarMinimo(nodo.derecha);
            nodo.isbn = nodoMinimo.isbn;
            nodo.titulo = nodoMinimo.titulo;
            nodo.autor = nodoMinimo.autor;
            nodo.descripcion = nodoMinimo.descripcion;
            nodo.derecha = this._eliminarNodo(nodo.derecha, nodoMinimo.isbn);
            return nodo;
        }
    }

    _encontrarMinimo(nodo) {
        while (nodo.izquierda !== null) {
            nodo = nodo.izquierda;
        }
        return nodo;
    }

    // Método para mostrar nodos en orden (In-Order)
    mostrarOrdenado() {
        const libros = [];
        this._inOrden(this.raiz, libros);
        return libros;
    }

    _inOrden(nodo, libros) {
        if (nodo !== null) {
            this._inOrden(nodo.izquierda, libros);
            libros.push(nodo);
            this._inOrden(nodo.derecha, libros);
        }
    }
}

// Instancia del árbol
const arbolLibros = new ArbolBinarioBusqueda();

// Función para interactuar con Google Books API
async function buscarDatosAPI(isbn) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.totalItems > 0) {
            const libro = data.items[0].volumeInfo;
            return {
                titulo: libro.title || "Título no disponible",
                autor: libro.authors ? libro.authors.join(", ") : "Autor no disponible",
                descripcion: libro.description || "Descripción no disponible",
            };
        } else {
            alert("No se encontraron datos para este ISBN.");
            return null;
        }
    } catch (error) {
        console.error("Error al buscar datos en la API:", error);
        alert("Ocurrió un error al buscar datos.");
        return null;
    }
}

// Evento para buscar datos automáticamente
document.getElementById("isbn").addEventListener("input", async () => {
    const isbn = document.getElementById("isbn").value;
    if (isbn.length === 13) {
        const datos = await buscarDatosAPI(isbn);
        if (datos) {
            document.getElementById("titulo").value = datos.titulo;
            document.getElementById("autor").value = datos.autor;
            document.getElementById("descripcion").value = datos.descripcion;
        }
    }
});

// Agregar libro al árbol
document.getElementById("formLibro").addEventListener("submit", (e) => {
    e.preventDefault();
    const isbn = parseInt(document.getElementById("isbn").value);
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const descripcion = document.getElementById("descripcion").value;

    arbolLibros.insertar(isbn, titulo, autor, descripcion);
    alert("Libro agregado con éxito.");
    e.target.reset();
});

// Buscar libro en el árbol
document.getElementById("buscarLibro").addEventListener("click", () => {
    const isbn = parseInt(document.getElementById("isbnBuscar").value);
    const libro = arbolLibros.buscar(isbn);
    const resultadoCatalogo = document.getElementById("resultadoCatalogo");
    resultadoCatalogo.innerHTML = ""; // Limpiar resultados
    if (libro) {
        const li = document.createElement("li");
        li.textContent = `ISBN: ${libro.isbn}, Título: ${libro.titulo}, Autor: ${libro.autor}, Descripción: ${libro.descripcion}`;
        resultadoCatalogo.appendChild(li);
    } else {
        resultadoCatalogo.textContent = "Libro no encontrado.";
    }
});

// Eliminar libro del árbol
document.getElementById("eliminarLibro").addEventListener("click", () => {
    const isbn = parseInt(document.getElementById("isbnEliminar").value);
    if (!isbn) {
        alert("Por favor, ingresa un ISBN válido.");
        return;
    }
    arbolLibros.eliminar(isbn);
    alert("Libro eliminado (si existía).");
    document.getElementById("isbnEliminar").value = "";
});

// Mostrar catálogo ordenado
document.getElementById("mostrarCatalogo").addEventListener("click", () => {
    const resultadoCatalogo = document.getElementById("resultadoCatalogo");
    resultadoCatalogo.innerHTML = ""; // Limpiar resultados
    const libros = arbolLibros.mostrarOrdenado();
    libros.forEach((libro) => {
        const li = document.createElement("li");
        li.textContent = `ISBN: ${libro.isbn}, Título: ${libro.titulo}, Autor: ${libro.autor}, Descripción: ${libro.descripcion}`;
        resultadoCatalogo.appendChild(li);
    });
});
