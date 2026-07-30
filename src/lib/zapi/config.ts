export interface ZapiEnvironment {
  [key: string]: string | undefined;
  ZAPI_INSTANCE_ID?: string;
  ZAPI_INSTANCE_TOKEN?: string;
  ZAPI_CLIENT_TOKEN?: string;
}

export interface ZapiConfig {
  instanceId: string;
  instanceToken: string;
  clientToken: string;
}

export type ZapiConfigResult =
  | {
      ok: true;
      config: ZapiConfig;
    }
  | {
      ok: false;
      message: string;
    };

export function readZapiConfig(
  environment: ZapiEnvironment = process.env
): ZapiConfigResult {
  const instanceId = environment.ZAPI_INSTANCE_ID?.trim();
  const instanceToken = environment.ZAPI_INSTANCE_TOKEN?.trim();
  const clientToken = environment.ZAPI_CLIENT_TOKEN?.trim();

  if (!instanceId || !instanceToken || !clientToken) {
    return {
      ok: false,
      message:
        "Configuração da Z-API incompleta. Preencha as variáveis server-side."
    };
  }

  return {
    ok: true,
    config: {
      instanceId,
      instanceToken,
      clientToken
    }
  };
}
