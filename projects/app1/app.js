const gretting = 'hello volume'
console.log( gretting )
console.log( '-----------------------' )


pipeline {
  agent any

  tools {
    nodejs 'nodejs'
  }

  stages {
    stage('delete old repo') {
      steps {
        sh 'rm -rf jenkins-test-project'
      }
    }

    stage('Clone repo') {
      steps {
        echo 'clonging my repo'
        sh 'git clone https://github.com/JavaScriptForEverything/jenkins-test-project'
      }
    }

    stage('Install packages') {
      steps {
        sh 'cd jenkins-test-project'
        sh 'yarn install'
      }
    }

    stage('Running App') {
      steps {
        sh 'cd jenkins-test-project'
        sh 'yarn start'
      }
    }
  }
}
