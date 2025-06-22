
### SSH Into containers for Slave-master
```
.
├── agent
│ └── Dockerfile
├── docker-compose-old.yaml
├── docker-compose.yaml
└── Vagrantfile
```


###### /agent/Dockerfile
```
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
```

###### /docker-compose.yaml
```
services:
  jenkins-master:
    image: jenkins/jenkins:lts
    container_name: jenkins_master
    ports:
      - "8080:8080"
      - "50000:50000"  # JNLP port for inbound agents (optional)
    volumes:
      - jenkins_home:/var/jenkins_home
    networks:
      - jenkins-net

  jenkins-agent:
    build:
      context: ./agent
    container_name: jenkins_agent
    hostname: jenkins-agent
    networks:
      - jenkins-net
    expose:
      - "22"  # SSH only inside Docker network

volumes:
  jenkins_home:

networks:
  jenkins-net:
```


###### Testing SSH
```
$ docker compose up -d                                          : (1) Create containers
$ docker exec -it jenkins_master bash                           : (2) Bash into master
	$ jenkins@95d3cfcd8d3d:/$ ssh root@jenkins-agent -p 22  : (3) To test SSH into slave
```
