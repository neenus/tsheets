pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-token')
        IMAGE_VERSION = '1.0'
    }
    stages {
        stage('Build docker images') {
          steps {
            sh 'echo "Building docker image..."'
            sh "docker build -t neenus007/tsheets:${IMAGE_VERSION}.${BUILD_NUMBER} -f Dockerfile ."
            sh 'docker build -t neenus007/tsheets:latest -f Dockerfile .'
          }
        }
        stage('Login to DockerHub') {
          steps {
            sh 'echo "Logging in to DockerHub..."'
            sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
          }
        }
        stage('Push images to DockerHub') {
          steps {
            sh 'echo "Pushing to DockerHub..."'
            sh "docker push neenus007/tsheets:${IMAGE_VERSION}.${BUILD_NUMBER}"
            sh 'docker push neenus007/tsheets:latest'
          }
        }
        stage('Logout from DockerHub') {
          steps {
            sh 'echo "Logging out from DockerHub..."'
            sh 'docker logout'
          }
        }
    }
}
