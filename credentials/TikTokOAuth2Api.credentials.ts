import type {
  IAuthenticateGeneric,
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  IHttpRequestHelper,
  IHttpRequestOptions,
  INodeProperties,
} from "n8n-workflow";

export class TikTokOAuth2Api implements ICredentialType {
  name = "tiktokOAuth2Api";
  extends = ["oAuth2Api"];
  displayName = "TikTok OAuth2 API";
  documentationUrl =
    "https://developers.tiktok.com/doc/oauth-user-access-token-management";
  icon = {
    light: "file:icons/TikTok.svg",
    dark: "file:icons/TikTok.dark.svg",
  } as const;

  properties: INodeProperties[] = [
    {
      displayName: "Authorization URL",
      name: "authUrl",
      type: "hidden",
      default: "https://www.tiktok.com/v2/auth/authorize/",
    },
    // IMPORTANT: send client creds in BODY to TikTok token endpoint
    {
      displayName: "Authentication",
      name: "authentication",
      type: "hidden",
      default: "body",
    },
    {
      displayName: "Access Token URL",
      name: "accessTokenUrl",
      type: "hidden",
      default: "https://open.tiktokapis.com/v2/oauth/token/",
    },
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "hidden",
      default: "authorizationCode",
    },
    {
      displayName: "Client Key",
      name: "clientId", // keep n8n's standard name but map to TikTok's client_key later
      type: "string",
      typeOptions: { password: true },
      required: true,
      default: "",
      description: "TikTok Developer portal Client Key.",
    },
    {
      displayName: "Client Secret",
      name: "clientSecret",
      type: "string",
      typeOptions: { password: true },
      required: true,
      default: "",
      description: "TikTok Client Secret.",
    },
    {
      displayName: "Scope",
      name: "scope",
      type: "string",
      // TikTok documents comma-separated scopes; both comma and space work in practice.
      default:
        "video.upload,video.publish,user.info.basic,user.info.profile,user.info.stats",
      description: "Comma-separated scopes.",
    },
    {
      displayName: "Auth URI Query Parameters",
      name: "authQueryParameters",
      type: "hidden",
      // TikTok requires client_key on the authorize URL; n8n will append &scope=...
      default:
        '={{"response_type=code&client_key="+encodeURIComponent($self["clientId"])}}',
    },
  ];

  // Exchange code or refresh token with TikTok’s parameter names and persist as oauthTokenData
  async preAuthentication(
    this: IHttpRequestHelper,
    credentials: ICredentialDataDecryptedObject
  ) {
    const url = "https://open.tiktokapis.com/v2/oauth/token/";
    const oauthData = credentials.oauthTokenData as any; // n8n stores intermediate data here
    const body: Record<string, string> = {
      client_key: credentials.clientId as string,
      client_secret: credentials.clientSecret as string,
    };

    if (oauthData?.code) {
      body.code = oauthData.code;
      body.grant_type = "authorization_code";
      body.redirect_uri = oauthData.redirectUri; // must match the authorize call
    } else if (oauthData?.refresh_token) {
      body.refresh_token = oauthData.refresh_token;
      body.grant_type = "refresh_token";
    }

    const options: IHttpRequestOptions = {
      method: "POST",
      url,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    };

    const resp = (await this.helpers.httpRequest(options)) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
      scope?: string;
      open_id?: string;
      refresh_expires_in?: number;
    };

    // Return in the shape n8n expects: everything under oauthTokenData
    return {
      oauthTokenData: {
        access_token: resp.access_token,
        refresh_token: resp.refresh_token,
        expires_in: resp.expires_in,
        token_type: resp.token_type || "Bearer",
        scope: resp.scope,
        open_id: resp.open_id,
        refresh_expires_in: resp.refresh_expires_in,
      },
    };
  }

  // Let n8n inject the Authorization header from oauthTokenData.access_token
  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        // Pull from oauthTokenData (NOT $credentials.accessToken)
        Authorization: "=Bearer {{$credentials.oauthTokenData.access_token}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://open.tiktokapis.com",
      url: "/v2/user/info/?fields=username",
    },
  };
}
