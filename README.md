# AWS 101 Workshop – AWS CDK Implementation  

This repository contains the AWS CDK implementation of the **AWS 101 Workshop**, completed as part of the **AWS Cloud Path Week 8** session. The goal of this project is to deploy key AWS services using **Infrastructure as Code (IaC)** with AWS CDK.  

📺 **Session Recording:** [YouTube Link](https://www.youtube.com/watch?v=FWOSm98DW1c) 

## Architecture
![architecture diagram](docs/aws_101.png)

## Workshop Overview  

This project follows the [AWS 101 Workshop](https://catalog.workshops.aws/aws101/en-US) to:  
[x] Set up networking (VPC, subnets, security groups)  
[x] Deploy EC2 instances  
[] Configure IAM roles and permissions  
[x] Implement storage solution (S3)  
[x] Set up load balancing  
[] Set up auto-scaling

## Getting Started  

### Prerequisites  
Ensure you have the following installed:  
- **AWS CLI** ([Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html))  
- **AWS CDK** ([Installation Guide](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk.html))  
- **Node.js** ([Download](https://nodejs.org/))  

### Setup  
1. **Clone the repository:**  
```bash
git clone https://github.com/yourusername/aws-101-cdk.git
cd aws-101-cdk
```

2. **Install dependencies:**
```bash
npm install
```

3. **Bootstrap AWS CDK in your AWS account:**
```bash
cdk bootstrap
```

## Deploying the Project
To deploy the infrastructure, run:
```bash
cdk deploy
```

## Destroying the Stack
To clean up resources, run:
```bash
cdk destroy
```
