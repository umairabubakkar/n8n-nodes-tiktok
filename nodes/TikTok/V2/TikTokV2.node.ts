import {
	NodeConnectionType,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeBaseDescription,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';

import { videoPostFields, videoPostOperations } from './VideoPostDescription'; // Handles video posting
import { photoPostFields, photoPostOperations } from './PhotoPostDescription'; // Handles photo posting
import { postStatusFields, postStatusOperations } from './PostStatusDescription'; // Handles post status
import { userProfileFields, userProfileOperations } from './UserProfileDescription';
import { searchFields, searchOperations } from './SearchDescription';

import { tiktokApiRequest } from './GenericFunctions'; // Adjusted to TikTok API helper functions

export class TikTokV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			version: 2,
			description: 'Upload and manage TikTok videos and photos, and retrieve profile information',
			subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
			defaults: {
				name: 'TikTok',
			},
			inputs: [NodeConnectionType.Main],
			outputs: [NodeConnectionType.Main],
			credentials: [
				{
					name: 'tiktokOAuth2Api', // Adjust to use TikTok credentials
					required: true,
				},
			],
			properties: [
				{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Photo Post',
							value: 'photoPost',
							description: 'Upload a photo to TikTok',
						},
						{
							name: 'Post Status',
							value: 'postStatus',
							description: 'Check the status of a post',
						},
						{
							name: 'Search',
							value: 'search',
							description: 'Search for hashtags or sounds',
						},
						{
							name: 'User Profile',
							value: 'userProfile',
							description: 'Retrieve profile data of a TikTok user',
						},
						{
							name: 'Video Post',
							value: 'videoPost',
							description: 'Upload a video to TikTok',
						},
					],
					default: 'videoPost',
				},
				// VIDEO POST
				...videoPostOperations,
				...videoPostFields,
				// PHOTO POST
				...photoPostOperations,
				...photoPostFields,
				// POST STATUS
				...postStatusOperations,
				...postStatusFields,
				// USER PROFILE
				...userProfileOperations,
				...userProfileFields,
				// SEARCH
				...searchOperations,
				...searchFields,
			],
		};
	}

	methods = {
		loadOptions: {
			// Load additional data for TikTok, if necessary
			async getLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// Example of how you might load options if needed
				const returnData: INodePropertyOptions[] = [];
				const languages = ['English', 'Spanish', 'French']; // Example, change as needed
				for (const language of languages) {
					returnData.push({
						name: language,
						value: language.toLowerCase(),
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'videoPost') {
					if (operation === 'upload') {
						const source = this.getNodeParameter('source', i) as string;
						const privacyLevel = this.getNodeParameter('privacyLevel', i) as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const postInfo: IDataObject = {
							privacy_level: privacyLevel,
						};
						if (additionalFields.title) {
							postInfo.title = additionalFields.title as string;
						}
						if (additionalFields.disableDuet !== undefined) {
							postInfo.disable_duet = additionalFields.disableDuet as boolean;
						}
						if (additionalFields.disableStitch !== undefined) {
							postInfo.disable_stitch = additionalFields.disableStitch as boolean;
						}
						if (additionalFields.disableComment !== undefined) {
							postInfo.disable_comment = additionalFields.disableComment as boolean;
						}
						if (additionalFields.videoCoverTimestampMs !== undefined) {
							postInfo.video_cover_timestamp_ms = additionalFields.videoCoverTimestampMs as number;
						}
						if (additionalFields.brandContentToggle !== undefined) {
							postInfo.brand_content_toggle = additionalFields.brandContentToggle as boolean;
						}
						if (additionalFields.brandOrganicToggle !== undefined) {
							postInfo.brand_organic_toggle = additionalFields.brandOrganicToggle as boolean;
						}
						if (additionalFields.isAigc !== undefined) {
							postInfo.is_aigc = additionalFields.isAigc as boolean;
						}

						const sourceInfo: IDataObject = {
							source,
						};

						if (source === 'PULL_FROM_URL') {
							const videoUrl = this.getNodeParameter('videoUrl', i) as string;
							sourceInfo.video_url = videoUrl;
							const body: IDataObject = {
								post_info: postInfo,
								source_info: sourceInfo,
							};
							responseData = await tiktokApiRequest.call(
								this,
								'POST',
								'/post/publish/video/init/',
								body,
							);
						}

						if (source === 'FILE_UPLOAD') {
							const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
							const item = items[i].binary?.[binaryProperty];
							if (!item) {
								throw new NodeOperationError(
									this.getNode(),
									`No binary data property "${binaryProperty}" set`,
									{ itemIndex: i },
								);
							}
							const dataBuffer = Buffer.from(item.data, 'base64');
							sourceInfo.video_size = dataBuffer.length;
							sourceInfo.chunk_size = dataBuffer.length;
							sourceInfo.total_chunk_count = 1;

							const body: IDataObject = {
								post_info: postInfo,
								source_info: sourceInfo,
							};
							responseData = await tiktokApiRequest.call(
								this,
								'POST',
								'/post/publish/video/init/',
								body,
							);

							const uploadUrl = (responseData as IDataObject).upload_url as string;
							if (!uploadUrl) {
								throw new NodeOperationError(this.getNode(), 'Upload URL not returned');
							}

							await this.helpers.httpRequest({
								method: 'PUT',
								url: uploadUrl,
								body: dataBuffer,
								headers: {
									'Content-Type': item.mimeType || 'video/mp4',
									'Content-Length': dataBuffer.length,
									'Content-Range': `bytes 0-${dataBuffer.length - 1}/${dataBuffer.length}`,
								},
								json: false,
							});
						}
					}
				}

				if (resource === 'photoPost') {
					if (operation === 'upload') {
						let photoUrls = this.getNodeParameter('photoUrls', i) as string | string[];
						if (typeof photoUrls === 'string') {
							photoUrls = photoUrls
								.split(',')
								.map((url) => url.trim())
								.filter((url) => url);
						}
						const photoCoverIndex = this.getNodeParameter('photoCoverIndex', i) as number;
						const postMode = this.getNodeParameter('postMode', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const postInfo: IDataObject = {};
						if (additionalFields.title) {
							postInfo.title = additionalFields.title as string;
						}
						if (additionalFields.description) {
							postInfo.description = additionalFields.description as string;
						}
						if (additionalFields.privacyLevel) {
							postInfo.privacy_level = additionalFields.privacyLevel as string;
						}
						if (additionalFields.disableComment !== undefined) {
							postInfo.disable_comment = additionalFields.disableComment as boolean;
						}
						if (additionalFields.autoAddMusic !== undefined) {
							postInfo.auto_add_music = additionalFields.autoAddMusic as boolean;
						}
						if (additionalFields.brandContentToggle !== undefined) {
							postInfo.brand_content_toggle = additionalFields.brandContentToggle as boolean;
						}
						if (additionalFields.brandOrganicToggle !== undefined) {
							postInfo.brand_organic_toggle = additionalFields.brandOrganicToggle as boolean;
						}
						if (postMode === 'DIRECT_POST' && postInfo.privacy_level === undefined) {
							throw new NodeOperationError(
								this.getNode(),
								'Privacy Level must be set for Direct Post',
								{ itemIndex: i },
							);
						}
						const body: IDataObject = {
							post_info: postInfo,
							source_info: {
								source: 'PULL_FROM_URL',
								photo_cover_index: photoCoverIndex,
								photo_images: photoUrls,
							},
							post_mode: postMode,
							media_type: 'PHOTO',
						};
						responseData = await tiktokApiRequest.call(
							this,
							'POST',
							'/post/publish/content/init/',
							body,
						);
					}
				}

				if (resource === 'postStatus') {
					if (operation === 'get') {
						const publishId = this.getNodeParameter('publishId', i) as string;
						const body = { publish_id: publishId } as IDataObject;
						responseData = await tiktokApiRequest.call(
							this,
							'POST',
							'/post/publish/status/fetch/',
							body,
						);
					}
				}

				if (resource === 'search') {
					const query = this.getNodeParameter('query', i) as string;
					const cursor = this.getNodeParameter('cursor', i, 0) as number;
					const limit = this.getNodeParameter('limit', i, 20) as number;
					const qs: IDataObject = { query, cursor, max_count: limit };
					if (operation === 'hashtag') {
						responseData = await tiktokApiRequest.call(this, 'GET', '/hashtag/search/', {}, qs);
						responseData = responseData.hashtags ?? responseData.results ?? responseData;
					}
					if (operation === 'sound') {
						responseData = await tiktokApiRequest.call(this, 'GET', '/sound/search/', {}, qs);
						responseData = responseData.sounds ?? responseData.results ?? responseData;
					}
				}

				if (resource === 'userProfile') {
					if (operation === 'get') {
						const fields = this.getNodeParameter('fields', i) as string[];
						if (!fields?.length) {
							throw new NodeOperationError(
								this.getNode(),
								'User Profile: "Fields" must include at least one selection.',
								{ itemIndex: i },
							);
						}
						const qs: IDataObject = { fields: fields.join(',') };
						responseData = await tiktokApiRequest.call(this, 'GET', '/user/info/', {}, qs);
					}
					if (operation === 'analytics') {
						const selectedMetrics = this.getNodeParameter('metrics', i) as string[];
						if (!selectedMetrics?.length) {
							throw new NodeOperationError(
								this.getNode(),
								'User Profile: "Metrics" must include at least one selection.',
							);
						}

						const metricFieldMap: IDataObject = {
							followers: 'follower_count',
							likes: 'likes_count',
							views: 'video_count',
						};
						const fieldList = selectedMetrics
							.map((metric) => metricFieldMap[metric] as string)
							.filter(Boolean);
						const qs: IDataObject = { fields: fieldList.join(',') };

						responseData = await tiktokApiRequest.call(this, 'GET', '/user/info/', {}, qs);

						const user = (responseData as IDataObject).user as IDataObject | undefined;
						const metricsData: IDataObject = {};
						if (user) {
							for (const metric of selectedMetrics) {
								const fieldName = metricFieldMap[metric] as string;
								if (user[fieldName] !== undefined) {
									metricsData[metric] = user[fieldName];
								}
							}
						}
						responseData = metricsData;
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = {
						json: {
							error: (error as JsonObject).message,
						},
					};
					returnData.push(executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
