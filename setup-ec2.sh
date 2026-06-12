#!/bin/bash
# setup-ec2.sh: Setup script to install Docker and Docker Compose on Amazon Linux 2023 (AL2023)
set -e

echo "=== System Update ==="
sudo dnf update -y

echo "=== Configuring Swap Space ==="
if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
    echo "2GB Swap space created and enabled."
else
    echo "Swap space already exists."
fi

echo "=== Installing Docker ==="
sudo dnf install -y docker

echo "=== Starting and enabling Docker service ==="
sudo systemctl start docker
sudo systemctl enable docker

echo "=== Adding ec2-user to docker group ==="
sudo usermod -aG docker ec2-user

echo "=== Installing Docker Compose ==="
# Download Docker Compose binary
DOCKER_COMPOSE_VERSION="v2.26.0"
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create symlink for standard usage
sudo ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

echo "=== Verifying installation ==="
docker --version
docker compose version

echo "=== Setup completed successfully! ==="
echo "Please log out and log back in to apply docker group membership."
