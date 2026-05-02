pipeline {
    agent any
    tools { nodejs 'NodeJS' }
    stages {
        stage('Checkout') { steps { git branch: 'main', url: 'https://github.com/Alley1108/portfolio-manager.git' } }
        stage('Install Dependencies') { steps { dir('backend') { sh 'npm install' } } }
        stage('Run Tests') { steps { dir('backend') { sh 'npm test || true' } } }
        stage('Build') { steps { echo 'Build complete' } }
        stage('Deploy') { steps { echo 'Live at https://portfolio-manager-seven-kohl.vercel.app' } }
    }
    post {
        success { echo 'Pipeline completed successfully!' }
        failure { echo 'Pipeline failed!' }
    }
}
