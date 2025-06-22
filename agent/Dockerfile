FROM node:20

# Install OpenJDK + SSH + Docker CLI + Yarn
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    openssh-server sudo curl gnupg2 lsb-release \
 && mkdir /var/run/sshd \
 && echo 'root:jenkins' | chpasswd \
 && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
 && echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config \
 && usermod -aG sudo root

## Install Yarn globally
# RUN npm install -g yarn

# (Optional) Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
 && apt-get update && apt-get install -y docker-ce-cli

# Expose SSH
EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]

