#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WebsiteStack } from '../lib/website-stack';

const app = new cdk.App();
new WebsiteStack(app, 'WebsiteStack', {
  env: { account: '911167904324', region: 'eu-central-1' },
});