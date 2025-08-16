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
} from "n8n-workflow";

import { videoPostFields, videoPostOperations } from "./VideoPostDescription"; // Assume VideoPostDescription file handles video posting
import { photoPostFields, photoPostOperations } from "./PhotoPostDescription"; // Assume PhotoPostDescription file handles photo posting
import {
  userProfileFields,
  userProfileOperations,
} from "./UserProfileDescription";
import { searchFields, searchOperations } from "./SearchDescription";

import { tiktokApiRequest } from "./GenericFunctions"; // Adjusted to TikTok API helper functions

export class TikTokV2 implements INodeType {
  description: INodeTypeDescription;

  constructor(baseDescription: INodeTypeBaseDescription) {
    this.description = {
      ...baseDescription,
      version: 2,
      description:
        "Upload and manage TikTok videos and photos, and retrieve profile information",
      subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
      defaults: {
        name: "TikTok",
      },
      inputs: [NodeConnectionType.Main],
      outputs: [NodeConnectionType.Main],
      credentials: [
        {
          name: "tiktokOAuth2Api", // Adjust to use TikTok credentials
          required: true,
        },
      ],
      properties: [
        {
          displayName: "Resource",
          name: "resource",
          type: "options",
          noDataExpression: true,
          options: [
            {
              name: "Video Post",
              value: "videoPost",
              description: "Upload a video to TikTok",
            },
            {
              name: "Photo Post",
              value: "photoPost",
              description: "Upload a photo to TikTok",
            },
            {
              name: "User Profile",
              value: "userProfile",
              description: "Retrieve profile data of a TikTok user",
            },
            {
              name: "Search",
              value: "search",
              description: "Search for hashtags or sounds",
            },
          ],
          default: "videoPost",
        },
        // VIDEO POST
        ...videoPostOperations,
        ...videoPostFields,
        // PHOTO POST
        ...photoPostOperations,
        ...photoPostFields,
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
      async getLanguages(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        // Example of how you might load options if needed
        const returnData: INodePropertyOptions[] = [];
        const languages = ["English", "Spanish", "French"]; // Example, change as needed
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
    const resource = this.getNodeParameter("resource", 0);
    const operation = this.getNodeParameter("operation", 0);

    for (let i = 0; i < length; i++) {
      try {
        if (resource === "videoPost") {
          if (operation === "upload") {
            const videoFile = this.getNodeParameter(
              "videoFile",
              i
            ) as IDataObject;
            const body: IDataObject = {
              videoFile, // Adjust to match the TikTok video file format
            };
            responseData = await tiktokApiRequest.call(
              this,
              "POST",
              "/video/upload",
              body
            );
          } else if (operation === "analytics") {
            const videoId = this.getNodeParameter("videoId", i) as string;
            const metrics = this.getNodeParameter("metrics", i) as string[];
            if (!metrics?.length) {
              throw new NodeOperationError(
                this.getNode(),
                'Video Post: "Metrics" must include at least one selection.',
                { itemIndex: i }
              );
            }
            const qs: IDataObject = {
              post_id: videoId,
              metrics: metrics.join(","),
            };
            responseData = await tiktokApiRequest.call(
              this,
              "GET",
              "/post/analytics/",
              {},
              qs
            );
          }
        }

		for (let i = 0; i < length; i++) {
			try {
                                if (resource === 'videoPost') {
                                        if (operation === 'upload') {
                                                const videoFile = this.getNodeParameter('videoFile', i) as IDataObject;
                                                const additionalFields =
                                                        this.getNodeParameter('additionalFields', i) as IDataObject;
                                                const postInfo: IDataObject = {};
                                                if (additionalFields.title) {
                                                        postInfo.title = additionalFields.title as string;
                                                }
                                                if (additionalFields.tags) {
                                                        postInfo.tags = additionalFields.tags as string;
                                                }
                                                if (additionalFields.caption) {
                                                        postInfo.caption = additionalFields.caption as string;
                                                }
                                                if (additionalFields.privacyLevel) {
                                                        postInfo.privacy_level = additionalFields.privacyLevel as string;
                                                }
                                                if (additionalFields.scheduleTime !== undefined) {
                                                        const scheduleTime = Number(additionalFields.scheduleTime);
                                                        if (
                                                                Number.isNaN(scheduleTime) ||
                                                                !Number.isInteger(scheduleTime)
                                                        ) {
                                                                throw new NodeOperationError(
                                                                        this.getNode(),
                                                                        'Schedule Time must be a valid UNIX timestamp',
                                                                );
                                                        }
                                                        // Treat 0 as "not set" to avoid scheduling at the Unix epoch
                                                        if (scheduleTime > 0) {
                                                                postInfo.schedule_time = scheduleTime;
                                                        }
                                                }
                                                const body: IDataObject = {
                                                        videoFile, // Adjust to match the TikTok video file format
                                                        post_info: postInfo,
                                                };
                                                responseData = await tiktokApiRequest.call(
                                                        this,
                                                        'POST',
                                                        '/video/upload',
                                                        body,
                                                );
                                        }
                                }

        if (resource === 'photoPost') {
                if (operation === 'upload') {
                        const photoUrl = this.getNodeParameter('photoUrl', i) as string;
                        const additionalFields =
                                this.getNodeParameter('additionalFields', i) as IDataObject;
                        const postInfo: IDataObject = {};
                        if (additionalFields.caption) {
                                postInfo.caption = additionalFields.caption as string;
                        }
                        if (additionalFields.tags) {
                                postInfo.tags = additionalFields.tags as string;
                        }
                        if (additionalFields.privacyLevel) {
                                postInfo.privacy_level = additionalFields.privacyLevel as string;
                        }
                        if (additionalFields.scheduleTime !== undefined) {
                                const scheduleTime = Number(additionalFields.scheduleTime);
                                if (
                                        Number.isNaN(scheduleTime) ||
                                        !Number.isInteger(scheduleTime)
                                ) {
                                        throw new NodeOperationError(
                                                this.getNode(),
                                                'Schedule Time must be a valid UNIX timestamp',
                                        );
                                }
                                // Treat 0 as "not set"
                                if (scheduleTime > 0) {
                                        postInfo.schedule_time = scheduleTime;
                                }
                        }
                        const body: IDataObject = {
                                post_info: postInfo,
                                source_info: {
                                        source: 'PULL_FROM_URL',
                                        photo_cover_index: 1,
                                        photo_images: [photoUrl],
                                },
                                post_mode: 'MEDIA_UPLOAD',
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

        if (resource === "search") {
          const query = this.getNodeParameter("query", i) as string;
          const cursor = this.getNodeParameter("cursor", i, 0) as number;
          const limit = this.getNodeParameter("limit", i, 20) as number;
          const qs: IDataObject = { keyword: query, cursor, max_count: limit };
          if (operation === "hashtag") {
            responseData = await tiktokApiRequest.call(
              this,
              "GET",
              "/search/hashtag/",
              {},
              qs
            );
            responseData =
              responseData.hashtags ?? responseData.results ?? responseData;
          }
          if (operation === "sound") {
            responseData = await tiktokApiRequest.call(
              this,
              "GET",
              "/search/sound/",
              {},
              qs
            );
            responseData =
              responseData.sounds ?? responseData.results ?? responseData;
          }
        }

        if (resource === "userProfile") {
          if (operation === "get") {
            const fields = this.getNodeParameter("fields", i) as string[];
            if (!fields?.length) {
              throw new NodeOperationError(
                this.getNode(),
                'User Profile: "Fields" must include at least one selection.',
                { itemIndex: i }
              );
            }
            const qs: IDataObject = { fields: fields.join(",") };
            responseData = await tiktokApiRequest.call(
              this,
              "GET",
              "/user/info/",
              {},
              qs
            );
          }
          if (operation === "analytics") {
            const selectedMetrics = this.getNodeParameter(
              "metrics",
              i
            ) as string[];
            if (!selectedMetrics?.length) {
              throw new NodeOperationError(
                this.getNode(),
                'User Profile: "Metrics" must include at least one selection.'
              );
            }

            const metricFieldMap: IDataObject = {
              followers: "follower_count",
              likes: "likes_count",
              views: "video_count",
            };
            const fieldList = selectedMetrics
              .map((metric) => metricFieldMap[metric] as string)
              .filter(Boolean);
            const qs: IDataObject = { fields: fieldList.join(",") };

            responseData = await tiktokApiRequest.call(
              this,
              "GET",
              "/user/info/",
              {},
              qs
            );

            const user = (responseData as IDataObject).user as
              | IDataObject
              | undefined;
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
          { itemData: { item: i } }
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
