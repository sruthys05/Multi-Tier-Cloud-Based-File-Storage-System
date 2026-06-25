
pipeline {
    agent any

    stages {

        stage('Clone'){
            steps{
                git 'https://github.com/sruthys05/Multi-Tier-Cloud-Based-File-Storage-System.git'
            }
        }

        stage('Build'){
            steps{
                sh 'mvn clean package'
            }
        }

        stage('Docker Build'){
            steps{
                sh 'docker build -t cloud-storage .'
            }
        }

        stage('Run'){
            steps{
                sh 'docker run -d -p 3000:3000 cloud-storage'
            }
        }
    }
}
