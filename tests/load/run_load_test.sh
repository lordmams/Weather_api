#!/bin/bash

# Script de test de charge automatisé pour l'API météo
# Usage: ./run_load_test.sh [scenario]

set -e

# Configuration
API_HOST="http://localhost:3000"
LOCUST_FILE="locustfile.py"
REPORTS_DIR="reports"

# Créer le dossier des rapports
mkdir -p $REPORTS_DIR

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [scenario]"
    echo ""
    echo "Scénarios disponibles:"
    echo "  smoke     - Test rapide (10 utilisateurs, 1 minute)"
    echo "  load      - Test de charge normal (50 utilisateurs, 5 minutes)"
    echo "  stress    - Test de stress (100 utilisateurs, 10 minutes)"
    echo "  spike     - Test de pic (200 utilisateurs, 2 minutes)"
    echo "  endurance - Test d'endurance (30 utilisateurs, 30 minutes)"
    echo ""
    echo "Exemples:"
    echo "  $0 smoke"
    echo "  $0 stress"
}

# Vérifier que l'API est accessible
check_api() {
    echo "🔍 Vérification de l'API..."
    if curl -s "$API_HOST/health" > /dev/null; then
        echo "✅ API accessible sur $API_HOST"
    else
        echo "❌ API non accessible sur $API_HOST"
        echo "Assurez-vous que l'API est démarrée avec: npm start"
        exit 1
    fi
}

# Exécuter le test de charge
run_test() {
    local scenario=$1
    local users=$2
    local spawn_rate=$3
    local duration=$4
    local report_file="$REPORTS_DIR/load_test_${scenario}_$(date +%Y%m%d_%H%M%S).html"
    
    echo "🚀 Démarrage du test de charge: $scenario"
    echo "   Utilisateurs: $users"
    echo "   Taux de spawn: $spawn_rate/s"
    echo "   Durée: $duration"
    echo "   Rapport: $report_file"
    echo ""
    
    locust -f $LOCUST_FILE \
           --host=$API_HOST \
           --users=$users \
           --spawn-rate=$spawn_rate \
           --run-time=$duration \
           --headless \
           --html=$report_file \
           --logfile="$REPORTS_DIR/locust_${scenario}.log"
    
    echo ""
    echo "✅ Test terminé. Rapport généré: $report_file"
}

# Scénarios de test
case "${1:-help}" in
    "smoke")
        check_api
        run_test "smoke" 10 2 "1m"
        ;;
    "load")
        check_api
        run_test "load" 50 5 "5m"
        ;;
    "stress")
        check_api
        run_test "stress" 100 10 "10m"
        ;;
    "spike")
        check_api
        run_test "spike" 200 20 "2m"
        ;;
    "endurance")
        check_api
        run_test "endurance" 30 3 "30m"
        ;;
    "all")
        check_api
        echo "🧪 Exécution de tous les scénarios..."
        run_test "smoke" 10 2 "1m"
        sleep 30
        run_test "load" 50 5 "5m"
        sleep 60
        run_test "stress" 100 10 "10m"
        sleep 60
        run_test "spike" 200 20 "2m"
        sleep 60
        run_test "endurance" 30 3 "30m"
        echo "🎉 Tous les tests sont terminés!"
        ;;
    *)
        show_help
        exit 1
        ;;
esac

echo ""
echo "📊 Résumé des tests disponibles dans: $REPORTS_DIR/"
ls -la $REPORTS_DIR/*.html 2>/dev/null || echo "Aucun rapport généré" 