# Bitcoin Computer Node

The Bitcoin Computer Node provides trustless access to the [Bitcoin Computer](https://github.com/bitcoin-computer/bc-lib).

[Documentation](https://docs.bitcoincomputer.io/) |
[Telegram](thebitcoincomputer) |
[Twitter](https://twitter.com/TheBitcoinToken)

## Getting Started

### Install

Clone the [```monorepo```](https://github.com/bitcoin-computer/monorepo.git) repository from GitHub. Move to ```packages/node``` and then copy the file ``.env.example`` into a file ``.env`` in the root folder. Run ```setup.sh``` to install Docker, npm and yarn if you don't have them installed already. After executing ```setup.sh``` close and reopen the terminal window to make sure that the Docker daemon is running. The run ``yarn install``.

```shell
git clone https://github.com/bitcoin-computer/monorepo.git
cd monorepo/packages/node
cp .env.example .env
./scripts/setup.sh
yarn install
```



### Start the Node
To start the Bitcoin Computer Node on Litecoin (LTC) regtest run:

```shell
yarn up
```

Use the ``-t`` option to start the node on testnet. Type ``yarn up -h`` to get the list of all configuration options.

```shell
yarn up -t
```

You will see the logs of the services that make up the Bitcoin Computer Node: a Litecoin Node called ``node``, a database called ``db`` and api server called ``bcn``. Until the database is up and running, messages indicating connection attempts are be logged.

### Run the Tests

To run the tests, execute

```shell
yarn test
```

## Fund the Wallet

When using ```regtest```, your wallet address must be funded.

```shell
yarn fund-ltc <address1> [<address2> ... <addressN>]
```

## Stop the Services

To stop the Bitcoin Computer Node run

```shell
yarn down
```

To stop the Bitcoin Computer Node, reset the database, delete all blockchain data, and stop all docker containers, run the following command

```shell
yarn reset
```

## Syncing in parallel

If your machine has more than 4 cores you can run the sync process in parallel to shorten the synchronization time. This is only required on testnet and mainnet. First, run the services ```db```, ```node``` and ```bcn``` in separated terminal windows.

```shell
yarn up -t -db
```

```shell
yarn up -t -node
```

```shell
yarn up -t -bcn
```

Then launch the ```sync``` process in parallel by using the ```-cpus``` flag to indicate the number of cores of your machine.

```shell
yarn up -t -sync -cpus 16
```

The ```sync``` process can be stopped at any time. When you restart the process, it will continue from the last block processed. 

### Times and Costs Estimates

The following table shows the estimated times and costs for syncing a Litecoin node on ```testnet```. The costs are estimated using an AWS EC2 instance [prices](https://aws.amazon.com/ec2/pricing/on-demand/). All experiments were run using a 50GB SSD storage.


| CPUs | RAM  | Sync Time | Monthly Costs  |
|------|------|-----------|----------------|
| 2    | 16GB | 28h       | 66.82 USD      |
| 4    | 16GB | 10h 30m   | 108.28 USD     |
| 8    | 32GB | 7h 10m    | 239.62 USD     |
| 16   | 32GB | 4h 44m    | 440.64 USD     |


<!-- ## Deployment to AWS over Fargate

### Requirements
To deploy the Bitcoin Computer Node on AWS you need the following:

<ol>
<li>
Latest version of Docker Desktop installed (<a href="https://docs.docker.com/desktop/mac/install/">Install for MAC</a>, <a href="https://docs.docker.com/desktop/windows/install/">install for Windows</a>, <a href="https://docs.docker.com/cloud/ecs-integration/#install-the-docker-compose-cli-on-linux">install for the Docker Compose CLI for Linux</a>)
</li>
<li>An AWS account.</li>
<li>To ensure that Docker ECS integration is allowed to manage resources, ensure your AWS credentials grant access to AWS IAM permissions listed in <a href="https://docs.docker.com/cloud/ecs-integration/#install-the-docker-compose-cli-on-linux"> this page</a></li>
<li> aws-cli (linux or mac) <a href="https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html">installed</a> (see instructions below).
</li>
</ol>

### Installing aws cli

1. To install aws cli on Linux run the following command:

```shell
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```
For Mac installation, follow the instructions on <a href="https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html">this</a> link.

2. Then, configure credentials by running "aws configure".

```shell
aws configure
```

3. Create or view the <a href="https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html">AWS access keys</a>

```shell
$AWS Access Key ID [None]:
$AWS Secret Access Key [None]:
$Default region name [None]: us-east-2
$Default output format [None]: json
```
If no keys are provided, the command will return the newly created credential access keys.
By default, the aws configure command will save the credentials in the file cat $HOME/.aws/credentials.

4. Copy the file ``.env.aws.example`` into a file ``.env.aws`` in the root folder. Set the credentials already created and the AWS account name into the .env.aws environment file

```shell
AWS_ACCESS_KEY_ID=<access-key-id-already-created>
AWS_SECRET_ACCESS_KEY=<access-key-already-created>
AWS_DEFAULT_REGION=us-east-2

AWS_ACCOUNT=<account-id>.dkr.ecr.<selected-region>.amazonaws.com
```

### Preparing the deploy
This project uses Amazon Elastic Container Registry (ECR) to hold the images for the Bitcoin Computer Node container. Also, the Amazon S3 Storage Service is used to hold the db_schema.sql file for the db service.

For a Docker and AWS integration, you must use two types of Docker contexts: one called "default", that will be used both for building the image in a local execution and to push the image to ECR; and another context "ECS" for deploying to AWS.

The following steps must be done in order to enable Docker to automatically deploy the services into AWS.

1. Run the following command to create an Amazon ECS Docker context named <ecs-bcn-context>.

```shell
docker context create ecs ecs-bcn-context
```

You will be asked to select an AWS profile for connecting to Amazon. We suggest to configure your ECS context to retrieve AWS credentials by AWS_* environment variables. Select the third option of the prompted options list.

```shell
 Create a Docker context using:  [Use arrows to move, type to filter]
  An existing AWS profile
  AWS secret and token credentials
> AWS environment variables
```

List the Docker contexts to see if the new ECS context was created successfully.
```shell
docker context ls
```

2. Switch to the default context
```shell
docker context use default
```

3. Create a new Amazon S3 bucket and upload the file db_schema.sql to the folder ``<bucket-name>/db/db_schema.sql``

4. Update the .env.aws environment file with the full name of the bucket already created.
```shell
BUCKET=<bucket-name>
```

### The deploy command
Once the steps above are done, switch to the ECS context created in step 1. and run the following command to launch the Bitcoin Computer Node on AWS. The deploy will create several volumes in the Amazon Elastic File System (EFS) service. The volumes are not removed unless you explicitly remove them, and are only removed if they are not linked to any running task.

To switch to the ECS already created context run:

```shell
yarn docker-context-use <ecs-context-name>
```

To remove a determined unlinked volumes in EFS, you can use the following command, providing as argument the elastic file system id (efs-id):

```shell
yarn docker-volume-rm-aws <efs-id>
```

You can first list all the volumes in EFS using:

```shell
docker volume ls

fs-179787a3            arn:aws:elasticfilesystem:us-east-1:[<account-id>]:file-system/fs-179787a3
fs-159787a1            arn:aws:elasticfilesystem:us-east-1:[<account-id>]:file-system/fs-159787a1
fs-149787a0            arn:aws:elasticfilesystem:us-east-1:[<account-id>]:file-system/fs-149787a0

```

To start the deployment process for LTC over testnet run:

```shell
yarn up --testnet --aws
```

This command will automatically create a CloudFormation template, that will be deployed as a AWS ECS Fargate service. If everything is properly configured, the creation progress will be displayed on the console. The CloudFormation template can be seen as an stack in the AWS CloudFormation web dashboard.

In case you want to stop all the services and to remove all the resources created in AWS from the CloudFormation template already created, run the following command:

```shell
yarn down --testnet --aws
```
 The deletion progress will also be displayed on the console. The CloudFormation template stack will be in a 'delete in progress' state in the AWS CloudFormation web dashboard.

Likewise, the CloudFormation template can be generated without deploying it to AWS. This can be useful for analyzing the resources that will be created during the deploy. The template will be generated into the standard output running the following command:

```shell
yarn up --testnet --convert
```

### Trouble Shooting
1. Authentication error. An error like the following is can be received when using aws console commands:
```shell
denied: Your authorization token has expired. Reauthenticate and try again.
```
Run the aws-login command, and try again.
```shell
yarn aws-login
```

2. Remember that the AWS credentials must be provided while using the deployment commands. All the scripts defined in package.json will have the AWS_* credentials preceding the desired command. If the credentials are not provided, an error like the following can be thrown to the command line:
```shell
context requires credentials to be passed as environment variables
```

3. While the deployment is in the creation state, different types of problems can occur. One of the most common errors seen on the console is getting an EFS error code, which causes the process to be suspended and the deployment to be into a "delete in progress" state. If the error obtained is the following: "TaskFailedToStart: ResourceInitializationError: failed to invoke EFS utils commands to set up EFS volumes: stderr: b'mount.nfs4: Connection reset by peer' : unsuccessful EFS utils command execution; code: 32", it is recommended to remove all the unlinked elastic file system volumes (if they do not contain relevant information) and run again the deployment. 

## Beta Warning

This software has been carefully developed over four years by a qualified team. However it has not been security reviewed and we cannot guarantee the absence of bugs. Bugs can lead to the loss of funds. We do not recommend to use this software in production yet. Use at your own risk.

We will remove the beta-tag once we have completed a security review. -->

## Price

The Bitcoin Computer will be free forever on testnet. 

The fees for the Bitcoin Computer are exactly the same as the miners fees. For example, if the miner transaction fees is $0.01, then you will pay $0.02: one cent to the miners, and one cent to support the development of the Bitcoin Computer.


## Contributions

We are currently supporting LTC. Contributions are welcome. We have set up a system to add support for BTC, DOGE and BCH, but it is not completed yet. See the chain-setup folder for details. If you can get it to work on a different currency, please let us know and create a new pull request.

## Getting Help

If you have any questions, please let us know on our <a href="https://t.me/thebitcoincomputer">Telegram group</a> or on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.
