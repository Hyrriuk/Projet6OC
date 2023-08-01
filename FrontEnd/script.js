document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery");
    const filters = document.querySelector(".filters");
    let activeFilter = "Tous";

    // fonction pour récupérer les projets de l'architecte depuis l'API
    async function fetchProjects() {
        // async permet d'utiliser await
        try {
            const response = await fetch("http://localhost:5678/api/works"); // await permet d'attendre la réponse du fetch (promesse)
            if (!response.ok) {
                // response.ok permet de confirmer que la variable response a eu un code entre 200 et 299 donc succès de la promesse du fetch
                throw new Error("Erreur lors de la récupération des projets");
            }
            const projects = await response.json(); //extraction donnée json sous forme d'objet dans variable projects
            return projects;
        } catch (error) {
            console.error("Erreur : ", error);
            return [];
        }
    }

    // fonction pour construire les éléments HTML pour chaque projet et les ajouter à la galerie
    async function buildGallery() {
        gallery.innerHTML = ""; // Supprime le contenu existant dans la galerie
        const projects = await fetchProjects(); // Récupère les projets depuis l'API
        const categoryNames = [];
        projects.forEach((project) => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            const figcaption = document.createElement("figcaption");

            img.src = project.imageUrl;
            img.alt = project.title;
            figcaption.textContent = project.title;

            figure.setAttribute("data-category-name", project.category.name); // ajout de class data-category-id et ajout via l'api du categoryId
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);

            if (!categoryNames.includes(project.category.name)) {
                categoryNames.push(project.category.name);
            }
        });

        console.log(categoryNames);
        function handleButtonClick(categoryName) {
            setActiveFilter(categoryName);
        }

        categoryNames.forEach((myName) => {
            const filterButton = document.createElement("button");
            filterButton.textContent = myName;
            filterButton.setAttribute("data-category-name", myName);
            filterButton.addEventListener("click", () => {
                handleButtonClick(myName);
            });
            filters.appendChild(filterButton);
        });

        const showAllButton = document.createElement("button");
        showAllButton.textContent = "Tous";
        showAllButton.setAttribute("data-category-name", "Tous");
        showAllButton.addEventListener("click", () => {
            handleButtonClick("Tous");
        });
        filters.prepend(showAllButton);
    }

    function filterProjectsByCategoryName(categoryName) {
        const allFigureElements = gallery.querySelectorAll("figure");
        allFigureElements.forEach((figure) => {
            const figureCategoryName = figure.getAttribute("data-category-name");
            if (figureCategoryName === categoryName || categoryName === "Tous") {
                figure.style.display = "block";
            } else {
                figure.style.display = "none";
            }
        });
    }
    function setActiveFilter(categoryName) {
        activeFilter = categoryName;
        filterProjectsByCategoryName(categoryName);
        updateActiveButton();
    }

    function updateActiveButton() {
        const filterButtons = filters.querySelectorAll("button");
        filterButtons.forEach((button) => {
            if (button.textContent === activeFilter) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }
    setActiveFilter("Tous");

    // Appelle buildGallery pour récupérer les projets, créer les éléments HTML et les ajouter à la galerie
    buildGallery();
});
