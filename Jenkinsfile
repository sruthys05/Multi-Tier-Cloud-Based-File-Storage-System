pipeline {
    agent any

    stages {
        stage('Build Client') {
            steps {
                dir('client') {
                    bat 'docker build -t datavault-client .'
                }
            }
        }

        stage('Build Server') {
            steps {
                dir('server') {
                    bat 'docker build -t datavault-server .'
                }
            }
        }

        stage('Test Client') {
            steps {
                bat '''
                docker network create cloud-storage-network || exit 0
                docker run -d --name cloud-storage-server --network cloud-storage-network -p 8081:8081 datavault-server
                docker run -d --name cloud-storage-client --network cloud-storage-network -p 3000:3000 datavault-client
                timeout /t 20
                docker ps
                docker rm -f cloud-storage-client cloud-storage-server
                '''
            }
        }
    }

    post {
        always {
            bat 'docker rm -f cloud-storage-client cloud-storage-server || exit 0'
            bat 'docker network rm cloud-storage-network || exit 0'
            cleanWs()
        }
    }
}