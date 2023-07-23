document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery");

    // Fonction pour récupérer les projets de l'architecte depuis l'API
    async function fetchProjects() {
        try {
            const response = await fetch("http://localhost:5678/api/works"); // Remplace l'URL par l'adresse réelle de l'API
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des projets");
            }
            const projects = await response.json();
            return projects;
        } catch (error) {
            console.error("Erreur : ", error);
            return [];
        }
    }

    // Fonction pour construire les éléments HTML pour chaque projet et les ajouter à la galerie
    function buildGallery(projects) {
        gallery.innerHTML = ""; // Supprime le contenu existant dans la galerie

        projects.forEach((project) => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            const figcaption = document.createElement("figcaption");

            img.src = project.imageUrl; // Assure-toi que la propriété image correspond à l'URL de l'image dans la réponse de l'API
            img.alt = project.title; // Assure-toi que la propriété title correspond au titre du projet dans la réponse de l'API
            figcaption.textContent = project.title; // Assure-toi que la propriété title correspond au titre du projet dans la réponse de l'API

            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
        });
    }

    // Appelle fetchProjects pour récupérer les projets et les ajouter à la galerie
    fetchProjects().then((projects) => buildGallery(projects));
});
