# tests/load/locustfile.py
from locust import HttpUser, task, between
import random

# La liste des villes est maintenant directement dans ce fichier
# pour éviter les problèmes d'importation.
CITIES = [
    "Paris", "London", "Berlin", "Madrid", "Rome", "Moscow", "Istanbul",
    "Tokyo", "Sydney", "New York", "Los Angeles", "Chicago", "Toronto",
    "Buenos Aires", "Sao Paulo", "Cairo", "Lagos", "Beijing", "Shanghai",
    "Mumbai", "Delhi", "Jakarta"
]

class WebsiteUser(HttpUser):
    """
    Simule un utilisateur qui navigue sur l'API météo.
    """
    # Temps d'attente entre l'exécution de chaque nouvelle tâche (1 à 3 secondes)
    wait_time = between(1, 3)
    
    # L'hôte de l'API sera spécifié au lancement de Locust
    # Exemple: locust -f locustfile.py --host=http://localhost:3000
    
    def on_start(self):
        """Exécuté une fois par utilisateur simulé au démarrage."""
        print("Un nouvel utilisateur commence son parcours...")

    @task
    def weather_scenario(self):
        """
        Un scénario utilisateur complet: consulte la météo actuelle, 
        puis les prévisions, et parfois l'historique.
        """
        # 1. Choisir une ville au hasard
        city = random.choice(CITIES)

        # 2. Consulter la météo actuelle
        with self.client.get(f"/weather/current/{city}", 
                             name="/weather/current/[city]",  # Regroupe les stats dans l'UI
                             catch_response=True) as response:
            if not response.ok:
                response.failure(f"Could not get current weather for {city}")
                return # Arrêter ce scénario si la première étape échoue
            
        # 3. Si succès, consulter les prévisions (forte probabilité)
        with self.client.get(f"/weather/forecast/{city}",
                             name="/weather/forecast/[city]",
                             catch_response=True) as response:
            if not response.ok:
                response.failure(f"Could not get forecast for {city}")

        # 4. Consulter l'historique (faible probabilité, 10% des cas)
        if random.random() < 0.1:
            with self.client.get(f"/weather/history/{city}",
                                 name="/weather/history/[city]",
                                 catch_response=True) as response:
                if not response.ok:
                    response.failure(f"Could not get history for {city}")

    @task(1) # Poids faible, tâche exécutée moins souvent
    def health_check(self):
        """Vérifie l'endpoint /health de temps en temps."""
        self.client.get("/health", name="/health") 