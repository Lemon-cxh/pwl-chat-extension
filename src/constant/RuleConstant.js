export function inputRule(title) {
  return [{ required: true, message: '请输入' + title, trigger: 'blur' },
  { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }]
}

export function selectRule(title) {
  return [{ required: true, message: '请选择' + title, trigger: 'change' }]
}

export function numberRule(title) {
  return [{ type: 'number', required: true, message: title + '不能为空'}]
}

export function arrayRule(title) {
  return [{ type: 'array', required: true, message: '请选择' + title, trigger: 'change' }]
}