import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

type OAuthData = {
	code?: string;
	redirectUri?: string;
	refresh_token?: string;

	// Callback passthroughs
	callbackQueryParameters?: Record<string, string>;
	rawQueryString?: string;

	// CSRF expectations you stash at kickoff
	expected_state_token?: string;
	expected_state_cid?: string;
	expected_state_max_age_ms?: number;

	// Optional cached user info
	user?: {
		open_id?: string;
		username?: string;
		display_name?: string;
		avatar_url?: string;
	};

	// Token fields (persisted by preAuthentication)
	access_token?: string;
};

// ---------- Helper functions (TOP LEVEL, not methods) ----------
async function fetchUserInfo(http: IHttpRequestHelper, accessToken: string) {
	const resp = await http.helpers.httpRequest({
		method: 'GET',
		url: 'https://open.tiktokapis.com/v2/user/info/',
		qs: { fields: 'open_id,username,display_name,avatar_url' },
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	const u = resp?.data?.user ?? {};
	return {
		open_id: u.open_id as string | undefined,
		username: u.username as string | undefined,
		display_name: u.display_name as string | undefined,
		avatar_url: u.avatar_url as string | undefined,
	};
}

// ---------------- Credential ----------------

export class TikTokOAuth2Api implements ICredentialType {
	name = 'tiktokOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'TikTok OAuth2 API';
	documentationUrl = 'https://developers.tiktok.com/doc/oauth-user-access-token-management';
	icon = {
		light: 'file:icons/TikTok.svg',
		dark: 'file:icons/TikTok.dark.svg',
	} as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://www.tiktok.com/v2/auth/authorize/',
		},

		// TikTok wants client creds in the token request BODY
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},

		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://open.tiktokapis.com/v2/oauth/token/',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},

		{
			displayName: 'Client Key',
			name: 'clientId',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'TikTok Client Key (client_key).',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'TikTok Client Secret.',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'video.upload,video.publish,user.info.basic,user.info.profile,user.info.stats',
			description: 'Comma-separated scopes.',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '={{"response_type=code&client_key="+encodeURIComponent($self["clientId"])}}',
		},

		// Optional CSRF inputs via UI
		{
			displayName: 'Expected State Token (optional)',
			name: 'expectedStateToken',
			typeOptions: { password: true },
			type: 'string',
			default: '',
		},
		{
			displayName: 'Expected State CID (optional)',
			name: 'expectedStateCid',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Require State',
			name: 'stateRequired',
			type: 'boolean',
			default: true,
		},
		{
			displayName: 'Max State Age (minutes)',
			name: 'stateMaxAgeMinutes',
			type: 'number',
			default: 10,
		},
		{
			displayName: 'Auth Body Extras',
			name: 'additionalBodyProperties',
			type: 'hidden',
			// mappe client_key vers clientId; laisse client_secret à n8n (ou redonde, ça ne gêne pas)
			default: '={{JSON.stringify({ client_key: $self["clientId"] })}}',
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const url = 'https://open.tiktokapis.com/v2/oauth/token/';
		const oauthData = credentials.oauthTokenData as OAuthData | undefined;

		// 1) Si on a un refresh_token: on refresh
		if (oauthData?.refresh_token) {
			const resp = (await this.helpers.httpRequest({
				method: 'POST',
				url,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					client_key: credentials.clientId as string,
					client_secret: credentials.clientSecret as string,
					grant_type: 'refresh_token',
					refresh_token: oauthData.refresh_token,
				}).toString(),
			})) as any;

			const user =
				oauthData.user ?? (await fetchUserInfo(this, resp.access_token).catch(() => undefined));

			return {
				oauthTokenData: {
					access_token: resp.access_token,
					refresh_token: resp.refresh_token ?? oauthData.refresh_token,
					expires_in: resp.expires_in,
					token_type: resp.token_type || 'Bearer',
					scope: resp.scope,
					open_id: resp.open_id,
					refresh_expires_in: resp.refresh_expires_in,
					// tu peux recopier ici des infos persistées si tu y tiens
					user,
				},
			};
		}

		// 2) Sinon: ne rien faire — le premier échange a été fait par n8n au callback.
		return {};
	}

	// Sign requests from saved token
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.oauthTokenData.access_token}}',
			},
		},
	};

	// n8n typing: must be a plain request definition (not a function)
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://open.tiktokapis.com',
			url: '/v2/user/info/?fields=open_id,username,display_name',
		},
	};
}
