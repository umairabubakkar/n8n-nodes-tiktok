import type { INodeProperties } from 'n8n-workflow';

export const videoPostOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['videoPost'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a video to TikTok',
				action: 'Upload video',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a video from TikTok',
				action: 'Delete video',
			},
		],
		default: 'upload',
	},
];

export const videoPostFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                videoPost:upload                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Video File',
		name: 'videoFile',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['upload'],
			},
		},
		description: 'The path to the video file to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['upload'],
			},
		},
                options: [
                        {
                                displayName: 'Caption',
                                name: 'caption',
                                type: 'string',
                                default: '',
                                description: 'The caption for the video post',
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
                                description: 'Comma-separated list of tags for the video post',
                        },
                        {
                                displayName: 'Title',
                                name: 'title',
                                type: 'string',
                                default: '',
                                description: 'The title for the video post',
                        },
                ],
        },
	/* -------------------------------------------------------------------------- */
	/*                                videoPost:delete                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Video ID',
		name: 'videoId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['videoPost'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the video to delete',
	},
];
