import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class OdooDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters for Odoo credentials passed from GitHub Secrets
    const odooDbPassword = new cdk.CfnParameter(this, 'OdooDbPassword', {
      type: 'String',
      description: 'The password for the Odoo database user',
      noEcho: true,
    });

    const odooAdminPassword = new cdk.CfnParameter(this, 'OdooAdminPassword', {
      type: 'String',
      description: 'The password for the Odoo admin account',
      noEcho: true,
    });

    // VPC
    const vpc = new ec2.Vpc(this, 'OdooVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Security Group
    const securityGroup = new ec2.SecurityGroup(this, 'OdooSecurityGroup', {
      vpc,
      description: 'Allow SSH and Odoo traffic',
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS access');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8069), 'Allow Odoo access');

    // IAM Role for SSM
    const role = new iam.Role(this, 'OdooInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    // AMI
    const machineImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
    });

    // EC2 Instance
    const instance = new ec2.Instance(this, 'OdooInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage,
      securityGroup,
      role,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // User Data
    const userDataScript = `#!/bin/bash
# Update system
yum update -y
yum install -y git python3-pip python3-devel postgresql15 postgresql15-server postgresql15-contrib gcc libxslt-devel bzip2-devel libffi-devel zlib-devel openssl-devel

# Setup PostgreSQL
postgresql-setup --initdb
systemctl enable postgresql
systemctl start postgresql

# Create Odoo User in Postgres
sudo -u postgres psql -c "CREATE USER odoo WITH SUPERUSER PASSWORD '${odooDbPassword.valueAsString}';"
sudo -u postgres psql -c "CREATE DATABASE odoo WITH OWNER odoo;"

# Create System User
useradd -m -d /opt/odoo -U -r -s /bin/bash odoo

# Install Odoo Dependencies
pip3 install -r https://raw.githubusercontent.com/odoo/odoo/17.0/requirements.txt
pip3 install psycopg2-binary

# Install Odoo
git clone https://github.com/odoo/odoo.git --depth 1 --branch 17.0 /opt/odoo/odoo
chown -R odoo:odoo /opt/odoo

# Create Config File
cat <<EOF > /etc/odoo.conf
[options]
admin_passwd = ${odooAdminPassword.valueAsString}
db_host = False
db_port = False
db_user = odoo
db_password = ${odooDbPassword.valueAsString}
addons_path = /opt/odoo/odoo/addons
EOF
chown odoo:odoo /etc/odoo.conf
chmod 640 /etc/odoo.conf

# Create Service File
cat <<EOF > /etc/systemd/system/odoo.service
[Unit]
Description=Odoo
Documentation=http://www.odoo.com
[Service]
# Amazon Linux 2023 might require standard execution
Type=simple
User=odoo
ExecStart=/opt/odoo/odoo/odoo-bin -c /etc/odoo.conf
[Install]
WantedBy=multi-user.target
EOF

# Start Odoo Service
systemctl daemon-reload
systemctl enable odoo
systemctl start odoo
`;

    instance.addUserData(userDataScript);

    // Output
    new cdk.CfnOutput(this, 'OdooUrl', {
      value: `http://${instance.instancePublicIp}:8069`,
    });
  }
}
