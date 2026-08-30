// ==========================================
// ANIMERANK - BUSCADOR DE ANIME
// ==========================================

async function buscarAnime() {

    const input = document.querySelector(".barra-busqueda input");
    const resultados = document.querySelector(".resultados-busqueda");

    const texto = input.value.trim();

    if (!texto) {
        resultados.innerHTML = "<p>Escribe el nombre de un anime.</p>";
        return;
    }

    resultados.innerHTML = "<p>🔎 Buscando anime...</p>";

    const query = `
        query ($search: String) {
            Page(perPage: 12) {
                media(
                    search: $search,
                    type: ANIME,
                    sort: SEARCH_MATCH
                ) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    coverImage {
                        large
                    }
                    averageScore
                    episodes
                    seasonYear
                    genres
                    description(asHtml: false)
                }
            }
        }
    `;

    try {

        const respuesta = await fetch("https://graphql.anilist.co", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                query: query,
                variables: {
                    search: texto
                }
            })
        });

        const datos = await respuesta.json();

        const animes = datos.data.Page.media;

        if (animes.length === 0) {
            resultados.innerHTML = `
                <p>No encontramos animes relacionados con "${texto}".</p>
            `;
            return;
        }

        resultados.innerHTML = "";

        animes.forEach(anime => {

            const tarjeta = document.createElement("article");

            tarjeta.className = "tarjeta-anime";

            const titulo =
                anime.title.english ||
                anime.title.romaji ||
                anime.title.native ||
                "Sin título";

            const puntuacion =
                anime.averageScore
                ? (anime.averageScore / 10).toFixed(1)
                : "N/A";

            const descripcion =
                anime.description
                ? anime.description.replace(/<[^>]*>/g, "").slice(0, 180) + "..."
                : "Sin descripción disponible.";

            tarjeta.innerHTML = `
                <img
                    src="${anime.coverImage.large}"
                    alt="${titulo}"
                >

                <div class="informacion-anime">

                    <h3>${titulo}</h3>

                    <p>⭐ ${puntuacion}/10</p>

                    <p>📅 ${anime.seasonYear || "Año desconocido"}</p>

                    <p>🎬 ${anime.episodes || "?"} episodios</p>

                    <p class="generos-anime">
                        ${anime.genres.slice(0, 3).join(" • ")}
                    </p>

                    <p class="descripcion-anime">
                        ${descripcion}
                    </p>

                </div>
            `;

            resultados.appendChild(tarjeta);
        });

    } catch (error) {

        console.error(error);

        resultados.innerHTML = `
            <p>❌ Ha ocurrido un error al buscar. Inténtalo de nuevo.</p>
        `;
    }
}


// ==========================================
// BOTÓN BUSCAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const boton = document.querySelector(".barra-busqueda button");

    if (boton) {
        boton.addEventListener("click", buscarAnime);
    }

});
