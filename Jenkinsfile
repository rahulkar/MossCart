pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 45, unit: 'MINUTES')
  }

  // Reuse the stack from `docker compose up`. COMPOSE_PROJECT_NAME comes from jenkins-demo env MOSSCART_DOCKER_PROJECT (default mosscart matches docker-compose `name:`).
  environment {
    COMPOSE_PROJECT_NAME = "${env.MOSSCART_DOCKER_PROJECT ?: 'mosscart'}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('UI tests (reuse running stack)') {
      steps {
        sh """
          set -e
          export COMPOSE_PROJECT_NAME='${env.MOSSCART_DOCKER_PROJECT ?: 'mosscart'}'
          WS='${env.WORKSPACE}'
          P="\$(echo "\$COMPOSE_PROJECT_NAME" | tr '[:upper:]' '[:lower:]')"
          NW="\${P}_default"
          MVN_IMAGE='maven:3.9.9-eclipse-temurin-17'
          echo "=== MossCart CI: reuse stack; Maven tests via docker cp (no host bind mount) ==="
          cd /workspace/mosscart
          echo "Compose project network: \$NW"
          echo "Waiting for API via existing web container..."
          for i in \$(seq 1 60); do
            if docker compose exec -T web wget -qO- http://127.0.0.1/api/health 2>/dev/null | grep -q '"ok":true'; then
              echo "API healthy"
              break
            fi
            sleep 2
            if [ "\$i" -eq 60 ]; then
              echo "Is the main stack up? From the repo host run: docker compose up -d"
              docker compose ps || true
              exit 1
            fi
          done
          cid=\$(docker run -d --network "\$NW" \\
            -e BASE_URL=http://web:80 \\
            -e SELENIUM_REMOTE_URL=http://selenium:4444 \\
            -e HEADLESS=1 \\
            "\$MVN_IMAGE" sleep 7200)
          docker exec "\$cid" mkdir -p /workspace/test_automation
          docker cp "\$WS/test_automation/." "\$cid:/workspace/test_automation/"
          set +e
          docker exec -w /workspace/test_automation "\$cid" mvn -B clean test \\
            -Dcucumber.execution.parallel.enabled=false
          MVN_RC=\$?
          set -e
          mkdir -p "\$WS/test_automation/target"
          docker cp "\$cid:/workspace/test_automation/target/." "\$WS/test_automation/target/" 2>/dev/null || true
          docker rm -f "\$cid" >/dev/null
          exit \$MVN_RC
        """
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test_automation/target/surefire-reports/**/*.xml'
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'test_automation/target',
            reportFiles: 'cucumber-report.html',
            reportName: 'Cucumber HTML',
            reportTitles: 'Cucumber'
          ])
          allure([
            includeProperties: false,
            jdk: '',
            properties: [],
            reportBuildPolicy: 'ALWAYS',
            results: [[path: 'test_automation/target/allure-results']]
          ])
        }
      }
    }
  }
}
