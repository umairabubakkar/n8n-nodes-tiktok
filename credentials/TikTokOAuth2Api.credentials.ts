import type {
        IAuthenticateGeneric,
        ICredentialDataDecryptedObject,
        ICredentialTestRequest,
        ICredentialType,
        IHttpRequestHelper,
        INodeProperties,
} from 'n8n-workflow';

export class TikTokOAuth2Api implements ICredentialType {
        name = 'tiktokOAuth2Api';

        extends = ['oAuth2Api'];

        displayName = 'TikTok OAuth2 API';

        documentationUrl = 'https://developers.tiktok.com/doc/oauth-user-access-token-management';

        icon = { light: 'file:icons/TikTok.svg', dark: 'file:icons/TikTok.dark.svg' } as const;

        properties: INodeProperties[] = [
                {
                        displayName: 'Grant Type',
                        name: 'grantType',
                        type: 'hidden',
                        default: 'authorizationCode',
                },
                {
                        displayName: 'Authorization URL',
                        name: 'authUrl',
                        type: 'hidden',
                        default: 'https://www.tiktok.com/v2/auth/authorize/',
                },
                {
                        displayName: 'Access Token URL',
                        name: 'accessTokenUrl',
                        type: 'hidden',
                        default: 'https://open.tiktokapis.com/v2/oauth/token/',
                },
                {
                        displayName: 'Client Key',
                        name: 'clientId',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The unique key provided to your application in TikTok Developer portal.',
                },
                {
                        displayName: 'Client Secret',
                        name: 'clientSecret',
                        type: 'string',
                        typeOptions: {
                                password: true,
                        },
                        required: true,
                        default: '',
                        description: 'The secret key associated with your application.',
                },
                {
                        displayName: 'Scope',
                        name: 'scope',
                        type: 'string',
                        default: '',
                },
                {
                        displayName: 'Auth URI Query Parameters',
                        name: 'authQueryParameters',
                        type: 'string',
                        default: '',
                },
        ];

        // Function to handle custom token requests using TikTok specific parameter names
        async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
                const url = 'https://open.tiktokapis.com/v2/oauth/token/';
                const oauthData = credentials.oauthTokenData as any;

                const body: Record<string, string> = {
                        client_key: credentials.clientId as string,
                        client_secret: credentials.clientSecret as string,
                };

                if (oauthData?.code) {
                        body.code = oauthData.code;
                        body.grant_type = 'authorization_code';
                        body.redirect_uri = oauthData.redirectUri;
                } else {
                        body.refresh_token = oauthData?.refreshToken as string;
                        body.grant_type = 'refresh_token';
                }

                const { access_token, refresh_token } = (await this.helpers.httpRequest({
                        method: 'POST',
                        url,
                        body,
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                        },
                })) as { access_token: string; refresh_token: string };

                return {
                        accessToken: access_token,
                        refreshToken: refresh_token,
                };
        }

	// OAuth2 authenticate method using the obtained access token
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	// Credential test request to validate connection
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://open.tiktokapis.com',
			url: '/v2/user/info/',
		},
	};
}
