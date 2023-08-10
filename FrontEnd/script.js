document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery");
    const filters = document.querySelector(".filters");
    const token = window.localStorage.getItem("token");
    const modeAdmin = document.querySelector(".mode__edition__bar");
    const loginButton = document.getElementById("login__button");
    const publierButton = document.getElementById("publier__button");
    const modal = document.getElementById("modal");
    const closeModalButton = document.querySelector(".close__button");
    const addPhotoButtonFirstModal = document.getElementById("add__photo__form");
    const addPhotoModal = document.getElementById("add__photo__modal");
    const closeModalButtonAddPhotoModal = addPhotoModal.querySelector(".close__button");
    const imageInput = document.getElementById("image__input");
    const uploadLabel = document.getElementById("upload__label");
    const uploadedImageContainer = document.getElementById("uploaded__image__container");
    let newlyAddedProject;

    // Variable pour stocker le filtre actif, initialise avec "Tous"
    let activeFilter = "Tous";

    // Fonction pour récupérer les projets de l'architecte depuis l'API
    async function fetchProjects() {
        try {
            // Envoie une requête GET à l'URL de l'API pour récupérer les projets
            const response = await fetch("http://localhost:5678/api/works");

            // Vérifie si la réponse est OK (code de statut entre 200 et 299)
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des projets");
            }

            // Extraction des données JSON et stockage dans la variable projects
            const projects = await response.json();
            return projects;
        } catch (error) {
            // En cas d'erreur, affiche l'erreur dans la console et retourne un tableau vide
            console.error("Erreur : ", error);
            return [];
        }
    }

    // Fonction pour construire les éléments HTML pour chaque projet et les ajouter à la galerie
    async function buildGallery() {
        // Supprime le contenu existant dans la galerie
        gallery.innerHTML = "";

        // Récupère les projets depuis l'API en utilisant fetchProjects()
        const projects = await fetchProjects();

        // Tableau pour stocker les noms de catégories uniques
        const categories = [];

        // Parcourt chaque projet pour construire les éléments HTML correspondants
        projects.forEach((project) => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            const figcaption = document.createElement("figcaption");

            img.src = project.imageUrl;
            img.alt = project.title;
            figcaption.textContent = project.title;

            // Ajoute la catégorie du projet comme attribut personnalisé "data-category-name"
            figure.setAttribute("data-category-name", project.category.name);
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);

            // Vérifie si le nom de catégorie n'est pas déjà présent dans categoryNames, si non, l'ajoute
            if (!categories.some((category) => category.id === project.category.id)) {
                categories.push(project.category);
            }
        });

        // Fonction pour gérer le clic sur un bouton de filtre
        function handleButtonClick(categoryName) {
            setActiveFilter(categoryName);
        }

        // Crée et ajoute les boutons de filtre pour chaque catégorie unique
        categories.forEach((category) => {
            const filterButton = document.createElement("button");
            filterButton.textContent = category.name;
            filterButton.setAttribute("data-category-name", category.name);
            filterButton.setAttribute("data-category-id", category.id);
            // Ajoute un événement de clic pour chaque bouton de filtre
            filterButton.addEventListener("click", () => {
                handleButtonClick(category.name);
            });
            filters.appendChild(filterButton);
        });

        // Crée un bouton "Tous" pour afficher tous les projets
        const showAllButton = document.createElement("button");
        showAllButton.textContent = "Tous";
        showAllButton.setAttribute("data-category-name", "Tous");
        // Ajoute un événement de clic pour le bouton "Tous"
        showAllButton.addEventListener("click", () => {
            handleButtonClick("Tous");
        });
        // Ajoute la classe "active" au bouton "Tous" par défaut
        showAllButton.classList.add("active");
        filters.prepend(showAllButton);
    }

    // Fonction pour filtrer les projets en fonction de la catégorie sélectionnée
    function filterProjectsByCategoryName(categoryId) {
        // Sélectionne tous les éléments "figure" de la galerie
        const allFigureElements = gallery.querySelectorAll("figure");
        allFigureElements.forEach((figure) => {
            // Récupère la catégorie de chaque projet depuis l'attribut "data-category-name"
            const figureCategoryId = figure.getAttribute("data-category-name");
            // Affiche les projets ayant la même catégorie que la catégorie sélectionnée ou tous les projets si "Tous" est sélectionné
            if (figureCategoryId === categoryId || categoryId === "Tous") {
                figure.style.display = "block";
            } else {
                figure.style.display = "none";
            }
        });
    }

    // Fonction pour définir le filtre actif et mettre à jour les projets affichés
    function setActiveFilter(categoryName) {
        activeFilter = categoryName;
        // Filtre les projets en fonction de la catégorie sélectionnée
        filterProjectsByCategoryName(categoryName);
        // Met à jour l'apparence des boutons de filtre actifs
        updateActiveButton();
    }

    // Fonction pour mettre à jour l'apparence des boutons de filtre actifs
    function updateActiveButton() {
        // Sélectionne tous les boutons de filtre
        const filterButtons = filters.querySelectorAll("button");
        filterButtons.forEach((button) => {
            // Ajoute la classe "active" au bouton si son texte correspond au filtre actif, sinon, la classe est retirée
            if (button.textContent === activeFilter) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }

    // Fonction pour supprimer un projet en utilisant l'API et en actualisant le DOM
    function deleteProject(projectId) {
        // Construire l'URL pour la suppression du projet avec l'ID
        const deleteUrl = `http://localhost:5678/api/works/${projectId}`;

        // Faire la requête DELETE à l'API pour supprimer le projet
        fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    // Projet supprimé avec succès, mettre à jour la liste des projets dans la modale
                    updateProjectListInModal();
                } else {
                    throw new Error("Erreur lors de la suppression du projet");
                }
            })
            .catch((error) => {
                console.error("Erreur : ", error);
            });
    }

    function updateProjectListInModal() {
        const projectListContainer = document.querySelector(".project__list");

        projectListContainer.innerHTML = ""; // Supprimer le contenu précédent

        // Récupérer les projets depuis l'API
        fetchProjects()
            .then((projects) => {
                projects.forEach((project) => {
                    const projectContainer = document.createElement("div");
                    const img = document.createElement("img");
                    const deleteIcon = document.createElement("i");
                    deleteIcon.classList.add("fa-solid", "fa-trash-can");
                    img.src = project.imageUrl; // Spécifier la source de l'image
                    img.alt = project.title; // Spécifier l'attribut alt de l'image

                    deleteIcon.addEventListener("click", () => {
                        const projectId = projectContainer.getAttribute("data-project-id");
                        deleteProject(projectId);
                    });
                    projectListContainer.appendChild(projectContainer);
                    projectContainer.appendChild(img);
                    projectContainer.appendChild(deleteIcon);
                    projectContainer.setAttribute("data-project-id", project.id);
                });
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des projets :", error);
            });
    }

    if (token) {
        modeAdmin.style.display = "block"; // Afficher la barre de mode édition

        publierButton.addEventListener("click", () => {
            updateProjectListInModal();
            modal.style.display = "block";
        });

        closeModalButton.addEventListener("click", () => {
            modal.style.display = "none";
        });

        addPhotoButtonFirstModal.addEventListener("click", () => {
            modal.style.display = "none";
            addPhotoModal.style.display = "block";
        });

        closeModalButtonAddPhotoModal.addEventListener("click", () => {
            addPhotoModal.style.display = "none";
            modal.style.display = "block";
        });

        loginButton.innerHTML = "logout";
        loginButton.addEventListener("click", () => {
            // Retirer le token du local storage
            window.localStorage.removeItem("token");
            // Recharger la page
            location.reload();
        });
    } else {
        modeAdmin.style.display = "none"; // Cacher la barre de mode édition

        loginButton.innerHTML = "login";
        loginButton.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }

    // Gérer l'événement de changement de fichier
    imageInput.addEventListener("input", (event) => {
        const selectedImage = event.target.files[0];
        if (selectedImage) {
            console.log("Image sélectionnée :", selectedImage);
            const uploadedImage = document.createElement("img");
            uploadedImage.src = URL.createObjectURL(selectedImage);
            uploadedImage.alt = "Image téléchargée";
            uploadedImage.classList.add("uploaded__image");
            // Effacez tout contenu précédent du conteneur
            uploadedImageContainer.innerHTML = "";

            // Ajoutez l'image téléchargée au conteneur
            uploadedImageContainer.appendChild(uploadedImage);
            const uploadInfo = document.getElementById("upload__info");
            uploadInfo.style.display = "none";

            // Affichez le conteneur de l'image
            uploadedImageContainer.style.display = "block";
            imageInput.value = null;
        } else {
            // Si aucun fichier n'est sélectionné, cachez le conteneur de l'image
            uploadedImageContainer.style.display = "none";
        }
        // Réinitialiser l'élément d'entrée de fichier pour permettre de choisir d'autres images
    });
    // Appelle setActiveFilter avec "Tous" pour initialiser la galerie avec tous les projets au démarrage
    setActiveFilter("Tous");

    // Appelle buildGallery pour récupérer les projets, créer les éléments HTML et les ajouter à la galerie
    buildGallery();
});
