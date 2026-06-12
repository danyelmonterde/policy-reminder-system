pipeline {
    agent any

    environment {
        // Expose Homebrew and Podman paths to Jenkins runner environment
        PATH = "/opt/homebrew/bin:/usr/local/bin:/opt/podman/bin:${env.PATH}"

        // Deployment configuration
        EC2_IP = '3.26.95.218'
        EC2_USER = 'ec2-user'
        // Loaded dynamically from Jenkins Credentials Store as a secret file path
        EC2_SSH_KEY = credentials('ec2-ssh-key-file')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build & Test') {
            environment {
                SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/mypolicy_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true'
                SPRING_DATASOURCE_USERNAME = 'root'
                SPRING_DATASOURCE_PASSWORD = credentials('test-db-password')
                SPRING_MAIL_HOST = 'localhost'
                SPRING_MAIL_PORT = '2525'
                SPRING_MAIL_USERNAME = 'test@example.com'
                SPRING_MAIL_PASSWORD = credentials('test-mail-password')
                JWT_SECRET = credentials('test-jwt-secret')
            }
            steps {
                dir('backend') {
                    // Execute build and tests using the generated Maven wrapper
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package'
                }
            }
        }

        stage('Frontend Build & Test') {
            steps {
                dir('frontend') {
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
                    sh 'npm run build'
                }
            }
        }

        stage('Local Podman Deploy') {
            steps {
                echo 'Fetching secrets from AWS Secrets Manager for local deployment...'
                sh 'echo "FRONTEND_PORT=8081" > .env'
                sh '''aws secretsmanager get-secret-value --secret-id policy-reminder-secrets --region ap-southeast-2 --query SecretString --output text | python3 -c "import json, sys; [print(f'{k}={v}') for k, v in json.loads(sys.stdin.read()).items()]" >> .env'''
                echo 'Deploying locally using Podman Compose...'
                sh 'podman compose down || true'
                sh 'podman compose up --build -d'
                echo 'Local deployment complete.'
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo 'Deploying to AWS EC2 instance...'
                sh "chmod +x deploy-to-ec2.sh"
                sh "./deploy-to-ec2.sh ${EC2_SSH_KEY} ${EC2_USER} ${EC2_IP}"
                echo 'Remote AWS EC2 deployment complete.'
            }
        }
    }
}
