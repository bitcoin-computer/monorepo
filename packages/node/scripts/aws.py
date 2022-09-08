#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.


from argparse import ArgumentParser
import json
import subprocess
import sys

EXPORT_CREDENTIALS = "export AWS_ACCESS_KEY=$(grep AWS_ACCESS_KEY .env.aws | cut -d '=' -f2) && export AWS_SECRET_ACCESS_KEY=$(grep AWS_SECRET_ACCESS_KEY .env.aws | cut -d '=' -f2) && aws ecr get-login-password --region $(grep AWS_DEFAULT_REGION .env.aws | cut -d '=' -f2) | docker login --username AWS --password-stdin $(grep AWS_ACCOUNT .env.aws | cut -d '=' -f2)"

def dockerVolumeRemoveAws(sys):
    contextType = subprocess.getoutput("docker context ls | grep '*' | awk '{print $3}'")
    contextName = subprocess.getoutput("docker context ls | grep '*' | awk '{print $1}'")
  
    print("Using context name {0}, context type {1}.".format(contextName, contextType))
    if (contextType == "ecs"):
        if (len(sys.argv) < 3):
            print("Error: volume id needed. Usage: 'yarn docker-volume-rm-aws <fs_id>'")
            sys.exit(-1)
        else:
            cont = input("[!] Using context '{0}'. Removing volume '{1}' Continue? (Y/N): ".format(contextName, sys.argv[2]))
            if cont=='yes' or cont=='y' or cont=='YES' or cont=='Y':
                subprocess.run(['sh', '-c', "{0} && docker volume rm {1}".format(EXPORT_CREDENTIALS, sys.argv[2])])

    else:
        print("Error: the current context is not an ecs-type one.")
        print("Please, switch to the ecs context: list the contexts running 'docker context ls'. Pick the ecs-type context name. Run: 'yarn docker-context-use <ecs-context-name>'")

def awsLogin(self):
    subprocess.run(['sh', '-c', "{0} && aws ecr get-login-password | docker login --username AWS --password-stdin $(grep AWS_ACCOUNT .env.aws | cut -d '=' -f2)".format(EXPORT_CREDENTIALS)])
    

def awsEcrLogin(self):
    # Reads credentials from .env.aws
    awsAccessKeyId = subprocess.check_output("grep AWS_ACCESS_KEY_ID .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    awsSecretAccessKey = subprocess.check_output("grep AWS_SECRET_ACCESS_KEY .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    awsDefaultRegion = subprocess.check_output("grep AWS_DEFAULT_REGION .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    awsAccount = subprocess.check_output("grep AWS_ACCOUNT .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()

    if (not awsAccessKeyId):
        print('[Error] AWS_ACCES _KEY_ID variables not defined. Please, set the variables AWS_ACCESS_KEY_ID in .env.aws')
        sys.exit(-1)

    if (not awsSecretAccessKey):
        print('[Error] ! AWS_SECRET_ACCESS_KEY variables not defined. Please, set the variables AWS_SECRET_ACCESS_KEY in .env.aws')
        sys.exit(-1)

    if (not awsDefaultRegion):
        print('[Error] AWS_DEFAULT_REGION variables not defined. Please, set the variables AWS_DEFAULT_REGION in .env.aws')
        sys.exit(-1)

    if (not awsAccount):
        print('[Error] AWS_ACCOUNT variables not defined. Please, set the variables AWS_ACCOUNT in .env.aws')
        sys.exit(-1)

    print('aws configure set aws_access_key_id AWS_ACCESS_KEY_ID')
    subprocess.run(['sh', '-c', 'aws configure set aws_access_key_id "{0}";'.format(awsAccessKeyId)])
  
    print('aws configure set aws_secret_access_key AWS_SECRET_ACCESS_KEY')
    subprocess.run(['sh', '-c', 'aws configure set aws_secret_access_key "{0}";'.format(awsSecretAccessKey)])
  
    print('aws configure set default.region AWS_DEFAULT_REGION')
    subprocess.run(['sh', '-c', 'aws configure set default.region "{0}";'.format(awsDefaultRegion)])
  
    print('echo "yarn aws-login"')
    # Loggin to docker with AWS credentials
    awsLogin(self)

def dockerContextUse(sys):
    if (len(sys.argv) >= 3):
        subprocess.run(['sh', '-c', '{0} && docker context use {1}'.format(EXPORT_CREDENTIALS, sys.argv[2])])

def awsTag(self):
    currentTag = input('Input the current image tag: ')
    newTag = input('Tagging new image tag: ')
    
    awsRepository = subprocess.check_output("grep AWS_REPOSITORY .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    if not awsRepository:
        print('[Error] AWS repository or account not defined. Please, set the variable AWS_REPOSITORY in .env.aws')
        sys.exit(-1)

    cont = input('Tagging bcn image  {0}:{1} to {0}:{2}. Continue? (Y/N): '.format(awsRepository, currentTag, newTag))
    if cont=='yes' or cont=='y' or cont=='YES' or cont=='Y':
        print('Tagging bitcoin-computer-node image to {0}'.format(newTag))
        print('MANIFEST=$(aws ecr batch-get-image --repository-name {0} --image-ids imageTag={1} --query \'images[].imageManifest\' --output text); aws ecr put-image --repository-name {0} --image-tag {2} --image-manifest "$MANIFEST";'.format(awsRepository, currentTag, newTag))
        subprocess.run(['sh', '-c', 'MANIFEST=$(aws ecr batch-get-image --repository-name {0} --image-ids imageTag={1} --query \'images[].imageManifest\' --output text); aws ecr put-image --repository-name {0} --image-tag {2} --image-manifest "$MANIFEST";'.format(awsRepository, currentTag, newTag)])

def ecsPushImage(self):
    awsRepository = subprocess.check_output("grep AWS_REPOSITORY .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    awsAccount = subprocess.check_output("grep AWS_ACCOUNT .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    packageJsonFd = open('package.json')
    jsonData = json.load(packageJsonFd)
    currentVersion = jsonData['version']
    print('version {0}'.format(currentVersion))
    packageJsonFd.close()

    if not awsRepository or not awsAccount:
        print('[Error] AWS repository or account not defined. Please, set the variable AWS_REPOSITORY and AWS_ACCOUNT in .env.aws')
        sys.exit(-1)
    print('Pushing bcn image to repository {0}/{1}'.format(awsRepository, awsAccount))

    cont = input('Pushing bcn image with tag {0}. Continue? (Y/N): '.format(currentVersion))
    if cont=='yes' or cont=='y' or cont=='YES' or cont=='Y':
        print('Tagging bitcoin-computer-node image to {0}'.format(currentVersion))
        subprocess.run(
            ['sh', '-c', 'docker tag bitcoin-computer-node {0}/{1}:{2};'.format(awsAccount, awsRepository, currentVersion)])
        print('Pushing bitcoin-computer-node to repository {0}/{1}'.format(awsAccount, awsRepository))
        subprocess.run(
            ['sh', '-c', 'docker push {0}/{1}:{2};'.format(awsAccount, awsRepository, currentVersion)])

if __name__ == '__main__':
    # function dispatcher
    if (len(sys.argv)>1):
        eval(sys.argv[1])(sys)