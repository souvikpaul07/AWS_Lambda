# Cloud Cost Optimization using AWS Lambda - Identifying Stale Resources

# Identifying Stale EBS Snapshots

## Overview
This project provides an automated solution for identifying and deleting stale Amazon Elastic Block Store (EBS) snapshots that are no longer associated with active EC2 instances. Using an AWS Lambda function written in Node.js, this solution helps optimize storage costs by removing unnecessary snapshots.

## Functionality
The Lambda function performs the following operations:

1. **Fetches EBS Snapshots**: Retrieves all EBS snapshots owned by the same AWS account ('self').
2. **Retrieves Active EC2 Instances**: Identifies the list of active EC2 instances, including both running and stopped instances.
3. **Checks Snapshot Associations**: For each EBS snapshot, the function checks if the associated volume (if present) is not attached to any active EC2 instance.
4. **Deletes Stale Snapshots**: If a snapshot is not attached to any active EC2 instance, it is considered stale and is deleted to reduce storage costs.

## Prerequisites
- AWS Lambda
- Node.js
- AWS EC2
- AWS EBS
- IAM Permissions for Lambda to access EC2 and EBS resources
