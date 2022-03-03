export class ObjectUtil {

  static isNullOrUndefined(s) {
    return s === undefined || s === null;
  }
  
  static isEmpty(s) {
    return ObjectUtil.isNullOrUndefined(s) || s.length === 0;
  }
}