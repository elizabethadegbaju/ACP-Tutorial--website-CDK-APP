import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as asg from 'aws-cdk-lib/aws-autoscaling';

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for our website stack deployment
    const vpc = new ec2.Vpc(this, `${id}-VPC`, {
      vpcName: `${id}-VPC`,
      natGatewayProvider: ec2.NatGatewayProvider.gateway(),
      natGateways: 2,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3
        }
      },
      createInternetGateway: true,
      availabilityZones: [
        'eu-central-1a',
        'eu-central-1b'
      ],
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 20,
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        },
      ]
    })

    // S3 Bucket Configuration
    const bucket = new s3.Bucket(this, `${id}-Bucket`, {
      bucketName: `acp-test-bucket-2025`
    })

    // Load Balancer Configuration
    const loadBalancerSG = new ec2.SecurityGroup(this, `${id}-LoadBalancerSG`, {
      vpc: vpc
    })
    loadBalancerSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.HTTP, "Allow HTTP inbound from Internet")
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${id}-LoadBalancer`, {
      loadBalancerName: `${id}-LoadBalancer`,
      securityGroup: loadBalancerSG,
      vpc: vpc,
      internetFacing: true
    })

    const instanceRole = new iam.Role(this, `${id}-InstanceProfileRole`, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
      ]
    })

    // EC2 instance configuration
    const instanceSG = new ec2.SecurityGroup(this, `${id}-InstanceSG`, {
      vpc: vpc
    })
    instanceSG.addIngressRule(loadBalancerSG, ec2.Port.HTTP, "Allow HTTP inbound from Load Balancer")

    // const instance = new ec2.Instance(this, `${id}-Instance`, {
    //   instanceName: `${id}-Instance`,
    //   vpc: vpc,
    //   securityGroup: instanceSG,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
    //   },
    //   instanceProfile: new iam.InstanceProfile(this, `${id}-InstanceProfile`, {
    //     instanceProfileName: `${id}-InstanceProfile`,
    //     role: instanceRole
    //   }),
    //   machineImage: ec2.MachineImage.latestAmazonLinux2023(),
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
    // })
    // instance.addUserData(`#!/bin/bash
    //   yum update -y
    //   # Install Session Manager agent
    //   yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
    //   systemctl enable amazon-ssm-agent
    //   # Install and start the php web server
    //   dnf install -y httpd wget php-json php
    //   chkconfig httpd on
    //   systemctl start httpd
    //   systemctl enable httpd

    //   # Install AWS SDK for PHP
    //   wget https://docs.aws.amazon.com/aws-sdk-php/v3/download/aws.zip
    //   unzip aws.zip -d /var/www/html/sdk
    //   rm aws.zip

    //   #Install the web pages for our lab
    //   if [ ! -f /var/www/html/index.html ]; then
    //   rm index.html
    //   fi
    //   cd /var/www/html
    //   wget https://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee.s3.us-east-1.amazonaws.com/2aa53d6e-6814-4705-ba90-04dfa93fc4a3/index.php

    //   # Update existing packages
    //   dnf update -y`)

    // Autoscaling configuration
    const autoScalingGroup = new asg.AutoScalingGroup(this, `${id}-ASG`, {
      autoScalingGroupName: `${id}-Instance`,
      vpc: vpc,
      securityGroup: instanceSG,
      role: instanceRole,
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      desiredCapacity: 2,
      minCapacity: 1,
      userData: ec2.UserData.custom(`#!/bin/bash
yum update -y
# Install Session Manager agent
yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
systemctl enable amazon-ssm-agent
# Install and start the php web server
dnf install -y httpd wget php-json php
chkconfig httpd on
systemctl start httpd
systemctl enable httpd

# Install AWS SDK for PHP
wget https://docs.aws.amazon.com/aws-sdk-php/v3/download/aws.zip
unzip aws.zip -d /var/www/html/sdk
rm aws.zip

#Install the web pages for our lab
if [ ! -f /var/www/html/index.html ]; then
rm index.html
fi
cd /var/www/html
wget https://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee.s3.us-east-1.amazonaws.com/2aa53d6e-6814-4705-ba90-04dfa93fc4a3/index.php

# Update existing packages
dnf update -y`)
    })

    const targetGroup = new elbv2.ApplicationTargetGroup(this, `${id}-TargetGroup`, {
      targetGroupName: `${id}-TargetGroup`,
      targetType: elbv2.TargetType.INSTANCE,
      protocol: elbv2.ApplicationProtocol.HTTP,
      ipAddressType: elbv2.TargetGroupIpAddressType.IPV4,
      vpc: vpc,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
      healthCheck: {
        path: "/",
        protocol: elbv2.Protocol.HTTP
      }
    })
    autoScalingGroup.attachToApplicationTargetGroup(targetGroup)

    const listener = new elbv2.ApplicationListener(this, `${id}-LoadBalancerListener`, {
      loadBalancer: loadBalancer,
      defaultTargetGroups: [targetGroup],
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP
    })

    // allows all ASG instances to access s3 bucket
    bucket.grantRead(autoScalingGroup)
  }
}
