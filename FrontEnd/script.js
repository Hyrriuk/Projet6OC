const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const token = window.localStorage.getItem("token");
const modeAdmin = document.querySelector(".mode__edition__bar");
const loginButton = document.getElementById("login__button");
const publierButton = document.getElementById("modifier__button");
const publierButtonTwo = document.querySelector(".modifier__under__image");
const modal = document.getElementById("modal");
const closeModalButton = document.querySelector(".close__button");
const addPhotoButtonFirstModal = document.getElementById("open__add__photo__form");
const addPhotoModal = document.getElementById("add__photo__modal");
const validateProject = document.getElementById("validate__project");
const closeModalButtonAddPhotoModal = addPhotoModal.querySelector(".close__button");
const imageInput = document.getElementById("image__input");
const uploadIcon = document.querySelector(".uploaded__image__container__icon");
const uploadLabel = document.getElementById("upload__label");
const uploadInfo = document.getElementById("upload__info");
const uploadedImageContainer = document.getElementById("uploaded__image__container");
const validateError = document.querySelector(".error__message");

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
    filters.innerHTML = "";

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

// Fonction pour gérer le clic sur un bouton de filtre
function handleButtonClick(categoryName) {
    setActiveFilter(categoryName);
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
                buildGallery();
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
        buildGallery();
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
        document.getElementById("title").value = "";
        document.getElementById("categorie").selectedIndex = 0;
        imageInput.value = null;
        uploadedImageContainer.innerHTML = "";
        uploadIcon.style.display = "block";
        uploadLabel.style.display = "block";
        uploadInfo.style.display = "block";
        validateError.style.display = "none";
        validateProject.classList.remove("shake");

        addPhotoModal.style.display = "none";
    });

    loginButton.innerHTML = "logout";
    loginButton.addEventListener("click", () => {
        // Retirer le token du local storage
        window.localStorage.removeItem("token");
        // Recharger la page
        location.reload();
    });

    publierButton.style.display = "block";
    publierButtonTwo.style.display = "block";
} else {
    modeAdmin.style.display = "none"; // Cacher la barre de mode édition

    loginButton.innerHTML = "login";
    loginButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}

// Gérer l'événement de changement de fichier
imageInput.addEventListener("change", (event) => {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
        const uploadedImage = document.createElement("img");
        uploadedImage.src = URL.createObjectURL(selectedImage);
        uploadedImage.alt = "Image téléchargée";
        uploadedImage.classList.add("uploaded__image");
        // Effacez tout contenu précédent du conteneur
        uploadedImageContainer.innerHTML = "";

        // Ajoutez l'image téléchargée au conteneur
        uploadedImageContainer.appendChild(uploadedImage);
        uploadIcon.style.display = "none";
        uploadLabel.style.display = "none";
        uploadInfo.style.display = "none";

        // Affichez le conteneur de l'image
        uploadedImageContainer.style.display = "block";
    }
});

validateProject.addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const categoryId = document.getElementById("categorie").value;
    const selectedImage = imageInput.files[0];
    const projectData = new FormData();
    projectData.append("title", title);
    projectData.append("image", selectedImage);
    projectData.append("category", categoryId);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: projectData,
        });

        if (!response.ok) {
            throw new Error("Erreur lors de l'ajout du projet");
        }

        // Réinitialise les champs du formulaire
        document.getElementById("title").value = "";
        document.getElementById("categorie").selectedIndex = 0;
        imageInput.value = null;
        uploadedImageContainer.innerHTML = "";
        uploadIcon.style.display = "block";
        uploadLabel.style.display = "block";
        uploadInfo.style.display = "block";
        validateError.style.display = "none";
        validateProject.classList.remove("shake");

        addPhotoModal.style.display = "none";
        buildGallery();
    } catch (error) {
        validateError.style.display = "flex";
        validateProject.classList.add("shake");
    }
});

async function fillCategoryOptions() {
    try {
        // Fetch les catégories depuis l'API
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des catégories");
        }
        const categories = await response.json();

        const categorieSelect = document.getElementById("categorie");

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorieSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
    }
}

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }

    if (event.target === addPhotoModal) {
        addPhotoModal.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Appelle fillCategoryOptions pour ajouter les catégories dans le menu déroulant
    fillCategoryOptions();

    // Appelle setActiveFilter avec "Tous" pour initialiser la galerie avec tous les projets au démarrage
    setActiveFilter("Tous");

    // Appelle buildGallery pour récupérer les projets, créer les éléments HTML et les ajouter à la galerie
    buildGallery();
});
