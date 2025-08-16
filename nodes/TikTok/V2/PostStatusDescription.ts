import type { INodeProperties } from 'n8n-workflow';

export const postStatusOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['postStatus'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Check the status of a post',
        action: 'Get post status',
      },
    ],
    default: 'get',
  },
];

export const postStatusFields: INodeProperties[] = [
  {
    displayName: 'Publish ID',
    name: 'publishId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['postStatus'],
        operation: ['get'],
      },
    },
    description: 'Identifier returned when initiating the post upload',
  },
];
