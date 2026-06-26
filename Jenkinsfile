pipeline {
    agent any

    environment {
        DOCKER_NETWORK = 'cloud-storage-network'
        SERVER_IMAGE = 'cloud-storage-server'
        CLIENT_IMAGE = 'cloud-storage-client'
        SERVER_CONTAINER = 'cloud-storage-server'
        CLIENT_CONTAINER = 'cloud-storage-client'
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
                    bat 'npm install --no-audit --no-fund'
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build Server') {
            steps {
                dir('server') {
                    bat 'docker build -t %SERVER_IMAGE% .'
                }
            }
        }

        stage('Docker Build Client') {
            steps {
                dir('client') {
                    bat 'docker build -t %CLIENT_IMAGE% .'
                }
            }
        }

        stage('Cleanup Containers') {
            steps {
                bat '''
                docker stop %SERVER_CONTAINER%
                docker rm %SERVER_CONTAINER%
                docker stop %CLIENT_CONTAINER%
                docker rm %CLIENT_CONTAINER%
                docker network rm %DOCKER_NETWORK%
                exit /b 0
                '''
            }
        }

        stage('Create Network') {
            steps {
                bat 'docker network create %DOCKER_NETWORK%'
            }
        }

        stage('Run Server') {
            steps {
                bat '''
                docker run -d --name %SERVER_CONTAINER% --network %DOCKER_NETWORK% -p 8081:8081 %SERVER_IMAGE%
                '''
            }
        }

        stage('Run Client') {
            steps {
                bat '''
                docker run -d --name %CLIENT_CONTAINER% --network %DOCKER_NETWORK% -p 3000:3000 %CLIENT_IMAGE%
                '''
            }
        }
    }

    post {
        failure {
            bat '''
            docker logs %SERVER_CONTAINER%
            docker logs %CLIENT_CONTAINER%
            exit /b 0
            '''
        }
    }
}