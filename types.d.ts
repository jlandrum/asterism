interface ThemeData {
  name: string;
  author?: string;
  copyright: string;
  namespace: string;
  description?: string;
  version?: string;
  textDomain: string;
  "style.css": {
    uri?: string;
    authorUri?: string;
    license?: string;
    licenseUri?: string;
  };
}