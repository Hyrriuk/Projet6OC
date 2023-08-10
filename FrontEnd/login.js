document.addEventListener("DOMContentLoaded", () => {
    // Sélection de l'élément form à l'intérieur de l'élément avec l'id "login"
    const loginForm = document.querySelector("#login form");
    const errorMessageElement = document.getElementById("error__message");
    // Ajout d'un gestionnaire d'événement pour le formulaire lors de la soumission
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche l'envoi normal du formulaire

        // Récupération des valeurs des champs email et password du formulaire
        const logInput = {
            email: document.querySelector("#email").value,
            password: document.querySelector("#password").value,
        };

        // Appeler la fonction fetchLogin pour se connecter en utilisant les valeurs saisies
        await fetchLogin(logInput, loginForm, errorMessageElement);
    });
});

// Fonction asynchrone pour effectuer une requête de connexion à l'API
async function fetchLogin(logInput, loginForm, errorMessageElement) {
    try {
        // Envoie une requête POST à l'URL de connexion avec les données de connexion
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(logInput), // Convertit les données en format JSON pour l'envoi
        });

        // Vérifie si la réponse n'est pas OK
        if (!response.ok) {
            if (response.status == 401 || response.status == 404) {
                errorMessageElement.textContent = "Email ou mot de passe incorrect.";
                errorMessageElement.style.color = "red";
                loginForm.classList.add("shake"); // Ajoute la classe de tremblement
                setTimeout(() => {
                    loginForm.classList.remove("shake"); // Supprime la classe de tremblement après un délai
                }, 500); // Délai en millisecondes pour le tremblemen
            } else {
                errorMessageElement.textContent = "Erreur lors de la connexion";
            }
        } else {
            errorMessageElement.textContent = ""; // Réinitialise le message d'erreur si la connexion réussit}

            // Extraction des données JSON de la réponse
            const data = await response.json();

            // Vérifier si l'API a renvoyé un token valide
            if (data && data.token) {
                // Si un token est présent dans les données, le stocke dans le local storage du navigateur
                window.localStorage.setItem("token", data.token);

                // Redirige vers la page "index.html" après une connexion réussie
                window.location.href = "index.html";
            }
        }
    } catch (error) {
        console.error(error);
    }
}
