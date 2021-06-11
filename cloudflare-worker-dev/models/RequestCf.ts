export interface RequestCf {
  /**
   * In addition to the properties on the standard Request object,
   * the cf object contains extra information about the request provided
   * by Cloudflare's edge.
   *
   * Note: Currently, settings in the cf object cannot be accessed in the
   * playground.
   */
  /**
   *  (e.g. 395747)
   */
  asn: number
  clientAcceptEncoding: string
  edgeRequestKeepAliveStatus: 0 | 1
  botManagement?: {
    score: number
    staticResource: boolean
    verifiedBot: boolean
  }
  city?: string
  clientTcpRtt: number
  clientTrustScore?: number
  /**
   * The three-letter airport code of the data center that the request
   * hit. (e.g. "DFW")
   */
  colo: string
  continent?: string
  /**
   * The two-letter country code in the request. This is the same value
   * as that provided in the CF-IPCountry header. (e.g. "US")
   */
  country: string
  httpProtocol: string
  latitude?: string
  longitude?: string
  /**
   * DMA metro code from which the request was issued, e.g. "635"
   */
  metroCode?: string
  postalCode?: string
  /**
   * e.g. "Texas"
   */
  region?: string
  /**
   * e.g. "TX"
   */
  regionCode?: string
  /**
   * e.g. "weight=256;exclusive=1"
   */
  requestPriority: string
  /**
   * e.g. "America/Chicago"
   */
  timezone?: string
  tlsVersion: string
  tlsCipher: string
  tlsClientAuth: Record<string, string>
  tlsExportedAuthenticator: Record<string, string>
}

export function example_cf(): RequestCf {
  return {
    asn: 9009,
    city: 'New York',
    clientAcceptEncoding: 'gzip, deflate',
    clientTcpRtt: 83,
    colo: 'EWR',
    continent: 'NA',
    country: 'US',
    edgeRequestKeepAliveStatus: 1,
    httpProtocol: 'HTTP/1.1',
    latitude: '40.71570',
    longitude: '-74.00000',
    metroCode: '501',
    postalCode: '10013',
    region: 'New York',
    regionCode: 'NY',
    requestPriority: '',
    timezone: 'America/New_York',
    tlsCipher: 'AEAD-AES256-GCM-SHA384',
    tlsClientAuth: {
      certFingerprintSHA1: '',
      certFingerprintSHA256: '',
      certIssuerDN: '',
      certIssuerDNLegacy: '',
      certIssuerDNRFC2253: '',
      certIssuerSKI: '',
      certIssuerSerial: '',
      certNotAfter: '',
      certNotBefore: '',
      certPresented: '0',
      certRevoked: '0',
      certSKI: '',
      certSerial: '',
      certSubjectDN: '',
      certSubjectDNLegacy: '',
      certSubjectDNRFC2253: '',
      certVerified: 'NONE',
    },
    tlsExportedAuthenticator: {
      clientFinished: 'b7561d5d8703a',
      clientHandshake: 'fa552e3ce2636',
      serverFinished: 'e81f70f5b8de4c',
      serverHandshake: '0f186e19f0a82',
    },
    tlsVersion: 'TLSv1.3',
  }
}
