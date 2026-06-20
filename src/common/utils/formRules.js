/**
 * Element Plus 表单验证规则生成器
 * 根据字段标题动态生成对应的验证规则
 */

/**
 * 文本输入框验证规则
 * @param {string} title 字段中文名
 * @returns {Array} Element Plus form rule 数组
 */
export function inputRule(title) {
  return [
    { required: true, message: '请输入' + title, trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ]
}

/**
 * 下拉选择验证规则
 * @param {string} title 字段中文名
 * @returns {Array} Element Plus form rule 数组
 */
export function selectRule(title) {
  return [{ required: true, message: '请选择' + title, trigger: 'change' }]
}

/**
 * 数字输入验证规则
 * @param {string} title 字段中文名
 * @returns {Array} Element Plus form rule 数组
 */
export function numberRule(title) {
  return [{ type: 'number', required: true, message: title + '不能为空' }]
}

/**
 * 数组选择验证规则
 * @param {string} title 字段中文名
 * @returns {Array} Element Plus form rule 数组
 */
export function arrayRule(title) {
  return [
    {
      type: 'array',
      required: true,
      message: '请选择' + title,
      trigger: 'change'
    }
  ]
}
