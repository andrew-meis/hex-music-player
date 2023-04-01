import Prism, { printWarnings } from '@zwolf/prism';

const createParser = <T>(
  name: string,
  transformer: ($data: Prism<any>) => T,
) => (data: Record<string, any>): T => {
    const $data = new Prism(data);
    const result = $data.transform(transformer).value;
    printWarnings($data.warnings, name);
    return result;
  };

// eslint-disable-next-line import/prefer-default-export
export { createParser };
