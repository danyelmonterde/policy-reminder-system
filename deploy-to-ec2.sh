#!/bin/bash
set -e

# Script to deploy the application to AWS EC2 using tarball & docker-compose
SSH_KEY_PATH=$1
EC2_USER=$2
EC2_HOST=$3

if [ -z "$SSH_KEY_PATH" ] || [ -z "$EC2_USER" ] || [ -z "$EC2_HOST" ]; then
    echo "Usage: $0 <ssh-key-path> <ec2-user> <ec2-host>"
    exit 1
fi

echo "🗝️ Retrieving secrets from AWS Secrets Manager..."
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id policy-reminder-secrets --region ap-southeast-2 --query SecretString --output text)

echo "📄 Creating remote environment file..."
echo "FRONTEND_PORT=80" > remote.env
python3 -c "import json, sys; [print(f'{k}={v}') for k, v in json.loads(sys.stdin.read()).items()]" <<< "$SECRET_JSON" >> remote.env

echo "📦 Packaging project..."
tar -czf project.tar.gz \
    --exclude='node_modules' \
    --exclude='target' \
    --exclude='.git' \
    --exclude='.angular' \
    --exclude='dist' \
    --exclude='project.tar.gz' \
    --exclude='remote.env' \
    --exclude='.env' \
    .

echo "🚀 Copying package to EC2 ($EC2_HOST)..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no project.tar.gz "$EC2_USER@$EC2_HOST:/home/$EC2_USER/"

echo "🔧 Preparing application directory on EC2..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "mkdir -p ~/app && tar -xzf ~/project.tar.gz -C ~/app/ && rm -f ~/project.tar.gz"

echo "🔐 Copying environment secrets to EC2..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no remote.env "$EC2_USER@$EC2_HOST:/home/$EC2_USER/app/.env"

echo "🐳 Starting Docker containers on EC2..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" bash -s << 'EOF'
set -e
cd ~/app
echo "Stopping existing containers..."
docker compose down || true
echo "Pruning unused docker images and build cache to reclaim disk space..."
docker system prune -a -f --volumes || true
docker builder prune -a -f || true
echo "Building and starting containers..."
docker compose up --build -d
EOF

echo "🧹 Cleaning up local files..."
rm -f project.tar.gz remote.env

echo "✅ Deployment completed successfully!"
