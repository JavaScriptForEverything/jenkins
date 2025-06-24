## Jenkins
```
.
├── docker-compose.yaml
├── projects
│   └── app1
│       ├── app.js
│       └── package.json
├── readme.md
└── Vagrantfile
```


##### docker-compose.yaml
```
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - ./projects:/projects
    restart: unless-stopped

volumes:
  jenkins_home:
```


##### projects/app1/app.js
```
const gretting = 'hello world'
console.log( gretting )
console.log( '-----------------------' )
```


##### projects/app1/package.json
```
{
  "name": "app1",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "build": "echo 'build project'",
    "test": "echo 'run tests on project'",
    "start": "node ."
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

#### Create Job for Nodejs 
```
|----------[ Nodejs Project ]---------- 						        |
|												|
| Let's Run our nodejs project inside jenkins master: 						|
|												|
| Step-1: Mount Project volume inside jenkins (/app) so that jenkins has source code available 	|
|												|
| 	$ mkdir projects      		        : Create a directory inside host machine 	|
| 	$ subl docker-compose.yaml              : See docker-compose and Dockerfile in github 	|
|	...											|
| 	./projects:/projects 		        : Mount local directory inside container /projects
|	...											|
|												|
| 	$ docker compose up -d 		        : Update docker containers   			|
| 	$ docker exec -it jenkins_master bash   : To check directory 'app' available inside container
| 	$ ls 					: => /app, ... 				        |
|												|
| 	$ exit 					:                                               |
|												|
|												|
| Step-2: Create a nodejs project, and run on localhost to make sure it works correctly: 	|
|												|
| 	../app1/ 			                                                        |
| 	├── app.js 										|
| 		└── package.json 					                        |
|												|
| 	// app.js 				                                                |
| 	const gretting = 'hello world' 					                        |
| 	console.log( gretting ) 								|
| 	console.log( '-----------------------' ) 						|
|												|
| 	// package.js 										|
|               {                                                                               |
|                 "name": "app1",                                                               |
|                 "version": "1.0.0",                                                           |
|                 "description": "",                                                            |
|                 "main": "app.js",                                                             |
|                 "scripts": {                                                                  |
|                   "build": "echo 'build project'",                                            |
|                   "test": "echo 'run tests on project'",                                      |
|                   "start": "node ."                                                           |
|                 },                                                                            |
|                 "keywords": [],                                                               |
|                 "author": "",                                                                 |
|                 "license": "ISC"                                                              |
|               }                                                                               |
|												|
| Step-3: Install & configure Nodejs inside jenkins: 						|
|												|
| 	- Install node as plugin 								|
| 		Manage Jenkins: > Plugins > <search nodejs> > mark and install 			|
|												|
| 	- Add node as Tools : [ Once the NodeJs installed via plugin then that will be available in Tools section ] 
|												|
| 		Manage Jenkins:	> Tools > NodeJs > add 	 					|
| 		  - nodejs        	        : this name will be used 			|
| 		  - install other packages globally inside this. 			        |
| 			yarn 		        : Install global pageges: $ yarn start 	        |
|												|
|												|
|												|
| Step-4: Now create a Job and Run with nodejs plugin: 						|
|												|
|   Job-1: Job > FressStyle: 			                                                |
| 	- Name 					: node-app1 		                        |
| 	- Type 					: FreeStyle 					|
| 	- Environment 				: 					        |
| 	- Provide Node & npm bin/ folder to PATH 		                                |
| 	    NodeJS Installtion: 		                                                |
| 		nodejs 				: Choose the name we give in Step-3 		|
|												|
| 	- Build Step  				                                                |
| 	   - Execute Shell 			: To run Shell command, like: yarn start 	|
|												|
| 		cd /projects/app1 		: Go to countainer's mount directory's node project 
| 		npm start 			: Now Run Nodejs project, 			|
| 		yarn start 			: If added global 'yarn' inside Tools > nodejs instaltion
|												|
| 	- Save 					: the change and  				|
|												|
| 	- Build Now 				: We didn't set auto trigger, so build manually |
|												|
```



## Push code to github and clone build and run project

- Unmount project volume from container, so that there will be no project
- Restart container to take latest change (unmounted volume container)

- Create New Project
- Create Github repo and get the url
- Create New Job
- Source Code Mangement > Git 
        > Url           : git-project-url
        > */main        : main branch to use

- Triggers:
        > Poll CMS      : 
        > Shedule       : * * * * * (every minute)

- Environment:
        - Provide Node & npm bin/ folder to PATH        # [ required for Nodejs Plugin ]
        > name:         : nodejs                        # the same name used in tools

- Build Step:
        - Execute Shell
```
$ yarn install
$ yarn start
```

- Save          : first save auto pull, nest time build required to push to github
- make change and `$ git push` will trigger this job,



## SSH Into containers for Slave-master
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
      - ./projects:/projects
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
