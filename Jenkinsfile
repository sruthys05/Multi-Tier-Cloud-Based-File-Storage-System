```groovy
pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Server') {
            steps {
                dir('server') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Client') {
            steps {
                dir('client') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build Server') {
            steps {
                script {
                    def rc = bat(
                        script: 'docker info',
                        returnStatus: true
                    )

                    if (rc == 0) {
                        bat 'docker build -t datavault-server:latest .'
                    } else {
                        echo 'Docker not available → skipping'
                    }
                }
            }
        }

        stage('Docker Build Client') {
            steps {
                dir('client') {
                    script {
                        def rc = bat(
                            script: 'docker info',
                            returnStatus: true
                        )

                        if (rc == 0) {
                            bat 'docker build -t datavault-client:latest .'
                        } else {
                            echo 'Docker not available → skipping'
                        }
                    }
                }
            }
        }
    }

    post {

        always {
            echo 'Pipeline completed'
        }

        success {
            echo 'Build successful'
        }

        failure {
            echo 'Build failed'
        }
    }
}
```
