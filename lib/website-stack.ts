import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        },
      ]
    })

    const bucket = new s3.Bucket(this, `${id}-Bucket`, {
      bucketName: `acp-test-bucket-2025`
    })

    const instanceSG = new ec2.SecurityGroup(this, `${id}-InstanceSG`, {
      vpc: vpc
    })

    const loadBalancerSG = new ec2.SecurityGroup(this, `${id}-LoadBalancerSG`, {
      vpc: vpc
    })

    const instance = new ec2.Instance(this, `${id}-Instance`, {
      instanceName: `${id}-Instance`,
      vpc: vpc,
      securityGroup: instanceSG,
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
    })

    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${id}-LoadBalancer`, {
      loadBalancerName: `${id}-LoadBalancer`,
      securityGroup: loadBalancerSG,
      vpc: vpc
    })
  }
}
