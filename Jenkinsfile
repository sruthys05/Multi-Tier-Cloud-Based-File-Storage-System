pipeline {
    agent any

    environment {
        IMAGE_PREFIX = 'datavault'
        REGISTRY = 'index.docker.io'
        SERVER_IMAGE = "${REGISTRY}/${IMAGE_PREFIX}-server:latest"
        CLIENT_IMAGE = "${REGISTRY}/${IMAGE_PREFIX}-client:latest"
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
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Build Client') {
            steps {
                dir('client') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build Server') {
            steps {
                script {
                    docker.build("${SERVER_IMAGE}", './server')
                }
            }
        }

        stage('Docker Build Client') {
            steps {
                script {
                    docker.build("${CLIENT_IMAGE}", './client')
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io', 'docker-hub-credentials') {
                        docker.image("${SERVER_IMAGE}").push()
                        docker.image("${CLIENT_IMAGE}").push()
                    }
                }
            }
        }
    }

    post {
        failure {
            echo 'Build failed'
        }
    }
}