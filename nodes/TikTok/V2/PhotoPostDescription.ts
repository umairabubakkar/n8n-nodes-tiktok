import type { INodeProperties } from 'n8n-workflow';

export const photoPostOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['photoPost'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a photo to TikTok',
				action: 'Upload photo',
			},
		],
		default: 'upload',
	},
];

export const photoPostFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                photoPost:upload                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Photo URL',
		name: 'photoUrl',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['photoPost'],
				operation: ['upload'],
			},
		},
		description: 'The URL of the photo to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['photoPost'],
				operation: ['upload'],
			},
		},
		options: [
                        {
                                displayName: 'Caption',
                                name: 'caption',
                                type: 'string',
                                default: '',
                                description: 'The caption for the photo post',
                        },
                        {
                                displayName: 'Privacy Level',
                                name: 'privacyLevel',
                                type: 'options',
                                options: [
                                        { name: 'Public', value: 'PUBLIC' },
                                        { name: 'Friends', value: 'FRIENDS' },
                                        { name: 'Private', value: 'PRIVATE' },
                                ],
                                default: 'PUBLIC',
                                description: 'Who can view this post',
                        },
                        {
                                displayName: 'Schedule Time',
                                name: 'scheduleTime',
                                type: 'number',
                                default: 0,
                                description: 'UNIX timestamp for scheduled publication',
                        },
                        {
                                displayName: 'Tags',
                                name: 'tags',
                                type: 'string',
                                default: '',
                                description: 'Comma-separated list of tags for the photo post',
                        },
                ],
        },
];
