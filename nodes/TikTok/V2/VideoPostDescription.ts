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
                       {
                               name: 'Analytics',
                               value: 'analytics',
                               description: 'Retrieve analytics for a TikTok video',
                               action: 'Get video analytics',
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
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title for the video post',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags for the video post',
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
       /* -------------------------------------------------------------------------- */
       /*                              videoPost:analytics                           */
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
                               operation: ['analytics'],
                       },
               },
               description: 'The ID of the video to retrieve analytics for',
       },
       {
               displayName: 'Metrics',
               name: 'metrics',
               type: 'multiOptions',
               default: [],
               required: true,
               displayOptions: {
                       show: {
                               resource: ['videoPost'],
                               operation: ['analytics'],
                       },
               },
               options: [
                       {
                               name: 'Views',
                               value: 'views',
                       },
                       {
                               name: 'Likes',
                               value: 'likes',
                       },
                       {
                               name: 'Comments',
                               value: 'comments',
                       },
                       {
                               name: 'Shares',
                               value: 'shares',
                       },
               ],
               description: 'Select the metrics to retrieve',
       },
];
