#!/bin/bash

aws_secret_export() {
    echo "Exporting AWS_ACCESS_KEY && AWS_SECRET_ACCESS_KEY"
    export AWS_ACCESS_KEY=$(grep AWS_ACCESS_KEY .env.aws | cut -d '=' -f2) && export AWS_SECRET_ACCESS_KEY=$(grep AWS_SECRET_ACCESS_KEY .env.aws | cut -d '=' -f2);
}

aws_login() {
    . ./scripts/aws-config.sh && aws_secret_export
    aws ecr get-login-password | docker login --username AWS --password-stdin $(grep AWS_ACCOUNT .env.aws | cut -d '=' -f2)
}
