import type { INodeProperties } from 'n8n-workflow';

export const userProfileOperations: INodeProperties[] = [
        {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                required: true,
                displayOptions: {
                        show: {
                                resource: ['userProfile'],
                        },
                },
                options: [
                        {
                                name: 'Get User Information',
                                value: 'get',
                                description: 'Get profile information for the authenticated user',
                                action: 'Get user information',
                        },
                ],
                default: 'get',
        },
];

export const userProfileFields: INodeProperties[] = [
        /* -------------------------------------------------------------------------- */
        /*                                userProfile:get                             */
        /* -------------------------------------------------------------------------- */
        {
                displayName: 'Fields',
                name: 'fields',
                type: 'multiOptions',
                default: [],
                required: true,
                displayOptions: {
                        show: {
                                resource: ['userProfile'],
                                operation: ['get'],
                        },
                },
                description: 'Select the profile fields to include in the response',
                options: [
                        {
                                name: 'Avatar URL',
                                value: 'avatar_url',
                        },
                        {
                                name: 'Bio Description',
                                value: 'bio_description',
                        },
                        {
                                name: 'Display Name',
                                value: 'display_name',
                        },
                        {
                                name: 'Follower Count',
                                value: 'follower_count',
                        },
                        {
                                name: 'Following Count',
                                value: 'following_count',
                        },
                        {
                                name: 'Likes Count',
                                value: 'likes_count',
                        },
                        {
                                name: 'Profile Deep Link',
                                value: 'profile_deep_link',
                        },
                        {
                                name: 'Username',
                                value: 'username',
                        },
                        {
                                name: 'Video Count',
                                value: 'video_count',
                        },
                ],
        },
];
