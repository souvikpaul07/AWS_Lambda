import AWS from 'aws-sdk';

/*  npm init -y
    npm install
    np install aws-sdk
*/

export const lambdaHandler = async (event, context) => {
    const ec2 = new AWS.EC2();

    try {
        // Get all EBS snapshots
        const snapshotsResponse = await ec2.describeSnapshots({ OwnerIds: ['self'] }).promise();
        const snapshots = snapshotsResponse.Snapshots;

        // Get all active EC2 instance IDs
        const instancesResponse = await ec2.describeInstances({
            Filters: [{ Name: 'instance-state-name', Values: ['running'] }]
        }).promise();

        const activeInstanceIds = new Set();
        instancesResponse.Reservations.forEach(reservation => {
            reservation.Instances.forEach(instance => {
                activeInstanceIds.add(instance.InstanceId);
            });
        });

        // Iterate through each snapshot
        for (const snapshot of snapshots) {
            const snapshotId = snapshot.SnapshotId;
            const volumeId = snapshot.VolumeId;

            if (!volumeId) {
                // Delete the snapshot if it's not attached to any volume
                await ec2.deleteSnapshot({ SnapshotId: snapshotId }).promise();
                console.log(`Deleted EBS snapshot ${snapshotId} as it was not attached to any volume.`);
            } else {
                try {
                    // Check if the volume still exists
                    const volumeResponse = await ec2.describeVolumes({ VolumeIds: [volumeId] }).promise();
                    const volume = volumeResponse.Volumes[0];

                    if (!volume.Attachments || volume.Attachments.length === 0) {
                        await ec2.deleteSnapshot({ SnapshotId: snapshotId }).promise();
                        console.log(`Deleted EBS snapshot ${snapshotId} as it was taken from a volume not attached to any running instance.`);
                    }
                } catch (error) {
                    if (error.code === 'InvalidVolume.NotFound') {
                        // The volume associated with the snapshot is not found
                        await ec2.deleteSnapshot({ SnapshotId: snapshotId }).promise();
                        console.log(`Deleted EBS snapshot ${snapshotId} as its associated volume was not found.`);
                    } else {
                        console.error(`Error while processing snapshot ${snapshotId}:`, error);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
};
