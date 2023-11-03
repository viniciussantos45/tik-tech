type Params = {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
};

export const formatParams = (params: Params) => {
  return '?' + Object.entries(params).map(([key, val]) => {
    if (Array.isArray(val)) {
      return `${key}=${JSON.stringify(val)}`;
    }
    
    return `${key}=${encodeURIComponent(val)}`;
  }).join('&');
};
