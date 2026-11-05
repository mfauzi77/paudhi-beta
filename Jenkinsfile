pipeline {
    agent any

    parameters {
        choice(
            name: 'ENV',
            choices: ['dev', 'staging', 'production'],
            description: 'Environment deploy'
        )
    }

    environment {
        SERVER_IP   = "192.168.10.195"
        SERVER_USER = "digi"
        APP_DIR     = "/home/digi/paudhi"
        BRANCH      = "main"
    }

    stages {
        stage('Deploy PAUDHI') {
            steps {
                sshagent(credentials: ['ams-ssh']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes ${SERVER_USER}@${SERVER_IP} '
                        set -e
                        cd ${APP_DIR}
                        git config --global --add safe.directory ${APP_DIR}
                        git pull origin ${BRANCH}
                        sudo /home/digi/paudhi/deploy.sh
                    '
                    """
                }
            }
        }
    }
}
