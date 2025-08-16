import type { INodeProperties } from 'n8n-workflow';

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				name: 'Search Hashtags',
				value: 'hashtag',
				description: 'Search for hashtags',
				action: 'Search hashtags',
			},
			{
				name: 'Search Sounds',
				value: 'sound',
				description: 'Search for sounds',
				action: 'Search sounds',
			},
		],
		default: 'hashtag',
	},
];

export const searchFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['hashtag', 'sound'],
			},
		},
		description: 'Text to search for',
	},
	{
		displayName: 'Cursor',
		name: 'cursor',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['hashtag', 'sound'],
			},
		},
		description: 'Cursor for pagination',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['hashtag', 'sound'],
			},
		},
		description: 'Max number of results to return',
	},
];
